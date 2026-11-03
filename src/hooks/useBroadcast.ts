import { useState, useCallback, useRef, useEffect } from 'react'
import { Room, RoomEvent, Track, createLocalTracks } from 'livekit-client'
import { LIVEKIT_URL, requestLiveKitToken } from '../lib/livekit'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Broadcast } from '../types/database'

interface UseBroadcastReturn {
  // State
  isConnected: boolean
  isBroadcasting: boolean
  isMicEnabled: boolean
  audioLevel: number
  duration: number
  listenerCount: number
  connectionState: string
  currentBroadcast: Broadcast | null
  error: string | null

  // Mic
  availableMics: MediaDeviceInfo[]
  selectedMicId: string | null
  setSelectedMicId: (id: string) => void
  testMic: () => Promise<void>
  stopMicTest: () => void
  isTesting: boolean

  // Actions
  startBroadcast: (channelId: string, programId?: string, title?: string) => Promise<void>
  stopBroadcast: () => Promise<void>
  toggleMic: () => void
}

export function useBroadcast(): UseBroadcastReturn {
  const { profile } = useAuth()
  const roomRef = useRef<Room | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const testStreamRef = useRef<MediaStream | null>(null)

  const [isConnected, setIsConnected] = useState(false)
  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const [isMicEnabled, setIsMicEnabled] = useState(true)
  const [audioLevel, setAudioLevel] = useState(0)
  const [duration, setDuration] = useState(0)
  const [listenerCount, setListenerCount] = useState(0)
  const [connectionState, setConnectionState] = useState('disconnected')
  const [currentBroadcast, setCurrentBroadcast] = useState<Broadcast | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [availableMics, setAvailableMics] = useState<MediaDeviceInfo[]>([])
  const [selectedMicId, setSelectedMicId] = useState<string | null>(null)
  const [isTesting, setIsTesting] = useState(false)

  // Enumerate microphones
  useEffect(() => {
    async function getMics() {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        const devices = await navigator.mediaDevices.enumerateDevices()
        const mics = devices.filter((d) => d.kind === 'audioinput')
        setAvailableMics(mics)
        if (mics.length > 0 && !selectedMicId) {
          setSelectedMicId(mics[0].deviceId)
        }
      } catch {
        setError('No se pudo acceder al micrófono. Verificá los permisos del navegador.')
      }
    }
    getMics()
  }, [])

  // Audio level monitoring
  const monitorAudioLevel = useCallback((stream: MediaStream) => {
    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaStreamSource(stream)
    analyser.fftSize = 256
    source.connect(analyser)

    audioContextRef.current = audioContext
    analyserRef.current = analyser

    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    function updateLevel() {
      if (!analyserRef.current) return
      analyserRef.current.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length
      setAudioLevel(Math.round((average / 255) * 100))
      animationFrameRef.current = requestAnimationFrame(updateLevel)
    }
    updateLevel()
  }, [])

  // Test microphone
  const testMic = useCallback(async () => {
    try {
      stopMicTest()
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedMicId ? { exact: selectedMicId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      testStreamRef.current = stream
      monitorAudioLevel(stream)
      setIsTesting(true)
    } catch {
      setError('No se pudo acceder al micrófono')
    }
  }, [selectedMicId, monitorAudioLevel])

  const stopMicTest = useCallback(() => {
    if (testStreamRef.current) {
      testStreamRef.current.getTracks().forEach((t) => t.stop())
      testStreamRef.current = null
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
      analyserRef.current = null
    }
    setAudioLevel(0)
    setIsTesting(false)
  }, [])

  // Start broadcast
  const startBroadcast = useCallback(
    async (channelId: string, programId?: string, title?: string) => {
      if (!profile) {
        setError('Debés iniciar sesión para transmitir')
        return
      }

      stopMicTest()
      setError(null)
      setConnectionState('connecting')

      try {
        // Check for existing live broadcast
        const { data: existingBroadcast } = await supabase
          .from('broadcasts')
          .select('id')
          .eq('status', 'live')
          .maybeSingle()

        if (existingBroadcast) {
          // Check if simultaneous broadcasts are allowed
          const { data: settings } = await supabase
            .from('radio_settings')
            .select('allow_simultaneous_broadcasts')
            .limit(1)
            .maybeSingle()

          if (!settings?.allow_simultaneous_broadcasts) {
            setError('Ya hay una transmisión en curso. No se permiten transmisiones simultáneas.')
            setConnectionState('disconnected')
            return
          }
        }

        const roomName = `radio-${channelId}-${Date.now()}`

        // Create broadcast record
        const { data: broadcast, error: dbError } = await supabase
          .from('broadcasts')
          .insert({
            channel_id: channelId,
            program_id: programId || null,
            started_by: profile.id,
            title: title || 'Transmisión en vivo',
            status: 'live',
            livekit_room_name: roomName,
          })
          .select()
          .single()

        if (dbError || !broadcast) {
          throw new Error('Error al crear la transmisión en la base de datos')
        }

        // Update program status if linked
        if (programId) {
          await supabase
            .from('programs')
            .update({ status: 'live' })
            .eq('id', programId)
        }

        // Get LiveKit token
        const token = await requestLiveKitToken({
          roomName,
          participantName: profile.display_name,
          participantIdentity: profile.id,
          canPublish: true,
        })

        // Connect to LiveKit room
        const room = new Room({
          audioCaptureDefaults: {
            deviceId: selectedMicId || undefined,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })

        room.on(RoomEvent.Disconnected, () => {
          setIsConnected(false)
          setConnectionState('disconnected')
        })

        room.on(RoomEvent.Reconnecting, () => {
          setConnectionState('reconnecting')
        })

        room.on(RoomEvent.Reconnected, () => {
          setConnectionState('connected')
        })

        room.on(RoomEvent.ParticipantConnected, () => {
          setListenerCount(room.numParticipants - 1)
        })

        room.on(RoomEvent.ParticipantDisconnected, () => {
          setListenerCount(Math.max(0, room.numParticipants - 2))
        })

        await room.connect(LIVEKIT_URL, token)

        // Publish audio track
        const tracks = await createLocalTracks({
          audio: {
            deviceId: selectedMicId || undefined,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        })

        for (const track of tracks) {
          await room.localParticipant.publishTrack(track)
          if (track.kind === Track.Kind.Audio) {
            const mediaStream = new MediaStream([track.mediaStreamTrack])
            monitorAudioLevel(mediaStream)
          }
        }

        roomRef.current = room
        setCurrentBroadcast(broadcast)
        setIsConnected(true)
        setIsBroadcasting(true)
        setConnectionState('connected')
        setDuration(0)

        // Start duration timer
        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1)
        }, 1000)
      } catch (err) {
        console.error('Broadcast error:', err)
        setError(err instanceof Error ? err.message : 'Error al iniciar la transmisión')
        setConnectionState('disconnected')
      }
    },
    [profile, selectedMicId, monitorAudioLevel, stopMicTest]
  )

  // Stop broadcast
  const stopBroadcast = useCallback(async () => {
    try {
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      // Stop animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }

      // Disconnect from LiveKit
      if (roomRef.current) {
        roomRef.current.disconnect()
        roomRef.current = null
      }

      // Clean up audio monitoring
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
        analyserRef.current = null
      }

      // Update broadcast record
      if (currentBroadcast) {
        await supabase
          .from('broadcasts')
          .update({
            status: 'ended',
            ended_at: new Date().toISOString(),
            duration_seconds: duration,
          })
          .eq('id', currentBroadcast.id)

        // Update program status if linked
        if (currentBroadcast.program_id) {
          await supabase
            .from('programs')
            .update({ status: 'completed' })
            .eq('id', currentBroadcast.program_id)
        }
      }

      setIsConnected(false)
      setIsBroadcasting(false)
      setIsMicEnabled(true)
      setAudioLevel(0)
      setDuration(0)
      setListenerCount(0)
      setConnectionState('disconnected')
      setCurrentBroadcast(null)
    } catch (err) {
      console.error('Error stopping broadcast:', err)
      setError('Error al finalizar la transmisión')
    }
  }, [currentBroadcast, duration])

  // Toggle mic
  const toggleMic = useCallback(() => {
    if (roomRef.current) {
      const enabled = !isMicEnabled
      roomRef.current.localParticipant.setMicrophoneEnabled(enabled)
      setIsMicEnabled(enabled)
      if (!enabled) setAudioLevel(0)
    }
  }, [isMicEnabled])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (roomRef.current) roomRef.current.disconnect()
      if (audioContextRef.current) audioContextRef.current.close()
      if (testStreamRef.current) testStreamRef.current.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return {
    isConnected,
    isBroadcasting,
    isMicEnabled,
    audioLevel,
    duration,
    listenerCount,
    connectionState,
    currentBroadcast,
    error,
    availableMics,
    selectedMicId,
    setSelectedMicId,
    testMic,
    stopMicTest,
    isTesting,
    startBroadcast,
    stopBroadcast,
    toggleMic,
  }
}
