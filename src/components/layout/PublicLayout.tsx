import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Radio, Calendar, Archive, LogIn, Menu, X, Shield, Mic, Headphones } from 'lucide-react'
import { useRadio } from '../../context/RadioContext'
import { useAuth } from '../../context/AuthContext'
import { LiveIndicator } from '../player/LiveIndicator'
import { APP_NAME, INSTITUTION_NAME, ROUTES } from '../../config/constants'

export const PublicLayout: React.FC = () => {
  const { isLive } = useRadio()
  const { user, profile } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { to: ROUTES.HOME, label: 'Inicio', icon: <Radio className="w-4 h-4" /> },
    { to: ROUTES.SCHEDULE, label: 'Programación', icon: <Calendar className="w-4 h-4" /> },
    { to: ROUTES.ARCHIVE, label: 'Grabaciones', icon: <Archive className="w-4 h-4" /> },
  ]

  const isActive = (path: string) => {
    if (path === ROUTES.HOME) {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Institution */}
          <Link to={ROUTES.HOME} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                  {APP_NAME}
                </span>
                {isLive && <LiveIndicator size="sm" />}
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-none">
                {INSTITUTION_NAME}
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive(link.to)
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right actions: Auth button or Panel link */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                {(profile?.can_broadcast || profile?.role === 'docente' || profile?.role === 'superadmin') && (
                  <Link
                    to={ROUTES.STUDIO}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    Estudio
                  </Link>
                )}
                <Link
                  to={ROUTES.ADMIN}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Panel Admin
                </Link>
              </div>
            ) : (
              <Link
                to={ROUTES.LOGIN}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                Ingresar Docente / Alumno
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            {isLive && <LiveIndicator size="sm" showText={false} />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive(link.to)
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              {user ? (
                <>
                  {(profile?.can_broadcast || profile?.role === 'docente' || profile?.role === 'superadmin') && (
                    <Link
                      to={ROUTES.STUDIO}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-white"
                    >
                      <Mic className="w-4 h-4" />
                      Ir al Estudio
                    </Link>
                  )}
                  <Link
                    to={ROUTES.ADMIN}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white"
                  >
                    <Shield className="w-4 h-4" />
                    Panel de Administración
                  </Link>
                </>
              ) : (
                <Link
                  to={ROUTES.LOGIN}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  <LogIn className="w-4 h-4" />
                  Ingreso Institucional
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Public Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {APP_NAME} — {INSTITUTION_NAME}
            </span>
            <span>•</span>
            <span>La Rioja, Argentina</span>
          </div>
          <div>
            <span className="font-medium">
              Especial Expo Innovarte 2026 — Cuatro canales estudiantiles
            </span>
          </div>
          <div className="text-[11px]">
            © {new Date().getFullYear()} Colegio Provincial N.º 10. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
