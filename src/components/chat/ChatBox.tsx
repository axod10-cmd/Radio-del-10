import React, { useState, useRef, useEffect } from 'react'
import { MessageSquare, UserCheck, ShieldAlert, Radio } from 'lucide-react'
import { useRadio } from '../../context/RadioContext'
import { useChat } from '../../hooks/useChat'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { AliasModal } from './AliasModal'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Spinner } from '../ui/Spinner'

export const ChatBox: React.FC = () => {
  const { currentBroadcast, chatSettings, isLive } = useRadio()
  const broadcastId = currentBroadcast?.id || null

  const { messages, sendMessage, loading } = useChat({
    broadcastId,
    chatSettings,
  })

  const [alias, setAlias] = useState<string | null>(() => {
    return sessionStorage.getItem('chat_alias')
  })
  const [isAliasModalOpen, setIsAliasModalOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (text: string) => {
    if (!alias) {
      setIsAliasModalOpen(true)
      return { success: false, error: 'Por favor, elegí un alias primero' }
    }
    return sendMessage(text)
  }

  const isChatDisabled = chatSettings ? !chatSettings.is_enabled : false

  return (
    <Card glass padding="none" className="flex flex-col h-[520px] shadow-xl overflow-hidden">
      {/* Chat Header */}
      <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Chat en Vivo
          </h3>
          {isLive && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Chat conectado" />
          )}
        </div>

        <div>
          {alias ? (
            <button
              onClick={() => setIsAliasModalOpen(true)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{alias}</span>
            </button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAliasModalOpen(true)}
              className="text-xs py-1 px-2.5"
            >
              Elegir Alias
            </Button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {!isLive ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Radio className="w-10 h-10 mb-2 opacity-40 text-indigo-500" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              El chat se activará al comenzar la transmisión en vivo
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Podrás interactuar con los locutores y oyentes de la escuela.
            </p>
          </div>
        ) : isChatDisabled ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <ShieldAlert className="w-10 h-10 mb-2 text-amber-500 opacity-70" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              El chat ha sido pausado temporalmente por los moderadores
            </p>
          </div>
        ) : loading && messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <Spinner size="sm" text="Conectando al chat..." />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              ¡Sé el primero en comentar!
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Dejá tu saludo o mensaje para el programa en el recuadro inferior.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} isOwn={msg.alias === alias} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
        {!alias ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-900/40">
            <span className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
              Elegí un alias para comenzar a chatear
            </span>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsAliasModalOpen(true)}
              className="text-xs py-1"
            >
              Identificarme
            </Button>
          </div>
        ) : (
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={!isLive || isChatDisabled}
            maxLength={chatSettings?.max_message_length}
            slowModeSeconds={chatSettings?.slow_mode_seconds}
          />
        )}
      </div>

      {/* Modal for setting alias */}
      <AliasModal
        isOpen={isAliasModalOpen}
        onClose={() => setIsAliasModalOpen(false)}
        onSaveAlias={(newAlias) => setAlias(newAlias)}
      />
    </Card>
  )
}
