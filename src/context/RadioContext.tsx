import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Broadcast, Channel, Program, RadioSettings, ChatSettings } from '../types/database'

interface RadioState {
  // Current broadcast
  currentBroadcast: Broadcast | null
  currentProgram: Program | null
  currentChannel: Channel | null
  isLive: boolean
  listenerCount: number

  // All data
  channels: Channel[]

  // Settings
  radioSettings: RadioSettings | null
  chatSettings: ChatSettings | null

  // Loading
  loading: boolean

  // Actions
  refreshBroadcast: () => Promise<void>
  refreshChannels: () => Promise<void>
}

const RadioContext = createContext<RadioState | undefined>(undefined)

export function RadioProvider({ children }: { children: ReactNode }) {
  const [currentBroadcast, setCurrentBroadcast] = useState<Broadcast | null>(null)
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null)
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [radioSettings, setRadioSettings] = useState<RadioSettings | null>(null)
  const [chatSettings, setChatSettings] = useState<ChatSettings | null>(null)
  const [listenerCount, setListenerCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const broadcastRef = useRef<Broadcast | null>(null)

  const isLive = currentBroadcast?.status === 'live'

  async function refreshBroadcast() {
    try {
      const { data: broadcast } = await supabase
        .from('broadcasts')
        .select('*')
        .eq('status', 'live')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      setCurrentBroadcast(broadcast)
      broadcastRef.current = broadcast

      if (broadcast) {
        setListenerCount(broadcast.listener_count || 0)

        if (broadcast.channel_id) {
          const { data: channel } = await supabase
            .from('channels')
            .select('*')
            .eq('id', broadcast.channel_id)
            .single()
          setCurrentChannel(channel)
        }

        if (broadcast.program_id) {
          const { data: program } = await supabase
            .from('programs')
            .select('*')
            .eq('id', broadcast.program_id)
            .single()
          setCurrentProgram(program)
        }
      } else {
        setCurrentChannel(null)
        setCurrentProgram(null)
        setListenerCount(0)
      }
    } catch (error) {
      console.error('Error refreshing broadcast:', error)
    }
  }

  async function refreshChannels() {
    try {
      const { data } = await supabase
        .from('channels')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      setChannels(data || [])
    } catch (error) {
      console.error('Error refreshing channels:', error)
    }
  }

  async function fetchSettings() {
    try {
      const [radioRes, chatRes] = await Promise.all([
        supabase.from('radio_settings').select('*').limit(1).maybeSingle(),
        supabase.from('chat_settings').select('*').limit(1).maybeSingle(),
      ])
      setRadioSettings(radioRes.data)
      setChatSettings(chatRes.data)
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  useEffect(() => {
    Promise.all([refreshBroadcast(), refreshChannels(), fetchSettings()])
      .finally(() => setLoading(false))

    // Subscribe to broadcast changes
    const broadcastSub = supabase
      .channel('broadcasts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'broadcasts' }, () => {
        refreshBroadcast()
      })
      .subscribe()

    // Poll listener count every 15 seconds when live
    const interval = setInterval(() => {
      if (broadcastRef.current?.status === 'live') {
        refreshBroadcast()
      }
    }, 15000)

    return () => {
      broadcastSub.unsubscribe()
      clearInterval(interval)
    }
  }, [])

  return (
    <RadioContext.Provider
      value={{
        currentBroadcast,
        currentProgram,
        currentChannel,
        isLive,
        listenerCount,
        channels,
        radioSettings,
        chatSettings,
        loading,
        refreshBroadcast,
        refreshChannels,
      }}
    >
      {children}
    </RadioContext.Provider>
  )
}

export function useRadio() {
  const context = useContext(RadioContext)
  if (context === undefined) {
    throw new Error('useRadio must be used within a RadioProvider')
  }
  return context
}
