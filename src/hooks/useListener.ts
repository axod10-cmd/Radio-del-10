import { useState, useCallback, useRef, useEffect } from 'react'
import { Room, RoomEvent, Track, type RemoteTrack, type RemoteTrackPublication } from 'livekit-client'
import { LIVEKIT_URL, requestLiveKitToken } from '../lib/livekit'
import { generateSessionId } from '../utils/sanitize'

interface UseListenerReturn {
  isConnected: boolean
  isPlaying: boolean
  volume: number
  connectionState: string
  error: string | null
  connect: (roomName: string) => Promise<void>
  disconnect: () => void
  setVolume: (v: number) => void
  togglePlay: () => void
}

export function useListener(): UseListenerReturn {
  const roomRef = useRef<Room | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(80)
  const [connectionState, setConnectionState] = useState('disconnected')
  const [error, setError] = useState<string | null>(null)

  const connect = useCallback(async (roomName: string) => {
    setError(null)
    setConnectionState('connecting')

    try {
      const sessionId = generateSessionId()
      const token = await requestLiveKitToken({
        roomName,
        participantName: `Oyente-${sessionId.slice(-6)}`,
        participantIdentity: sessionId,
        canPublish: false,
      })

      const room = new Room()

      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, _pub: RemoteTrackPublication) => {
        if (track.kind === Track.Kind.Audio) {
          const element = track.attach()
          element.volume = volume / 100
          document.body.appendChild(element)
          audioRef.current = element
          setIsPlaying(true)
        }
      })

      room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
        track.detach().forEach((el) => el.remove())
        setIsPlaying(false)
      })

      room.on(RoomEvent.Disconnected, () => {
        setIsConnected(false)
        setIsPlaying(false)
        setConnectionState('disconnected')
      })

      room.on(RoomEvent.Reconnecting, () => {
        setConnectionState('reconnecting')
      })

      room.on(RoomEvent.Reconnected, () => {
        setConnectionState('connected')
      })

      await room.connect(LIVEKIT_URL, token)
      roomRef.current = room
      setIsConnected(true)
      setConnectionState('connected')

      // Attach existing tracks if broadcaster is already speaking in the room
      room.remoteParticipants.forEach((participant) => {
        participant.trackPublications.forEach((pub) => {
          if (pub.track && pub.track.kind === Track.Kind.Audio) {
            const element = pub.track.attach()
            element.volume = volume / 100
            document.body.appendChild(element)
            audioRef.current = element
            setIsPlaying(true)
          }
        })
      })
    } catch (err) {
      console.error('Listener connection error:', err)
      setError('Error al conectar con la transmisión')
      setConnectionState('disconnected')
    }
  }, [volume])

  const disconnect = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.disconnect()
      roomRef.current = null
    }
    if (audioRef.current) {
      audioRef.current.remove()
      audioRef.current = null
    }
    setIsConnected(false)
    setIsPlaying(false)
    setConnectionState('disconnected')
  }, [])

  const setVolume = useCallback((v: number) => {
    setVolumeState(v)
    if (audioRef.current) {
      audioRef.current.volume = v / 100
    }
  }, [])

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }, [isPlaying])

  useEffect(() => {
    return () => {
      if (roomRef.current) roomRef.current.disconnect()
      if (audioRef.current) audioRef.current.remove()
    }
  }, [])

  return {
    isConnected,
    isPlaying,
    volume,
    connectionState,
    error,
    connect,
    disconnect,
    setVolume,
    togglePlay,
  }
}
