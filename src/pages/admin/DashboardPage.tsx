import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useRadio } from '../../context/RadioContext'
import { useAuth } from '../../context/AuthContext'
import { StatsCard } from '../../components/ui/StatsCard'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import {
  Radio,
  MessageSquare,
  ShieldAlert,
  Disc,
  Calendar,
  Mic,
  Sparkles,
} from 'lucide-react'
import { ROUTES } from '../../config/constants'
import { formatDuration } from '../../utils/formatters'

export const DashboardPage: React.FC = () => {
  const { currentBroadcast, isLive, listenerCount, currentChannel } = useRadio()
  const { profile, canBroadcast } = useAuth()

  const [stats, setStats] = useState({
    totalMessages: 0,
    rejectedMessages: 0,
    totalRecordings: 0,
    totalPrograms: 0,
    totalUsers: 0,
  })
  const [recentPrograms, setRecentPrograms] = useState<any[]>([])
  const [recentRecordings, setRecentRecordings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardStats() {
      try {
        setLoading(true)
        const [
          msgCount,
          rejCount,
          recCount,
          progCount,
          usrCount,
          progsRes,
          recsRes,
        ] = await Promise.all([
          supabase.from('chat_messages').select('*', { count: 'exact', head: true }),
          supabase.from('rejected_messages').select('*', { count: 'exact', head: true }),
          supabase.from('recordings').select('*', { count: 'exact', head: true }),
          supabase.from('programs').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('programs').select('*, channel:channels(name, color)').limit(5),
          supabase.from('recordings').select('*, channel:channels(name, color)').limit(5),
        ])

        setStats({
          totalMessages: msgCount.count || 0,
          rejectedMessages: rejCount.count || 0,
          totalRecordings: recCount.count || 0,
          totalPrograms: progCount.count || 0,
          totalUsers: usrCount.count || 0,
        })

        setRecentPrograms(progsRes.data || [])
        setRecentRecordings(recsRes.data || [])
      } catch (err) {
        console.error('Error loading dashboard stats:', err)
      } finally {
        setLoading(false)
      }
    }
    loadDashboardStats()
  }, [])

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" text="Cargando métricas de la radio escolar..." />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Colegio Provincial N.º 10</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            ¡Hola, {profile?.display_name || 'Docente'}!
          </h1>
          <p className="text-xs text-slate-300">
            Panel de control institucional para la gestión y moderación de Radio Escolar.
          </p>
        </div>

        {canBroadcast && (
          <Link to={ROUTES.STUDIO}>
            <Button
              variant="live"
              icon={<Mic className="w-4 h-4" />}
              className="font-bold text-xs shadow-lg"
            >
              Abrir Estudio de Transmisión
            </Button>
          </Link>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          label="Estado Transmisión"
          value={isLive ? 'EN EL AIRE' : 'FUERA DE LÍNEA'}
          icon={<Radio className="w-6 h-6" />}
          color={isLive ? 'rose' : 'indigo'}
          trend={isLive ? `${listenerCount} oyentes en vivo` : 'Estudio disponible'}
          trendType={isLive ? 'up' : 'neutral'}
        />

        <StatsCard
          label="Mensajes Publicados"
          value={stats.totalMessages}
          icon={<MessageSquare className="w-6 h-6" />}
          color="emerald"
          trend="Chat en tiempo real"
          trendType="neutral"
        />

        <StatsCard
          label="Filtro de Moderación"
          value={stats.rejectedMessages}
          icon={<ShieldAlert className="w-6 h-6" />}
          color="amber"
          trend="Bloqueos por normas"
          trendType="down"
        />

        <StatsCard
          label="Grabaciones Registradas"
          value={stats.totalRecordings}
          icon={<Disc className="w-6 h-6" />}
          color="purple"
          trend="Fonoteca escolar"
          trendType="neutral"
        />
      </div>

      {/* Live Broadcast Highlight (if live) */}
      {isLive && (
        <Card className="p-6 border-red-500/30 bg-red-500/5 dark:bg-red-500/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Transmisión Activa en este Momento
              </h3>
            </div>
            <Badge variant="live">EN VIVO</Badge>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <p className="text-base font-bold text-slate-900 dark:text-white">
                {currentBroadcast?.title || 'Programa en Vivo'}
              </p>
              <p className="text-xs text-slate-500">
                Canal: <strong className="text-indigo-600 dark:text-indigo-400">{currentChannel?.name}</strong> • Oyentes: <strong>{listenerCount}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link to={ROUTES.STUDIO}>
                <Button size="sm" variant="primary">
                  Ver Consola
                </Button>
              </Link>
              <Link to={ROUTES.HOME} target="_blank">
                <Button size="sm" variant="outline">
                  Sintonizar
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Two Columns: Recent Programs & Recordings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Programs */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Programación Próxima
              </h3>
            </div>
            <Link to={ROUTES.ADMIN_PROGRAMS} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              Gestionar →
            </Link>
          </div>

          {recentPrograms.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No hay programas registrados en el sistema.
            </p>
          ) : (
            <div className="space-y-3">
              {recentPrograms.map((prog) => (
                <div key={prog.id} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <div>
                    <strong className="block text-slate-800 dark:text-slate-200">
                      {prog.name}
                    </strong>
                    <span className="text-[11px] text-slate-400">
                      {prog.channel?.name || 'Canal'}
                    </span>
                  </div>
                  <Badge size="sm" variant="info">
                    {prog.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Recordings */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Disc className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Últimas Grabaciones
              </h3>
            </div>
            <Link to={ROUTES.ADMIN_RECORDINGS} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              Revisar →
            </Link>
          </div>

          {recentRecordings.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Aún no se generaron grabaciones de transmisiones.
            </p>
          ) : (
            <div className="space-y-3">
              {recentRecordings.map((rec) => (
                <div key={rec.id} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <div>
                    <strong className="block text-slate-800 dark:text-slate-200">
                      {rec.title}
                    </strong>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatDuration(rec.duration_seconds || 0)}
                    </span>
                  </div>
                  <Badge size="sm" variant={rec.is_published ? 'success' : 'warning'}>
                    {rec.is_published ? 'Publicada' : 'Pendiente Revisión'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
