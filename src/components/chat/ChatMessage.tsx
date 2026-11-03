import React from 'react'
import type { ChatMessage as ChatMessageType } from '../../types/database'
import { formatTime } from '../../utils/formatters'
import { ShieldCheck } from 'lucide-react'

export interface ChatMessageProps {
  message: ChatMessageType
  isOwn?: boolean
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwn = false }) => {
  const isMod = message.is_moderator

  return (
    <div
      className={`group flex items-start gap-2.5 p-2 rounded-xl transition-colors ${
        isMod
          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-900/40'
          : isOwn
          ? 'bg-slate-100/60 dark:bg-slate-800/40'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/20'
      }`}
    >
      {/* Icon / Initial */}
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
          isMod
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
        }`}
      >
        {isMod ? <ShieldCheck className="w-4 h-4" /> : message.alias.slice(0, 2).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span
            className={`text-xs font-bold truncate ${
              isMod
                ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                : 'text-slate-800 dark:text-slate-200'
            }`}
          >
            {message.alias}
          </span>
          {isMod && (
            <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-600 text-white leading-tight">
              Docente
            </span>
          )}
          {isOwn && (
            <span className="text-[10px] text-slate-400 font-medium">(vos)</span>
          )}
          <span className="text-[10px] text-slate-400 ml-auto shrink-0">
            {formatTime(message.created_at || new Date().toISOString())}
          </span>
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-300 break-words leading-relaxed select-text">
          {message.content}
        </p>
      </div>
    </div>
  )
}
