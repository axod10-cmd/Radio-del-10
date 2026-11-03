import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Radio, ArrowLeft } from 'lucide-react'
import { APP_NAME, ROUTES } from '../../config/constants'
import { useAuth } from '../../context/AuthContext'

export const StudioLayout: React.FC = () => {
  const { profile } = useAuth()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none">
      {/* Studio Header */}
      <header className="h-16 px-4 sm:px-8 border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            to={ROUTES.ADMIN}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Panel</span>
          </Link>
          <div className="h-5 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block">
                {APP_NAME} — Estudio de Transmisión
              </span>
              <span className="text-[10px] text-slate-400 block">
                Operador: {profile?.display_name || profile?.full_name || 'Autorizado'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.HOME}
            target="_blank"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold hidden sm:inline"
          >
            Abrir sintonizador público ↗
          </Link>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  )
}
