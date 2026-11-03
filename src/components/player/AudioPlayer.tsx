import React, { useEffect } from 'react'
import { Play, Square, Radio, Users, Sparkles, AlertCircle } from 'lucide-react'
import { useRadio } from '../../context/RadioContext'
import { useListener } from '../../hooks/useListener'
import { VolumeControl } from './VolumeControl'
import { LiveIndicator } from './LiveIndicator'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { formatListenerCount } from '../../utils/formatters'

export const AudioPlayer: React.FC = () => {
  const { currentBroadcast, currentProgram, currentChannel, isLive, listenerCount } = useRadio()
  const { isConnected, isPlaying, volume, error, connect, setVolume, togglePlay } =
    useListener()

  // Auto connect when live broadcast is detected and room is available
  useEffect(() => {
    if (isLive && currentBroadcast?.livekit_room_name && !isConnected) {
      // Don't auto-play without user action due to browser autoplay policies, but prepare connection
    }
  }, [isLive, currentBroadcast, isConnected])

  const handlePlayToggle = () => {
    if (!isLive || !currentBroadcast?.livekit_room_name) return

    if (!isConnected) {
      connect(currentBroadcast.livekit_room_name)
    } else {
      togglePlay()
    }
  }

  // Not live state
  if (!isLive) {
    return (
      <Card
        glass
        padding="lg"
        className="relative overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-800 text-center py-12"
      >
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
            <Radio className="w-8 h-8 opacity-75" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Transmisión Fuera del Aire
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              En este momento no hay programas en vivo. Volvé pronto para escuchar nuestra programación.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Colegio Provincial N.º 10 — La Rioja</span>
          </div>
        </div>
      </Card>
    )
  }

  const channelColor = currentChannel?.color || '#6366f1'

  return (
    <Card
      glass
      padding="none"
      className="relative overflow-hidden shadow-2xl border-indigo-200/50 dark:border-indigo-900/40"
    >
      {/* Top Channel Color Banner */}
      <div
        className="h-2 w-full transition-colors duration-500"
        style={{ backgroundColor: channelColor }}
      />

      <div className="p-6 sm:p-8 space-y-6">
        {/* Top Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <LiveIndicator />
            <span
              className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full text-white shadow-sm"
              style={{ backgroundColor: channelColor }}
            >
              {currentChannel?.name || 'Canal Escolar'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-full">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span>{formatListenerCount(listenerCount)}</span>
          </div>
        </div>

        {/* Center Program Graphic & Info */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Program Artwork */}
          <div
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${channelColor}, #1e1b4b)`,
            }}
          >
            {currentProgram?.image_url ? (
              <img
                src={currentProgram.image_url}
                alt={currentProgram.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Radio className="w-12 h-12 opacity-80" />
            )}

            {/* Audio equalizing animation overlay when playing */}
            {isPlaying && (
              <div className="absolute inset-x-0 bottom-2 flex items-end justify-center gap-1 h-6">
                <span className="w-1 bg-white/90 rounded-full animate-bounce [animation-delay:-0.3s] h-4"></span>
                <span className="w-1 bg-white/90 rounded-full animate-bounce [animation-delay:-0.15s] h-6"></span>
                <span className="w-1 bg-white/90 rounded-full animate-bounce [animation-delay:-0.45s] h-3"></span>
                <span className="w-1 bg-white/90 rounded-full animate-bounce h-5"></span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left space-y-1.5 min-w-0">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
              {currentBroadcast?.title || currentProgram?.name || 'Programa en Vivo'}
            </h2>
            {currentChannel?.slogan && (
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 italic">
                "{currentChannel.slogan}"
              </p>
            )}
            {currentChannel?.case_file && (
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Expediente: <span className="text-slate-700 dark:text-slate-200 font-semibold">{currentChannel.case_file}</span>
              </p>
            )}
            {currentProgram?.description && (
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 pt-1">
                {currentProgram.description}
              </p>
            )}
          </div>
        </div>

        {/* Player Controls Bar */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={handlePlayToggle}
              size="lg"
              variant={isPlaying ? 'secondary' : 'primary'}
              icon={
                isPlaying ? (
                  <Square className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )
              }
              className="shadow-lg"
            >
              {isPlaying ? 'Detener Reproducción' : isConnected ? 'Reanudar Audio' : 'Sintonizar en Vivo'}
            </Button>
            {isConnected && (
              <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Conectado al stream WebRTC
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <VolumeControl volume={volume} onChange={setVolume} />
          </div>
        </div>

        {/* Error notification if connection failed */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2.5 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => currentBroadcast?.livekit_room_name && connect(currentBroadcast.livekit_room_name)}
              className="ml-auto text-xs py-1 px-2.5"
            >
              Reintentar
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
