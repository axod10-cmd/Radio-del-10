import React from 'react'
import { Volume2, Volume1, VolumeX } from 'lucide-react'

export interface VolumeControlProps {
  volume: number // 0 to 100
  onChange: (val: number) => void
  className?: string
}

export const VolumeControl: React.FC<VolumeControlProps> = ({ volume, onChange, className = '' }) => {
  const getIcon = () => {
    if (volume === 0) return <VolumeX className="w-5 h-5 text-slate-400" />
    if (volume < 50) return <Volume1 className="w-5 h-5 text-indigo-500" />
    return <Volume2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
  }

  const toggleMute = () => {
    if (volume > 0) {
      onChange(0)
    } else {
      onChange(80)
    }
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <button
        type="button"
        onClick={toggleMute}
        className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        aria-label={volume === 0 ? 'Activar sonido' : 'Silenciar'}
      >
        {getIcon()}
      </button>
      <input
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 sm:w-28 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
        aria-label="Control de volumen"
      />
      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 w-7 text-right">
        {volume}%
      </span>
    </div>
  )
}
