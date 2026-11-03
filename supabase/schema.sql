-- ============================================
-- RADIO ESCOLAR - Database Schema
-- Colegio Provincial N.º 10 - La Rioja, Argentina
-- Expo Innovarte 2026
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'alumno' CHECK (role IN ('superadmin', 'docente', 'alumno')),
  can_broadcast BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Perfiles de usuario que extienden auth.users de Supabase';
COMMENT ON COLUMN public.profiles.role IS 'Rol del usuario: superadmin, docente o alumno';
COMMENT ON COLUMN public.profiles.can_broadcast IS 'Si el usuario tiene permiso para transmitir';

-- ============================================
-- CHANNELS (canales de radio)
-- ============================================
CREATE TABLE public.channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  slogan TEXT,
  description TEXT,
  case_file TEXT, -- "Expediente" - caso/historia del canal
  color TEXT DEFAULT '#6366f1',
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.channels IS 'Canales de radio escolar';
COMMENT ON COLUMN public.channels.case_file IS 'Expediente o historia temática del canal';
COMMENT ON COLUMN public.channels.slug IS 'Identificador URL-friendly único del canal';

-- ============================================
-- CHANNEL MEMBERS (integrantes de canales)
-- ============================================
CREATE TABLE public.channel_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('host', 'member')),
  is_broadcaster BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

COMMENT ON TABLE public.channel_members IS 'Relación entre canales y sus integrantes';
COMMENT ON COLUMN public.channel_members.role IS 'Rol dentro del canal: host (conductor) o member (integrante)';

-- ============================================
-- PROGRAMS (programas de radio)
-- ============================================
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  scheduled_date DATE,
  scheduled_time_start TIME,
  scheduled_time_end TIME,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.programs IS 'Programas de radio programados';

-- ============================================
-- PROGRAM HOSTS (locutores/conductores de programa)
-- ============================================
CREATE TABLE public.program_hosts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  UNIQUE(program_id, user_id)
);

COMMENT ON TABLE public.program_hosts IS 'Conductores asignados a cada programa';

-- ============================================
-- BROADCASTS (transmisiones en vivo)
-- ============================================
CREATE TABLE public.broadcasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES public.programs(id),
  channel_id UUID NOT NULL REFERENCES public.channels(id),
  started_by UUID NOT NULL REFERENCES public.profiles(id),
  title TEXT,
  status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('live', 'ended', 'error')),
  listener_count INTEGER DEFAULT 0,
  livekit_room_name TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER
);

COMMENT ON TABLE public.broadcasts IS 'Registro de transmisiones en vivo';
COMMENT ON COLUMN public.broadcasts.livekit_room_name IS 'Nombre de la sala en LiveKit';

-- ============================================
-- RECORDINGS (grabaciones)
-- ============================================
CREATE TABLE public.recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broadcast_id UUID REFERENCES public.broadcasts(id) ON DELETE SET NULL,
  program_id UUID REFERENCES public.programs(id),
  channel_id UUID REFERENCES public.channels(id),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT,
  file_url TEXT,
  file_size_bytes BIGINT,
  duration_seconds INTEGER,
  format TEXT DEFAULT 'webm',
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'published', 'deleted')),
  is_published BOOLEAN DEFAULT FALSE,
  published_by UUID REFERENCES public.profiles(id),
  published_at TIMESTAMPTZ,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  consent_obtained BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.recordings IS 'Grabaciones de transmisiones';
COMMENT ON COLUMN public.recordings.consent_obtained IS 'Si se obtuvo consentimiento para la grabación';
COMMENT ON COLUMN public.recordings.expires_at IS 'Fecha de expiración automática de la grabación';

-- ============================================
-- CHAT MESSAGES (mensajes del chat público)
-- ============================================
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broadcast_id UUID REFERENCES public.broadcasts(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  content TEXT NOT NULL,
  is_moderator BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES public.profiles(id),
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.chat_messages IS 'Mensajes del chat público durante transmisiones';
COMMENT ON COLUMN public.chat_messages.alias IS 'Alias público del usuario (sin registro)';
COMMENT ON COLUMN public.chat_messages.session_id IS 'ID de sesión del navegador para identificación anónima';

-- ============================================
-- REJECTED MESSAGES (mensajes rechazados por filtro)
-- ============================================
CREATE TABLE public.rejected_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broadcast_id UUID REFERENCES public.broadcasts(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  content TEXT NOT NULL,
  reason TEXT NOT NULL,
  matched_filter TEXT,
  session_id TEXT NOT NULL,
  reviewed BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.rejected_messages IS 'Mensajes rechazados por el sistema de moderación automática';
COMMENT ON COLUMN public.rejected_messages.matched_filter IS 'Palabra o patrón que activó el filtro';

-- ============================================
-- BANNED WORDS (palabras prohibidas)
-- ============================================
CREATE TABLE public.banned_words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word TEXT NOT NULL UNIQUE,
  category TEXT DEFAULT 'general' CHECK (category IN ('insult', 'threat', 'harassment', 'discrimination', 'sexual', 'spam', 'general')),
  is_regex BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.banned_words IS 'Lista de palabras prohibidas para el filtro de chat';

-- ============================================
-- CHAT SANCTIONS (sanciones del chat)
-- ============================================
CREATE TABLE public.chat_sanctions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT,
  alias TEXT,
  sanction_type TEXT NOT NULL CHECK (sanction_type IN ('mute', 'ban', 'slow_mode')),
  reason TEXT,
  imposed_by UUID NOT NULL REFERENCES public.profiles(id),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.chat_sanctions IS 'Sanciones aplicadas a usuarios del chat';

-- ============================================
-- MODERATION LOG (historial de moderación)
-- ============================================
CREATE TABLE public.moderation_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moderator_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.moderation_log IS 'Registro de todas las acciones de moderación';

-- ============================================
-- CHAT SETTINGS (configuración del chat)
-- ============================================
CREATE TABLE public.chat_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  is_enabled BOOLEAN DEFAULT TRUE,
  slow_mode_seconds INTEGER DEFAULT 0,
  max_message_length INTEGER DEFAULT 300,
  rate_limit_messages INTEGER DEFAULT 5,
  rate_limit_window_seconds INTEGER DEFAULT 60,
  require_alias BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.chat_settings IS 'Configuración global del chat';

-- ============================================
-- RADIO SETTINGS (configuración general de la radio)
-- ============================================
CREATE TABLE public.radio_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  radio_name TEXT DEFAULT 'RADIO ESCOLAR',
  institution_name TEXT DEFAULT 'Colegio Provincial N.º 10',
  logo_url TEXT,
  welcome_message TEXT DEFAULT '¡Bienvenidos a Radio Escolar!',
  primary_color TEXT DEFAULT '#6366f1',
  secondary_color TEXT DEFAULT '#ec4899',
  social_facebook TEXT,
  social_instagram TEXT,
  social_twitter TEXT,
  social_youtube TEXT,
  privacy_policy TEXT,
  recording_retention_days INTEGER DEFAULT 90,
  allow_simultaneous_broadcasts BOOLEAN DEFAULT FALSE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.radio_settings IS 'Configuración general de la radio escolar';

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_chat_messages_broadcast ON public.chat_messages(broadcast_id);
CREATE INDEX idx_chat_messages_created ON public.chat_messages(created_at DESC);
CREATE INDEX idx_broadcasts_status ON public.broadcasts(status);
CREATE INDEX idx_broadcasts_channel ON public.broadcasts(channel_id);
CREATE INDEX idx_programs_channel ON public.programs(channel_id);
CREATE INDEX idx_programs_date ON public.programs(scheduled_date);
CREATE INDEX idx_recordings_status ON public.recordings(status);
CREATE INDEX idx_channel_members_channel ON public.channel_members(channel_id);
CREATE INDEX idx_channel_members_user ON public.channel_members(user_id);
CREATE INDEX idx_rejected_messages_broadcast ON public.rejected_messages(broadcast_id);
CREATE INDEX idx_chat_sanctions_session ON public.chat_sanctions(session_id);
CREATE INDEX idx_moderation_log_moderator ON public.moderation_log(moderator_id);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_channels_updated
  BEFORE UPDATE ON public.channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_programs_updated
  BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_chat_settings_updated
  BEFORE UPDATE ON public.chat_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_radio_settings_updated
  BEFORE UPDATE ON public.radio_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- AUTO-CREATE PROFILE ON AUTH SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Usuario')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
