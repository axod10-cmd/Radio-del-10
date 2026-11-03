import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Radio,
  Calendar,
  Disc,
  ShieldAlert,
  Settings,
  Mic,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronRight,
  GraduationCap,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { APP_NAME, ROUTES } from '../../config/constants'
import { Avatar } from '../ui/Avatar'

export const AdminLayout: React.FC = () => {
  const { profile, signOut, isAdmin, isDocente, canBroadcast } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate(ROUTES.HOME)
  }

  const menuItems = [
    {
      to: ROUTES.ADMIN_DASHBOARD,
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      allowed: true,
    },
    {
      to: ROUTES.ADMIN_USERS,
      label: 'Usuarios y Permisos',
      icon: <Users className="w-5 h-5" />,
      allowed: isAdmin, // Only superadmin can manage users fully
    },
    {
      to: ROUTES.ADMIN_CHANNELS,
      label: 'Canales',
      icon: <Radio className="w-5 h-5" />,
      allowed: isDocente,
    },
    {
      to: ROUTES.ADMIN_PROGRAMS,
      label: 'Programación',
      icon: <Calendar className="w-5 h-5" />,
      allowed: isDocente,
    },
    {
      to: ROUTES.ADMIN_RECORDINGS,
      label: 'Grabaciones',
      icon: <Disc className="w-5 h-5" />,
      allowed: isDocente,
    },
    {
      to: ROUTES.ADMIN_MODERATION,
      label: 'Moderación Chat',
      icon: <ShieldAlert className="w-5 h-5" />,
      allowed: isDocente,
    },
    {
      to: ROUTES.ADMIN_SETTINGS,
      label: 'Configuración',
      icon: <Settings className="w-5 h-5" />,
      allowed: isAdmin,
    },
  ]

  const isActive = (path: string) => {
    if (path === ROUTES.ADMIN_DASHBOARD) {
      return location.pathname === ROUTES.ADMIN || location.pathname === ROUTES.ADMIN_DASHBOARD
    }
    return location.pathname.startsWith(path)
  }

  const roleLabel = {
    superadmin: 'Superadministrador',
    docente: 'Docente',
    alumno: 'Alumno Locutor',
  }[profile?.role || 'alumno']

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <Link to={ROUTES.HOME} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">
                {APP_NAME}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Panel de Control
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Studio Link */}
        {canBroadcast && (
          <div className="p-4 pb-2">
            <Link
              to={ROUTES.STUDIO}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02]"
            >
              <Mic className="w-4 h-4 animate-pulse" />
              <span>Entrar al Estudio en Vivo</span>
            </Link>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-3 space-y-1 overflow-y-auto">
          {menuItems
            .filter((item) => item.allowed)
            .map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive(item.to)
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 shrink-0 space-y-3">
          <div className="flex items-center gap-3 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
            <Avatar name={profile?.display_name || 'Docente'} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {profile?.display_name || profile?.full_name || 'Docente'}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-medium">
                <GraduationCap className="w-3 h-3" />
                <span>{roleLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={ROUTES.HOME}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver Radio</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center p-2 rounded-lg text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-900/50 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Link to={ROUTES.ADMIN} className="hover:text-slate-800 dark:hover:text-slate-200">
                Administración
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                {location.pathname.split('/').pop() || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold">
              {roleLabel}
            </span>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
