import React from 'react'
import { Card } from './Card'

export interface StatsCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  trendType?: 'up' | 'down' | 'neutral'
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple'
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  icon,
  trend,
  trendType = 'neutral',
  color = 'indigo',
}) => {
  const colorStyles = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
    sky: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400',
  }

  const trendColors = {
    up: 'text-emerald-500',
    down: 'text-rose-500',
    neutral: 'text-slate-400',
  }

  return (
    <Card hover className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {value}
        </p>
        {trend && (
          <p className={`text-[11px] font-medium ${trendColors[trendType]}`}>{trend}</p>
        )}
      </div>
      <div className={`p-3 rounded-2xl shrink-0 ${colorStyles[color]}`}>{icon}</div>
    </Card>
  )
}
