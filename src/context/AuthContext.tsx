import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '../types/database'

export const DEMO_CREDENTIALS = [
  {
    role: 'superadmin' as const,
    label: 'Superadministrador',
    email: 'admin@colegio10.edu.ar',
    password: 'Radio10Admin2026!',
    description: 'Control institucional completo, gestión de usuarios, canales y configuración.',
    profile: {
      id: 'demo-admin-id',
      email: 'admin@colegio10.edu.ar',
      full_name: 'Profesor Administrador',
      display_name: 'SuperAdmin Radio 10',
      avatar_url: null,
      role: 'superadmin' as const,
      can_broadcast: true,
      is_active: true,
      created_at: '2026-03-01T00:00:00Z',
      updated_at: '2026-03-01T00:00:00Z',
    },
  },
  {
    role: 'docente' as const,
    label: 'Docente Coordinador',
    email: 'docente@colegio10.edu.ar',
    password: 'DocenteRadio10!',
    description: 'Acceso a estudio, grilla de programas, grabaciones y moderación de chat.',
    profile: {
      id: 'demo-docente-id',
      email: 'docente@colegio10.edu.ar',
      full_name: 'Docente Coordinador',
      display_name: 'Prof. García',
      avatar_url: null,
      role: 'docente' as const,
      can_broadcast: true,
      is_active: true,
      created_at: '2026-03-01T00:00:00Z',
      updated_at: '2026-03-01T00:00:00Z',
    },
  },
  {
    role: 'alumno' as const,
    label: 'Alumno Locutor',
    email: 'alumno@colegio10.edu.ar',
    password: 'AlumnoRadio10!',
    description: 'Habilitado para transmitir en el estudio de radio con micrófono en vivo.',
    profile: {
      id: 'demo-alumno-id',
      email: 'alumno@colegio10.edu.ar',
      full_name: 'Estudiante Locutor',
      display_name: 'Locutor 1er Año',
      avatar_url: null,
      role: 'alumno' as const,
      can_broadcast: true,
      is_active: true,
      created_at: '2026-03-01T00:00:00Z',
      updated_at: '2026-03-01T00:00:00Z',
    },
  },
]

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  isAdmin: boolean
  isDocente: boolean
  isAlumno: boolean
  canBroadcast: boolean
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check saved demo session first
    const savedDemo = sessionStorage.getItem('radio10_demo_session')
    if (savedDemo) {
      const match = DEMO_CREDENTIALS.find(
        (c) => c.email.toLowerCase() === savedDemo.toLowerCase()
      )
      if (match) {
        setUser({ id: match.profile.id, email: match.profile.email } as any)
        setProfile(match.profile)
        setSession({ access_token: 'demo-token', user: match.profile } as any)
        setLoading(false)
        return
      }
    }

    // Get initial session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    }).catch(() => {
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  async function signIn(email: string, password: string) {
    const trimmedEmail = email.trim().toLowerCase()
    const demo = DEMO_CREDENTIALS.find(
      (c) => c.email.toLowerCase() === trimmedEmail && c.password === password
    )

    if (demo) {
      setUser({ id: demo.profile.id, email: demo.profile.email } as any)
      setProfile(demo.profile)
      setSession({ access_token: 'demo-token', user: demo.profile } as any)
      sessionStorage.setItem('radio10_demo_session', demo.email)
      return { error: null }
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        if (error.message.includes('Invalid login')) {
          return { error: 'Email o contraseña incorrectos' }
        }
        return { error: error.message }
      }
      sessionStorage.removeItem('radio10_demo_session')
      return { error: null }
    } catch {
      return { error: 'Error de conexión. Intentá nuevamente.' }
    }
  }

  async function signOut() {
    sessionStorage.removeItem('radio10_demo_session')
    try {
      await supabase.auth.signOut()
    } catch {}
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  const isAdmin = profile?.role === 'superadmin'
  const isDocente = profile?.role === 'docente' || isAdmin
  const isAlumno = profile?.role === 'alumno'
  const canBroadcast = profile?.can_broadcast === true || isDocente

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signIn,
        signOut,
        isAdmin,
        isDocente,
        isAlumno,
        canBroadcast,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
