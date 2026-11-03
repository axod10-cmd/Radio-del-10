export const APP_NAME = 'RADIO ESCOLAR'
export const INSTITUTION_NAME = 'Colegio Provincial N.º 10'
export const INSTITUTION_LOCATION = 'La Rioja, Argentina'

export const ROLES = {
  SUPERADMIN: 'superadmin',
  DOCENTE: 'docente',
  ALUMNO: 'alumno',
} as const

export const BROADCAST_STATUS = {
  LIVE: 'live',
  ENDED: 'ended',
  ERROR: 'error',
} as const

export const PROGRAM_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const RECORDING_STATUS = {
  PROCESSING: 'processing',
  READY: 'ready',
  PUBLISHED: 'published',
  DELETED: 'deleted',
} as const

export const CHAT_DEFAULTS = {
  MAX_MESSAGE_LENGTH: 300,
  RATE_LIMIT_MESSAGES: 5,
  RATE_LIMIT_WINDOW_SECONDS: 60,
  SLOW_MODE_SECONDS: 0,
  MIN_ALIAS_LENGTH: 2,
  MAX_ALIAS_LENGTH: 20,
} as const

export const ROUTES = {
  HOME: '/',
  SCHEDULE: '/programacion',
  ARCHIVE: '/archivo',
  CHANNEL: '/canal/:slug',
  LOGIN: '/login',
  STUDIO: '/estudio',
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/usuarios',
  ADMIN_CHANNELS: '/admin/canales',
  ADMIN_PROGRAMS: '/admin/programas',
  ADMIN_RECORDINGS: '/admin/grabaciones',
  ADMIN_MODERATION: '/admin/moderacion',
  ADMIN_SETTINGS: '/admin/configuracion',
} as const

export const CHANNEL_COLORS: Record<string, string> = {
  'enigma-tv': '#8b5cf6',
  'alerta-10': '#ef4444',
  'codigo-misterio': '#06b6d4',
  'punto-paranormal': '#f59e0b',
}
