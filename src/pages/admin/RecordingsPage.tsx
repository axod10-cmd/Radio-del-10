import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { Recording, Channel } from '../../types/database'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import {
  Disc,
  Play,
  Pause,
  Download,
  Trash2,
  CheckCircle,
  ShieldCheck,
  Clock,
} from 'lucide-react'
import { formatDate, formatDuration, formatFileSize } from '../../utils/formatters'

interface RecordingWithChannel extends Recording {
  channel?: Channel
}

export const RecordingsPage: React.FC = () => {
  const [recordings, setRecordings] = useState<RecordingWithChannel[]>([])
  const [loading, setLoading] = useState(true)
  const [activeAudio, setActiveAudio] = useState<{ id: string; audio: HTMLAudioElement } | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [deletingRec, setDeletingRec] = useState<Recording | null>(null)

  const loadRecordings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('recordings')
        .select('*, channel:channels(*)')
        .order('recorded_at', { ascending: false })

      if (error) throw error
      setRecordings(data || [])
    } catch (err) {
      console.error('Error loading recordings:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecordings()
    return () => {
      if (activeAudio) {
        activeAudio.audio.pause()
      }
    }
  }, [])

  const handleTogglePlay = (rec: RecordingWithChannel) => {
    if (activeAudio?.id === rec.id) {
      if (isPlaying) {
        activeAudio.audio.pause()
        setIsPlaying(false)
      } else {
        activeAudio.audio.play()
        setIsPlaying(true)
      }
      return
    }

    if (activeAudio) {
      activeAudio.audio.pause()
    }

    if (!rec.file_url) return

    const audio = new Audio(rec.file_url)
    audio.play()
    setActiveAudio({ id: rec.id, audio })
    setIsPlaying(true)

    audio.onended = () => {
      setIsPlaying(false)
      setActiveAudio(null)
    }
  }

  const handleTogglePublish = async (rec: Recording) => {
    try {
      const nextState = !rec.is_published
      const { error } = await supabase
        .from('recordings')
        .update({
          is_published: nextState,
          status: nextState ? 'published' : 'ready',
          published_at: nextState ? new Date().toISOString() : null,
        })
        .eq('id', rec.id)

      if (error) throw error
      setRecordings((prev) =>
        prev.map((r) => (r.id === rec.id ? { ...r, is_published: nextState } : r))
      )
    } catch (err) {
      console.error('Error toggling publication:', err)
    }
  }

  const handleDelete = async () => {
    if (!deletingRec) return
    try {
      const { error } = await supabase
        .from('recordings')
        .delete()
        .eq('id', deletingRec.id)

      if (error) throw error
      await loadRecordings()
      setDeletingRec(null)
    } catch (err) {
      console.error('Error deleting recording:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Grabaciones y Archivo Sonoro
          </h1>
          <p className="text-xs text-slate-500">
            Revisión docente, consentimiento institucional y publicación oficial de fonogramas.
          </p>
        </div>
      </div>

      {/* Institutional Privacy Alert */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-900/40 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
        <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold">Protocolo de Privacidad y Voces de Menores</strong>
          <span>
            Las grabaciones de las transmisiones escolares se conservan de forma privada por defecto. Solamente los docentes autorizados pueden publicar un audio tras constatar la autorización parental o institucional correspondiente.
          </span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" text="Cargando fonoteca..." />
        </div>
      ) : recordings.length === 0 ? (
        <Card className="p-8 text-center text-slate-400">
          <Disc className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold">No hay grabaciones archivadas en el sistema</p>
          <p className="text-xs text-slate-400 mt-1">
            Al finalizar una transmisión en vivo en el estudio, el audio se procesará automáticamente aquí.
          </p>
        </Card>
      ) : (
        <Card padding="none" className="overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="px-5 py-3.5">Emisión</th>
                <th className="px-4 py-3.5">Canal</th>
                <th className="px-4 py-3.5">Duración y Peso</th>
                <th className="px-4 py-3.5">Estado de Publicación</th>
                <th className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recordings.map((rec) => {
                const isThisPlaying = activeAudio?.id === rec.id && isPlaying

                return (
                  <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3.5">
                      <strong className="block text-slate-900 dark:text-white font-bold">
                        {rec.title}
                      </strong>
                      <span className="text-[11px] text-slate-400">
                        {rec.recorded_at ? formatDate(rec.recorded_at) : 'Sin fecha'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: rec.channel?.color || '#6366f1' }}
                      >
                        {rec.channel?.name || 'Canal'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDuration(rec.duration_seconds || 0)}
                        </span>
                        {rec.file_size_bytes && (
                          <span className="text-slate-400">
                            {formatFileSize(rec.file_size_bytes)}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleTogglePublish(rec)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                          rec.is_published
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{rec.is_published ? 'Publicada en Web' : 'Privada / Revisar'}</span>
                      </button>
                    </td>

                    <td className="px-5 py-3.5 text-right space-x-2">
                      <Button
                        size="sm"
                        variant={isThisPlaying ? 'danger' : 'secondary'}
                        onClick={() => handleTogglePlay(rec)}
                        icon={
                          isThisPlaying ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )
                        }
                        className="text-xs py-1 px-2.5"
                      >
                        {isThisPlaying ? 'Pausar' : 'Escuchar'}
                      </Button>

                      {rec.file_url && (
                        <a
                          href={rec.file_url}
                          download={`${rec.title}.webm`}
                          className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Descargar audio para archivo escolar"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeletingRec(rec)}
                        icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                        className="text-xs py-1 px-2 text-rose-500 hover:bg-rose-50"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingRec}
        onClose={() => setDeletingRec(null)}
        onConfirm={handleDelete}
        title="¿Eliminar Grabación?"
        message={`Estás por eliminar el archivo "${deletingRec?.title}". Esta acción es irreversible.`}
        confirmText="Eliminar Definitivamente"
        variant="danger"
      />
    </div>
  )
}
