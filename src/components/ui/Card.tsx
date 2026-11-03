import React, { type HTMLAttributes } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  glass?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  glass = false,
  ...props
}) => {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
  }

  const glassStyle = glass
    ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-white/20 dark:border-slate-800/80 shadow-xl'
    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm'

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${glassStyle} ${
        paddings[padding]
      } ${
        hover
          ? 'hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/50 hover:-translate-y-0.5'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
