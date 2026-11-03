import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Radio, Lock, Mail, ArrowLeft, ShieldAlert, Sparkles } from 'lucide-react'
import { APP_NAME, INSTITUTION_NAME, ROUTES } from '../../config/constants'

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname || ROUTES.ADMIN

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor, ingresá tu correo institucional y contraseña.')
      return
    }

    setLoading(true)
    const res = await signIn(email, password)
    setLoading(false)

    if (res.error) {
      setErrorMessage(res.error)
    } else {
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-10 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back link */}
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la sintonía pública</span>
        </Link>

        {/* Card */}
        <Card glass padding="lg" className="shadow-2xl border-slate-200/80 dark:border-slate-800">
          <div className="text-center space-y-2 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
              <Radio className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Acceso Institucional
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {APP_NAME} — {INSTITUTION_NAME}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2.5 text-xs text-rose-600 dark:text-rose-400">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="docente@escuela10.edu.ar"
              icon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              required
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
              required
            />

            <Button type="submit" variant="primary" fullWidth isLoading={loading} size="lg">
              Iniciar Sesión
            </Button>
          </form>

          {/* Clarification banner */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>¿Sos oyente? No necesitás cuenta para escuchar o comentar.</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
