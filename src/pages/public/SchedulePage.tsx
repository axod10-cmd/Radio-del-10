import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { Program, Channel } from '../../types/database'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { Calendar, Clock } from 'lucide-react'
import { formatDate } from '../../utils/formatters'

interface ProgramWithChannel extends Program {
  channel?: Channel
}

export const SchedulePage: React.FC = () => {
  const [programs, setPrograms] = useState<ProgramWithChannel[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSchedule() {
      try {
        setLoading(true)
        const [progRes, chanRes] = await Promise.all([
          supabase
            .from('programs')
            .select('*, channel:channels(*)')
            .order('scheduled_date', { ascending: true })
            .order('scheduled_time_start', { ascending: true }),
          supabase.from('channels').select('*').eq('is_active', true),
        ])

        setPrograms(progRes.data || [])
        setChannels(chanRes.data || [])
      } catch (err) {
        console.error('Error loading schedule:', err)
      } finally {
        setLoading(false)
      }
    }
    loadSchedule()
  }, [])

  const filteredPrograms =
    selectedChannel === 'all'
      ? programs
      : programs.filter((p) => p.channel_id === selectedChannel)

  const getStatusBadge = (status: Program['status']) => {
    switch (status) {
      case 'live':
        return (
          <Badge variant="live" dot>
            EN EL AIRE
          </Badge>
        )
      case 'completed':
        return <Badge variant="default">EMITIDO</Badge>
      case 'cancelled':
        return <Badge variant="danger">CANCELADO</Badge>
      default:
        return <Badge variant="info">PROGRAMADO</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
          <Calendar className="w-4 h-4" />
          <span>Grilla Oficial de Emisiones</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Programación Radial
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Horarios y temáticas de las transmisiones escolares en vivo de la Expo Innovarte 2026.
        </p>

        {/* Filter by Channel */}
        <div className="pt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedChannel('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedChannel === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-400'
            }`}
          >
            Todos los Canales
          </button>
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setSelectedChannel(ch.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedChannel === ch.id
                  ? 'text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
              }`}
              style={
                selectedChannel === ch.id
                  ? { backgroundColor: ch.color || '#6366f1' }
                  : undefined
              }
            >
              {ch.name}
            </button>
          ))}
        </div>
      </div>

      {/* Program List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" text="Cargando programación escolar..." />
        </div>
      ) : filteredPrograms.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-8 h-8 text-indigo-500" />}
          title="No hay programas agendados aún"
          description="Los docentes y alumnos están preparando la grilla para las próximas emisiones escolares."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((prog) => (
            <Card key={prog.id} hover className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: prog.channel?.color || '#6366f1' }}
                  >
                    {prog.channel?.name || 'Radio Escolar'}
                  </span>
                  {getStatusBadge(prog.status)}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {prog.name}
                  </h3>
                  {prog.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mt-1 leading-relaxed">
                      {prog.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>
                    {prog.scheduled_date ? formatDate(prog.scheduled_date) : 'Próximamente'}
                    {prog.scheduled_time_start ? ` • ${prog.scheduled_time_start.slice(0, 5)} hs` : ''}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
