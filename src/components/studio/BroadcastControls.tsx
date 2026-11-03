import React, { useState } from 'react'
import {
  Radio,
  Mic,
  MicOff,
  Users,
  Clock,
  AlertCircle,
  Play,
  Square,
} from 'lucide-react'
import { useBroadcast } from '../../hooks/useBroadcast'
import { useRadio } from '../../context/RadioContext'
import { AudioMeter } from './AudioMeter'
import { MicSelector } from './MicSelector'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { formatDuration } from '../../utils/formatters'

export const BroadcastControls: React.FC = () => {
  const { channels } = useRadio()
  const {
    isBroadcasting,
    isMicEnabled,
    audioLevel,
    duration,
    listenerCount,
    connectionState,
    error,
    availableMics,
    selectedMicId,
    setSelectedMicId,
    testMic,
    stopMicTest,
    isTesting,
    startBroadcast,
    stopBroadcast,
    toggleMic,
  } = useBroadcast()

  const [selectedChannelId, setSelectedChannelId] = useState<string>('')
  const [broadcastTitle, setBroadcastTitle] = useState<string>('')
  const [isConfirmStopOpen, setIsConfirmStopOpen] = useState(false)
  const [isStarting, setIsStarting] = useState(false)

  // Default to first channel if not selected
  React.useEffect(() => {
    if (channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].id)
    }
  }, [channels, selectedChannelId])

  const handleStart = async () => {
    if (!selectedChannelId) return
    setIsStarting(true)
    await startBroadcast(
      selectedChannelId,
      undefined,
      broadcastTitle || 'Transmisión Escolar en Vivo'
    )
    setIsStarting(false)
  }

  const handleConfirmStop = async () => {
    setIsConfirmStopOpen(false)
    await stopBroadcast()
  }

  const activeChannel = channels.find((c) => c.id === selectedChannelId)

  return (
    <div className="space-y-6">
      {/* Top Status & Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Status Card */}
        <Card className="bg-slate-900 border-slate-800 p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Estado de la Radio
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  isBroadcasting
                    ? 'bg-red-500 animate-ping'
                    : connectionState === 'connecting'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-slate-600'
                }`}
              />
              <span className="text-sm font-extrabold text-white uppercase tracking-wider">
                {isBroadcasting
                  ? 'TRANSMITIENDO EN VIVO'
                  : connectionState === 'connecting'
                  ? 'CONECTANDO...'
                  : 'ESTUDIO EN ESPERA'}
              </span>
            </div>
          </div>
          <Radio
            className={`w-8 h-8 ${
              isBroadcasting ? 'text-red-500 animate-pulse' : 'text-slate-600'
            }`}
          />
        </Card>

        {/* Duration Timer */}
        <Card className="bg-slate-900 border-slate-800 p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Tiempo en el Aire
            </span>
            <p className="text-2xl font-mono font-black text-white">
              {formatDuration(duration)}
            </p>
          </div>
          <Clock className="w-8 h-8 text-indigo-400" />
        </Card>

        {/* Listeners */}
        <Card className="bg-slate-900 border-slate-800 p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Audiencia Sintonizada
            </span>
            <p className="text-2xl font-mono font-black text-white">
              {listenerCount}
            </p>
          </div>
          <Users className="w-8 h-8 text-emerald-400" />
        </Card>
      </div>

      {/* Main Studio Console */}
      <Card className="bg-slate-900 border-slate-800 p-6 sm:p-8 space-y-6">
        {/* Channel Selection & Title */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Canal que Saldrá al Aire
            </label>
            <select
              value={selectedChannelId}
              onChange={(e) => setSelectedChannelId(e.target.value)}
              disabled={isBroadcasting}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {channels.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.name} — {ch.slogan || 'Sin eslogan'}
                </option>
              ))}
            </select>
            {activeChannel && (
              <p className="text-[11px] text-slate-400 mt-1.5">
                Expediente: <strong className="text-slate-200">{activeChannel.case_file}</strong>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Título o Nombre de la Emisión
            </label>
            <input
              type="text"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              disabled={isBroadcasting}
              placeholder="Ej: Emisión Especial Expo Innovarte 2026"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Microphone Setup & VU Meter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <MicSelector
            availableMics={availableMics}
            selectedMicId={selectedMicId}
            onSelectMic={setSelectedMicId}
            isTesting={isTesting}
            onTestMic={testMic}
            onStopTest={stopMicTest}
            disabled={isBroadcasting}
          />

          <AudioMeter level={audioLevel} isLive={isBroadcasting} />
        </div>

        {/* Big Action Buttons */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!isBroadcasting ? (
              <Button
                variant="live"
                size="lg"
                onClick={handleStart}
                isLoading={isStarting}
                icon={<Play className="w-5 h-5 fill-current" />}
                className="w-full sm:w-auto text-base px-8 py-4 font-black"
              >
                INICIAR TRANSMISIÓN EN VIVO
              </Button>
            ) : (
              <Button
                variant="danger"
                size="lg"
                onClick={() => setIsConfirmStopOpen(true)}
                icon={<Square className="w-5 h-5 fill-current" />}
                className="w-full sm:w-auto text-base px-8 py-4 font-black bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-600/30"
              >
                FINALIZAR TRANSMISIÓN
              </Button>
            )}

            {isBroadcasting && (
              <Button
                variant={isMicEnabled ? 'secondary' : 'danger'}
                size="lg"
                onClick={toggleMic}
                icon={isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                title={isMicEnabled ? 'Silenciar micrófono (Mute)' : 'Activar micrófono'}
              >
                {isMicEnabled ? 'Mutear' : 'Desmutear'}
              </Button>
            )}
          </div>

          <div className="text-right text-xs text-slate-400">
            <span className="block font-semibold text-slate-300">
              WebRTC LiveKit Ultra Low Latency
            </span>
            <span className="text-[11px] text-slate-500">
              Supresión de eco y ganancia de voz activas
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 flex items-start gap-3 text-xs text-rose-300">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-bold block text-rose-200">Aviso del Sistema</strong>
              <span>{error}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Confirm End Broadcast Dialog */}
      <ConfirmDialog
        isOpen={isConfirmStopOpen}
        onClose={() => setIsConfirmStopOpen(false)}
        onConfirm={handleConfirmStop}
        title="¿Finalizar la transmisión en vivo?"
        message="La señal se cortará para todos los oyentes conectados en este momento y se procesará la grabación correspondiente."
        confirmText="Sí, Finalizar Ahora"
        cancelText="Continuar en el Aire"
        variant="danger"
      />
    </div>
  )
}
