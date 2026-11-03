import React from 'react'

export interface AudioMeterProps {
  level: number // 0 to 100
  isLive?: boolean
  className?: string
}

export const AudioMeter: React.FC<AudioMeterProps> = ({ level, isLive = false, className = '' }) => {
  // Clamp level between 0 and 100
  const clampedLevel = Math.min(100, Math.max(0, level))

  // Determine meter segment color
  const getMeterColor = (val: number) => {
    if (val > 80) return 'from-amber-400 to-rose-500 shadow-rose-500/50'
    if (val > 50) return 'from-emerald-400 to-amber-400 shadow-amber-500/50'
    return 'from-emerald-500 to-teal-400 shadow-emerald-500/50'
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              clampedLevel > 5
                ? isLive
                  ? 'bg-rose-500 animate-ping'
                  : 'bg-emerald-500'
                : 'bg-slate-600'
            }`}
          />
          Nivel de Entrada (VU)
        </span>
        <span className="font-bold">{clampedLevel}%</span>
      </div>

      {/* Meter Bar */}
      <div className="h-4 w-full bg-slate-900 rounded-lg p-0.5 border border-slate-800 overflow-hidden relative">
        {/* Scale markings */}
        <div className="absolute inset-0 flex justify-between px-1 pointer-events-none z-10 opacity-30">
          <div className="w-px h-full bg-slate-500" />
          <div className="w-px h-full bg-slate-500" />
          <div className="w-px h-full bg-slate-500" />
          <div className="w-px h-full bg-slate-500" />
        </div>

        {/* Dynamic bar */}
        <div
          className={`h-full rounded-md bg-gradient-to-r transition-all duration-75 shadow-sm ${getMeterColor(
            clampedLevel
          )}`}
          style={{ width: `${clampedLevel}%` }}
        />
      </div>

      <div className="flex justify-between text-[9px] text-slate-500 font-mono px-0.5">
        <span>-48dB</span>
        <span>-24dB</span>
        <span>-12dB</span>
        <span>-6dB</span>
        <span className="text-rose-400 font-bold">0dB CLIP</span>
      </div>
    </div>
  )
}
