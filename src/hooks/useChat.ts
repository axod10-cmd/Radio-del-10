import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { moderateMessage } from '../lib/moderation'
import { sanitizeText, containsUrl, generateSessionId } from '../utils/sanitize'
import { CHAT_DEFAULTS } from '../config/constants'
import type { ChatMessage, ChatSettings } from '../types/database'

interface UseChatOptions {
  broadcastId: string | null
  chatSettings: ChatSettings | null
}

interface UseChatReturn {
  messages: ChatMessage[]
  sendMessage: (content: string) => Promise<{ success: boolean; error?: string }>
  loading: boolean
  error: string | null
}

export function useChat({ broadcastId, chatSettings }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messageTimestamps = useRef<number[]>([])
  const lastMessage = useRef<string>('')
  const sessionId = useRef(generateSessionId())

  // Fetch existing messages
  useEffect(() => {
    if (!broadcastId) {
      setMessages([])
      return
    }

    setLoading(true)
    supabase
      .from('chat_messages')
      .select('*')
      .eq('broadcast_id', broadcastId)
      .order('created_at', { ascending: true })
      .limit(200)
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError('Error al cargar mensajes')
        } else {
          setMessages(data || [])
        }
        setLoading(false)
      })

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat:${broadcastId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `broadcast_id=eq.${broadcastId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
          filter: `broadcast_id=eq.${broadcastId}`,
        },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [broadcastId])

  const sendMessage = useCallback(
    async (content: string): Promise<{ success: boolean; error?: string }> => {
      if (!broadcastId) {
        return { success: false, error: 'No hay transmisión activa' }
      }

      // Check chat enabled
      if (chatSettings && !chatSettings.is_enabled) {
        return { success: false, error: 'El chat está desactivado en este momento' }
      }

      const trimmed = content.trim()
      if (!trimmed) {
        return { success: false, error: 'El mensaje está vacío' }
      }

      const maxLen = chatSettings?.max_message_length || CHAT_DEFAULTS.MAX_MESSAGE_LENGTH
      if (trimmed.length > maxLen) {
        return { success: false, error: `El mensaje no puede superar los ${maxLen} caracteres` }
      }

      // Check for URLs
      if (containsUrl(trimmed)) {
        return { success: false, error: 'No se permiten enlaces en el chat' }
      }

      // Rate limiting
      const now = Date.now()
      const windowMs = (chatSettings?.rate_limit_window_seconds || CHAT_DEFAULTS.RATE_LIMIT_WINDOW_SECONDS) * 1000
      const maxMessages = chatSettings?.rate_limit_messages || CHAT_DEFAULTS.RATE_LIMIT_MESSAGES
      messageTimestamps.current = messageTimestamps.current.filter((t) => now - t < windowMs)

      if (messageTimestamps.current.length >= maxMessages) {
        return { success: false, error: 'Estás enviando mensajes demasiado rápido. Esperá un momento.' }
      }

      // Slow mode
      const slowMode = chatSettings?.slow_mode_seconds || CHAT_DEFAULTS.SLOW_MODE_SECONDS
      if (slowMode > 0 && messageTimestamps.current.length > 0) {
        const lastTs = messageTimestamps.current[messageTimestamps.current.length - 1]
        const elapsed = (now - lastTs) / 1000
        if (elapsed < slowMode) {
          const wait = Math.ceil(slowMode - elapsed)
          return { success: false, error: `Modo lento activado. Esperá ${wait} segundos.` }
        }
      }

      // Duplicate message check
      if (trimmed === lastMessage.current) {
        return { success: false, error: 'No podés enviar el mismo mensaje consecutivamente' }
      }

      // Content moderation
      const moderationResult = moderateMessage(trimmed)
      if (!moderationResult.allowed) {
        // Log rejected message
        await supabase.from('rejected_messages').insert({
          broadcast_id: broadcastId,
          alias: sessionStorage.getItem('chat_alias') || 'Anónimo',
          content: trimmed,
          reason: moderationResult.reason || 'Contenido inapropiado',
          matched_filter: moderationResult.matchedFilter || '',
          session_id: sessionId.current,
        })
        return { success: false, error: 'Tu mensaje no pudo publicarse porque no cumple las normas de convivencia' }
      }

      // Sanitize
      const sanitized = sanitizeText(trimmed)
      const alias = sessionStorage.getItem('chat_alias') || 'Oyente'

      // Insert message
      const { error: insertError } = await supabase.from('chat_messages').insert({
        broadcast_id: broadcastId,
        alias,
        content: sanitized,
        session_id: sessionId.current,
        is_moderator: false,
      })

      if (insertError) {
        return { success: false, error: 'Error al enviar el mensaje. Intentá nuevamente.' }
      }

      messageTimestamps.current.push(now)
      lastMessage.current = trimmed
      return { success: true }
    },
    [broadcastId, chatSettings]
  )

  return { messages, sendMessage, loading, error }
}
