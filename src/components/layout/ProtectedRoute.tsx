import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Spinner } from '../ui/Spinner'
import { ShieldAlert } from 'lucide-react'
import { Button } from '../ui/Button'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../config/constants'

export interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('superadmin' | 'docente' | 'alumno')[]
  requireBroadcastPermission?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireBroadcastPermission = false,
}) => {
  const { user, profile, loading, canBroadcast } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner size="lg" text="Verificando permisos y credenciales..." />
      </div>
    )
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  // If specific roles required
  if (allowedRoles && profile) {
    const hasRole = allowedRoles.includes(profile.role)
    if (!hasRole) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Acceso no autorizado
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6">
            Tu cuenta con rol de <strong className="capitalize">{profile.role}</strong> no cuenta con los permisos necesarios para acceder a esta sección.
          </p>
          <Link to={ROUTES.HOME}>
            <Button variant="primary">Volver al Inicio</Button>
          </Link>
        </div>
      )
    }
  }

  // If broadcasting permission required
  if (requireBroadcastPermission && !canBroadcast) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Habilitación para transmitir requerida
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6">
          Tu cuenta de alumno aún no ha sido autorizada por el equipo docente para salir al aire. Por favor, solicitale a tu profesor a cargo la habilitación.
        </p>
        <Link to={ROUTES.HOME}>
          <Button variant="primary">Volver a la Radio</Button>
        </Link>
      </div>
    )
  }

  return <>{children}</>
}
