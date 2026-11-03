import React from 'react'
import { Radio } from 'lucide-react'

export interface LiveIndicatorProps {
  size?: 'sm' | 'md'
  showText?: boolean
  className?: string
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2 bg-red-600/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 rounded-full font-bold select-none px-3 py-1 ${
        size === 'sm' ? 'text-xs' : 'text-sm'
      } ${className}`}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
      </span>
      {showText && (
        <span className="tracking-widest flex items-center gap-1.5 font-extrabold uppercase text-[11px]">
          <Radio className="w-3.5 h-3.5" />
          En Vivo
        </span>
      )}
    </div>
  )
}
