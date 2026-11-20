import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Channel, Program, Recording } from '../../types/database'
import { Card } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import { Button } from '../../components/ui/Button'
import { Radio, ArrowLeft, Disc, Calendar } from 'lucide-react'
import { ROUTES, DEFAULT_CHANNELS } from '../../config/constants'
import { formatDate, formatDuration } from '../../utils/formatters'

export const ChannelPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [channel, setChannel] = useState<Channel | null>(null)
  const [programs, setPrograms] = useState<Program[]>([])
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadChannelData() {
      if (!slug) return
      try {
        setLoading(true)
        const { data: chanData, error: chanErr } = await supabase
          .from('channels')
          .select('*')
          .eq('slug', slug)
          .single()

        if (chanErr || !chanData) {
          const fallback = DEFAULT_CHANNELS.find((c) => c.slug === slug)
          if (fallback) {
            setChannel(fallback)
            return
          }
          throw chanErr
        }
        setChannel(chanData)

        const [progsRes, recsRes] = await Promise.all([
          supabase
            .from('programs')
            .select('*')
            .eq('channel_id', chanData.id)
            .order('scheduled_date', { ascending: false }),
          supabase
            .from('recordings')
            .select('*')
            .eq('channel_id', chanData.id)
            .eq('is_published', true)
            .order('recorded_at', { ascending: false }),
        ])

        setPrograms(progsRes.data || [])
        setRecordings(recsRes.data || [])
      } catch (err) {
        console.error('Error loading channel details:', err)
      } finally {
        setLoading(false)
      }
    }
    loadChannelData()
  }, [slug])

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner size="lg" text="Cargando expediente del canal..." />
      </div>
    )
  }

  if (!channel) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Canal no encontrado</h2>
        <Link to={ROUTES.HOME}>
          <Button variant="primary">Volver al Inicio</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Return link */}
      <div>
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la portada principal</span>
        </Link>
      </div>

      {/* Channel Header Banner */}
      <div
        className="rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${channel.color || '#6366f1'}, #0f172a)`,
        }}
      >
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5" />
            <span>Canal Estudiantil — Expo 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{channel.name}</h1>

          {channel.slogan && (
            <p className="text-lg font-medium text-white/90 italic">
              "{channel.slogan}"
            </p>
          )}

          {channel.case_file && (
            <div className="inline-block p-3 rounded-2xl bg-black/30 backdrop-blur-md border border-white/20">
              <span className="text-[10px] uppercase tracking-wider text-white/70 font-bold block">
                Expediente Especial
              </span>
              <span className="text-sm font-black text-white">{channel.case_file}</span>
            </div>
          )}

          {channel.description && (
            <p className="text-sm text-white/80 leading-relaxed max-w-2xl pt-2">
              {channel.description}
            </p>
          )}
        </div>
      </div>

      {/* Grid: Programs & Recordings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Programs */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>Programas y Emisiones</span>
          </div>

          {programs.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl text-center">
              No hay emisiones programadas por el momento para este canal.
            </p>
          ) : (
            <div className="space-y-3">
              {programs.map((prog) => (
                <Card key={prog.id} className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {prog.name}
                    </h4>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      {prog.status}
                    </span>
                  </div>
                  {prog.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{prog.description}</p>
                  )}
                  {prog.scheduled_date && (
                    <p className="text-[11px] text-slate-400 font-medium">
                      Fecha: {formatDate(prog.scheduled_date)}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recordings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
            <Disc className="w-4 h-4 text-indigo-500" />
            <span>Audios Grabados Disponibles</span>
          </div>

          {recordings.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl text-center">
              Aún no se han publicado grabaciones de este canal.
            </p>
          ) : (
            <div className="space-y-3">
              {recordings.map((rec) => (
                <Card key={rec.id} className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {rec.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      Duración: {formatDuration(rec.duration_seconds || 0)}
                    </span>
                  </div>
                  <Link to={ROUTES.ARCHIVE}>
                    <Button size="sm" variant="outline" className="text-xs py-1">
                      Escuchar
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
