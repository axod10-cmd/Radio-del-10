import { Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RadioProvider } from './context/RadioContext'
import { PublicLayout } from './components/layout/PublicLayout'
import { AdminLayout } from './components/layout/AdminLayout'
import { StudioLayout } from './components/layout/StudioLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { Spinner } from './components/ui/Spinner'
import {
  HomePage,
  SchedulePage,
  ArchivePage,
  ChannelPage,
  LoginPage,
  StudioPage,
  DashboardPage,
  UsersPage,
  ChannelsPage,
  ProgramsPage,
  RecordingsPage,
  ModerationPage,
  SettingsPage,
  NotFoundPage,
} from './config/routes'

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RadioProvider>
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Spinner size="lg" text="Cargando Radio Escolar..." />
              </div>
            }
          >
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/programacion" element={<SchedulePage />} />
                <Route path="/archivo" element={<ArchivePage />} />
                <Route path="/canal/:slug" element={<ChannelPage />} />
                <Route path="/login" element={<LoginPage />} />
              </Route>

              {/* Studio Live Broadcasting (Protected) */}
              <Route
                element={
                  <ProtectedRoute requireBroadcastPermission>
                    <StudioLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/estudio" element={<StudioPage />} />
              </Route>

              {/* Admin Panel (Protected) */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={['superadmin', 'docente', 'alumno']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/admin" element={<DashboardPage />} />
                <Route
                  path="/admin/usuarios"
                  element={
                    <ProtectedRoute allowedRoles={['superadmin']}>
                      <UsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/canales"
                  element={
                    <ProtectedRoute allowedRoles={['superadmin', 'docente']}>
                      <ChannelsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/programas"
                  element={
                    <ProtectedRoute allowedRoles={['superadmin', 'docente']}>
                      <ProgramsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/grabaciones"
                  element={
                    <ProtectedRoute allowedRoles={['superadmin', 'docente']}>
                      <RecordingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/moderacion"
                  element={
                    <ProtectedRoute allowedRoles={['superadmin', 'docente']}>
                      <ModerationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/configuracion"
                  element={
                    <ProtectedRoute allowedRoles={['superadmin']}>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* 404 Fallback */}
              <Route element={<PublicLayout />}>
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
        </RadioProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
