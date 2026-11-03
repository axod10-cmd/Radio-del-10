import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { ChatMessage, RejectedMessage, ChatSettings, BannedWord } from '../../types/database'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Tabs } from '../../components/ui/Tabs'
import { Toggle } from '../../components/ui/Toggle'
import { Spinner } from '../../components/ui/Spinner'
import {
  ShieldAlert,
  MessageSquare,
  Trash2,
  Ban,
  Plus,
  RefreshCw,
} from 'lucide-react'
import { formatTime, formatDateTime } from '../../utils/formatters'

export const ModerationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'live' | 'rejected' | 'words' | 'settings'>('live')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [rejected, setRejected] = useState<RejectedMessage[]>([])
  const [bannedWords, setBannedWords] = useState<BannedWord[]>([])
  const [chatSettings, setChatSettings] = useState<ChatSettings | null>(null)
  const [loading, setLoading] = useState(true)

  // Banned word add
  const [newWord, setNewWord] = useState('')
  const [newWordCategory, setNewWordCategory] = useState<'insult' | 'threat' | 'discrimination' | 'sexual' | 'spam'>('insult')

  const loadData = async () => {
    try {
      setLoading(true)
      const [msgRes, rejRes, wordsRes, setRes] = await Promise.all([
        supabase.from('chat_messages').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('rejected_messages').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('banned_words').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('chat_settings').select('*').limit(1).maybeSingle(),
      ])

      setMessages(msgRes.data || [])
      setRejected(rejRes.data || [])
      setBannedWords(wordsRes.data || [])
      setChatSettings(setRes.data)
    } catch (err) {
      console.error('Error loading moderation data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDeleteMessage = async (id: string) => {
    try {
      await supabase.from('chat_messages').delete().eq('id', id)
      setMessages((prev) => prev.filter((m) => m.id !== id))
    } catch (err) {
      console.error('Error deleting chat message:', err)
    }
  }

  const handleToggleChatEnabled = async () => {
    if (!chatSettings) return
    const nextState = !chatSettings.is_enabled
    try {
      const { error } = await supabase
        .from('chat_settings')
        .update({ is_enabled: nextState })
        .eq('id', chatSettings.id)

      if (error) throw error
      setChatSettings({ ...chatSettings, is_enabled: nextState })
    } catch (err) {
      console.error('Error toggling chat:', err)
    }
  }

  const handleUpdateSlowMode = async (seconds: number) => {
    if (!chatSettings) return
    try {
      const { error } = await supabase
        .from('chat_settings')
        .update({ slow_mode_seconds: seconds })
        .eq('id', chatSettings.id)

      if (error) throw error
      setChatSettings({ ...chatSettings, slow_mode_seconds: seconds })
    } catch (err) {
      console.error('Error updating slow mode:', err)
    }
  }

  const handleAddBannedWord = async (e: React.FormEvent) => {
    e.preventDefault()
    const word = newWord.trim().toLowerCase()
    if (!word) return

    try {
      const { data, error } = await supabase
        .from('banned_words')
        .insert({
          word,
          category: newWordCategory,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error
      if (data) {
        setBannedWords((prev) => [data, ...prev])
      }
      setNewWord('')
    } catch (err) {
      console.error('Error adding word:', err)
    }
  }

  const handleDeleteBannedWord = async (id: string) => {
    try {
      await supabase.from('banned_words').delete().eq('id', id)
      setBannedWords((prev) => prev.filter((w) => w.id !== id))
    } catch (err) {
      console.error('Error deleting word:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Moderación y Seguridad del Chat
          </h1>
          <p className="text-xs text-slate-500">
            Control de comentarios en vivo, registro de bloqueos y configuración de filtros anti-agresión.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={loadData}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Actualizar
        </Button>
      </div>

      {/* Global Chat Status Toggles */}
      <Card className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
        <Toggle
          label="Estado del Chat Público"
          description="Al apagarlo, ningún oyente podrá enviar mensajes en la página pública."
          checked={chatSettings?.is_enabled ?? true}
          onChange={handleToggleChatEnabled}
        />

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            Modo Lento (Tiempo de espera entre mensajes)
          </label>
          <div className="flex gap-2">
            {[0, 3, 10, 30].map((sec) => (
              <button
                key={sec}
                onClick={() => handleUpdateSlowMode(sec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  (chatSettings?.slow_mode_seconds ?? 0) === sec
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {sec === 0 ? 'Sin límite' : `${sec} seg`}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
        tabs={[
          {
            id: 'live',
            label: 'Mensajes al Aire',
            badge: messages.length,
            icon: <MessageSquare className="w-4 h-4" />,
          },
          {
            id: 'rejected',
            label: 'Bloqueados por Filtro',
            badge: rejected.length,
            icon: <ShieldAlert className="w-4 h-4 text-amber-500" />,
          },
          {
            id: 'words',
            label: 'Palabras Prohibidas',
            badge: bannedWords.length,
            icon: <Ban className="w-4 h-4 text-rose-500" />,
          },
        ]}
      />

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" text="Cargando registros de moderación..." />
        </div>
      ) : activeTab === 'live' ? (
        /* Live Chat Messages List */
        <Card padding="none" className="overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="px-5 py-3.5">Alias</th>
                <th className="px-4 py-3.5">Mensaje</th>
                <th className="px-4 py-3.5">Hora</th>
                <th className="px-5 py-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    No hay mensajes en el chat recientemente.
                  </td>
                </tr>
              ) : (
                messages.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      {m.alias}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 break-words max-w-md">
                      {m.content}
                    </td>
                    <td className="px-4 py-3.5 text-[11px] text-slate-400 font-mono">
                      {formatTime(m.created_at || new Date().toISOString())}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteMessage(m.id)}
                        icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                        className="text-xs py-1 px-2 text-rose-500 hover:bg-rose-50"
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      ) : activeTab === 'rejected' ? (
        /* Rejected Messages Audit */
        <Card padding="none" className="overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="px-5 py-3.5">Alias e Intento</th>
                <th className="px-4 py-3.5">Contenido Rechazado</th>
                <th className="px-4 py-3.5">Motivo del Bloqueo</th>
                <th className="px-4 py-3.5">Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rejected.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    No se han registrado mensajes bloqueados. ¡Comunidad respetuosa!
                  </td>
                </tr>
              ) : (
                rejected.map((r) => (
                  <tr key={r.id} className="hover:bg-rose-50/20 dark:hover:bg-rose-950/20">
                    <td className="px-5 py-3.5">
                      <strong className="block text-slate-900 dark:text-white font-bold">
                        {r.alias}
                      </strong>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {r.session_id.slice(0, 14)}...
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-rose-600 dark:text-rose-400 font-mono text-[11px] break-words max-w-md">
                      {r.content}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="danger">{r.reason}</Badge>
                      {r.matched_filter && (
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          Filtro: {r.matched_filter}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-[11px] text-slate-400 font-mono">
                      {r.created_at ? formatDateTime(r.created_at) : 'Reciente'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      ) : (
        /* Banned Words Editor */
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Agregar Término al Filtro Automático
            </h3>
            <form onSubmit={handleAddBannedWord} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder="Palabra o expresión prohibida..."
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <select
                value={newWordCategory}
                onChange={(e) => setNewWordCategory(e.target.value as any)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100"
              >
                <option value="insult">Insulto / Grosería</option>
                <option value="threat">Amenaza / Agresión</option>
                <option value="discrimination">Discriminación</option>
                <option value="sexual">Expresión Sexual Inadecuada</option>
                <option value="spam">Spam</option>
              </select>

              <Button type="submit" variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
                Agregar Palabra
              </Button>
            </form>
          </Card>

          <Card padding="none" className="p-4">
            <div className="flex flex-wrap gap-2">
              {bannedWords.map((bw) => (
                <span
                  key={bw.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  <span>{bw.word}</span>
                  <button
                    onClick={() => handleDeleteBannedWord(bw.id)}
                    className="p-0.5 text-slate-400 hover:text-rose-500 rounded"
                    title="Eliminar del filtro"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
