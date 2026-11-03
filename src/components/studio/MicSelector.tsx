import React from 'react'
import { Mic, Volume2, Square } from 'lucide-react'
import { Button } from '../ui/Button'

export interface MicSelectorProps {
  availableMics: MediaDeviceInfo[]
  selectedMicId: string | null
  onSelectMic: (deviceId: string) => void
  isTesting: boolean
  onTestMic: () => void
  onStopTest: () => void
  disabled?: boolean
  className?: string
}

export const MicSelector: React.FC<MicSelectorProps> = ({
  availableMics,
  selectedMicId,
  onSelectMic,
  isTesting,
  onTestMic,
  onStopTest,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
        Fuente de Audio / Micrófono
      </label>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Mic className="w-4 h-4" />
          </div>
          <select
            value={selectedMicId || ''}
            onChange={(e) => onSelectMic(e.target.value)}
            disabled={disabled || availableMics.length === 0}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {availableMics.length === 0 ? (
              <option value="">No se detectaron micrófonos (revisá permisos)</option>
            ) : (
              availableMics.map((mic, idx) => (
                <option key={mic.deviceId || idx} value={mic.deviceId}>
                  {mic.label || `Micrófono ${idx + 1}`}
                </option>
              ))
            )}
          </select>
        </div>

        <Button
          type="button"
          size="sm"
          variant={isTesting ? 'danger' : 'secondary'}
          onClick={isTesting ? onStopTest : onTestMic}
          disabled={disabled || availableMics.length === 0}
          icon={isTesting ? <Square className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          className="shrink-0"
        >
          {isTesting ? 'Detener Prueba' : 'Probar Micrófono'}
        </Button>
      </div>
    </div>
  )
}
