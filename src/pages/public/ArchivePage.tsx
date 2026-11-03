import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { Recording, Channel } from '../../types/database'
import { Card } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { Disc, Play, Pause, Clock, Calendar, Headphones } from 'lucide-react'
import { formatDate, formatDuration } from '../../utils/formatters'

interface RecordingWithChannel extends Recording {
  channel?: Channel
}

export const ArchivePage: React.FC = () => {
  const [recordings, setRecordings] = useState<RecordingWithChannel[]>([])
  const [loading, setLoading] = useState(true)
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null)
  const [playingAudio, setPlayingAudio] = useState<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    async function loadRecordings() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('recordings')
          .select('*, channel:channels(*)')
          .eq('status', 'published')
          .eq('is_published', true)
          .order('recorded_at', { ascending: false })

        if (error) throw error
        setRecordings(data || [])
      } catch (err) {
        console.error('Error loading recordings:', err)
      } finally {
        setLoading(false)
      }
    }
    loadRecordings()

    return () => {
      if (playingAudio) {
        playingAudio.pause()
      }
    }
  }, [])

  const handlePlayToggle = (rec: RecordingWithChannel) => {
    if (activeRecordingId === rec.id && playingAudio) {
      if (isPlaying) {
        playingAudio.pause()
        setIsPlaying(false)
      } else {
        playingAudio.play()
        setIsPlaying(true)
      }
      return
    }

    // Stop current audio if playing
    if (playingAudio) {
      playingAudio.pause()
    }

    if (!rec.file_url) return

    const audio = new Audio(rec.file_url)
    audio.play()
    setPlayingAudio(audio)
    setActiveRecordingId(rec.id)
    setIsPlaying(true)

    audio.onended = () => {
      setIsPlaying(false)
      setActiveRecordingId(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
          <Disc className="w-4 h-4" />
          <span>Fonoteca Escolar</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Archivo de Grabaciones
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Escuchá las emisiones pasadas, entrevistas y podcasts autorizados institucionalmente.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" text="Cargando archivo de emisiones..." />
        </div>
      ) : recordings.length === 0 ? (
        <EmptyState
          icon={<Headphones className="w-8 h-8 text-indigo-500" />}
          title="Aún no hay grabaciones publicadas"
          description="Las emisiones grabadas se publicarán aquí una vez revisadas y aprobadas por el equipo docente."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recordings.map((rec) => {
            const isThisPlaying = activeRecordingId === rec.id && isPlaying

            return (
              <Card key={rec.id} hover className="flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: rec.channel?.color || '#6366f1' }}
                    >
                      {rec.channel?.name || 'Radio Escolar'}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDuration(rec.duration_seconds || 0)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {rec.title}
                    </h3>
                    {rec.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                        {rec.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {rec.recorded_at ? formatDate(rec.recorded_at) : 'Reciente'}
                  </span>

                  <button
                    onClick={() => handlePlayToggle(rec)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isThisPlaying
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                    }`}
                  >
                    {isThisPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pausar</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        <span>Reproducir</span>
                      </>
                    )}
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
