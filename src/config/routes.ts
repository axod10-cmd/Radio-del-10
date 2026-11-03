import { lazy } from 'react'

// Public pages
export const HomePage = lazy(() =>
  import('../pages/public/HomePage').then((m) => ({ default: m.HomePage }))
)
export const SchedulePage = lazy(() =>
  import('../pages/public/SchedulePage').then((m) => ({ default: m.SchedulePage }))
)
export const ArchivePage = lazy(() =>
  import('../pages/public/ArchivePage').then((m) => ({ default: m.ArchivePage }))
)
export const ChannelPage = lazy(() =>
  import('../pages/public/ChannelPage').then((m) => ({ default: m.ChannelPage }))
)

// Auth
export const LoginPage = lazy(() =>
  import('../pages/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
)

// Studio
export const StudioPage = lazy(() =>
  import('../pages/studio/StudioPage').then((m) => ({ default: m.StudioPage }))
)

// Admin
export const DashboardPage = lazy(() =>
  import('../pages/admin/DashboardPage').then((m) => ({ default: m.DashboardPage }))
)
export const UsersPage = lazy(() =>
  import('../pages/admin/UsersPage').then((m) => ({ default: m.UsersPage }))
)
export const ChannelsPage = lazy(() =>
  import('../pages/admin/ChannelsPage').then((m) => ({ default: m.ChannelsPage }))
)
export const ProgramsPage = lazy(() =>
  import('../pages/admin/ProgramsPage').then((m) => ({ default: m.ProgramsPage }))
)
export const RecordingsPage = lazy(() =>
  import('../pages/admin/RecordingsPage').then((m) => ({ default: m.RecordingsPage }))
)
export const ModerationPage = lazy(() =>
  import('../pages/admin/ModerationPage').then((m) => ({ default: m.ModerationPage }))
)
export const SettingsPage = lazy(() =>
  import('../pages/admin/SettingsPage').then((m) => ({ default: m.SettingsPage }))
)

// Errors
export const NotFoundPage = lazy(() =>
  import('../pages/errors/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
)
export const OfflinePage = lazy(() =>
  import('../pages/errors/OfflinePage').then((m) => ({ default: m.OfflinePage }))
)
