import React, { useState } from 'react'
import { Send, AlertTriangle } from 'lucide-react'
import { CHAT_DEFAULTS } from '../../config/constants'

export interface ChatInputProps {
  onSendMessage: (text: string) => Promise<{ success: boolean; error?: string }>
  disabled?: boolean
  maxLength?: number
  slowModeSeconds?: number
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  maxLength = CHAT_DEFAULTS.MAX_MESSAGE_LENGTH,
  slowModeSeconds = 0,
}) => {
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || isSubmitting || disabled) return

    setIsSubmitting(true)
    setErrorMessage(null)

    const res = await onSendMessage(text)
    if (!res.success) {
      setErrorMessage(res.error || 'No se pudo enviar el mensaje')
    } else {
      setText('')
    }
    setIsSubmitting(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="space-y-1.5">
      {errorMessage && (
        <div className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              if (errorMessage) setErrorMessage(null)
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSubmitting}
            maxLength={maxLength}
            placeholder={
              disabled
                ? 'El chat está desactivado'
                : slowModeSeconds > 0
                ? `Escribí tu mensaje (modo lento ${slowModeSeconds}s)...`
                : 'Escribí un comentario para el programa...'
            }
            className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
          {text.length > 0 && (
            <span className="absolute right-3 top-2.5 text-[10px] text-slate-400">
              {text.length}/{maxLength}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={!text.trim() || isSubmitting || disabled}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-md shadow-indigo-600/20 transition-all shrink-0 active:scale-95"
          aria-label="Enviar mensaje"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
