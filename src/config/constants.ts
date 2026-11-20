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

export const DEFAULT_CHANNELS = [
  {
    id: 'enigma-tv',
    name: 'Enigma TV',
    slug: 'enigma-tv',
    slogan: 'Investigar antes de afirmar',
    description: 'Canal dedicado a la investigación y el pensamiento crítico. Nuestros locutores analizan misterios, leyendas urbanas y fenómenos inexplicables desde una perspectiva racional y científica. Cada programa busca separar los hechos de la ficción.',
    case_file: 'La estación de las sombras',
    color: '#8b5cf6',
    logo_url: null,
    is_active: true,
    sort_order: 1,
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'alerta-10',
    name: 'Alerta 10',
    slug: 'alerta-10',
    slogan: 'La información es protagonista',
    description: 'El canal informativo de Radio Escolar. Noticias, actualidad, eventos del colegio y de la comunidad riojana. Periodismo escolar comprometido con la verdad y la responsabilidad informativa.',
    case_file: 'Las luces que nadie puede explicar',
    color: '#ef4444',
    logo_url: null,
    is_active: true,
    sort_order: 2,
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'codigo-misterio',
    name: 'Código Misterio',
    slug: 'codigo-misterio',
    slogan: 'Todas las versiones cuentan',
    description: 'Un espacio para explorar las múltiples caras de cada historia. Debates, entrevistas y mesas redondas donde todas las voces son escuchadas. El misterio está en descubrir la verdad entre todas las versiones.',
    case_file: 'El misterio de la biblioteca',
    color: '#06b6d4',
    logo_url: null,
    is_active: true,
    sort_order: 3,
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'punto-paranormal',
    name: 'Punto Paranormal',
    slug: 'punto-paranormal',
    slogan: 'El misterio bajo la lupa',
    description: 'El canal que investiga lo inexplicable con rigor y curiosidad. Historias, testimonios y análisis de fenómenos paranormales, siempre desde el respeto y el pensamiento crítico. ¿Será verdad o será leyenda?',
    case_file: 'La radio que transmite sola',
    color: '#f59e0b',
    logo_url: null,
    is_active: true,
    sort_order: 4,
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
]

