-- ============================================
-- RADIO ESCOLAR - Row Level Security Policies
-- ============================================
-- Roles:
--   superadmin: acceso total
--   docente: administración de canales y moderación
--   alumno: participación básica
--   anon: solo lectura pública y envío de chat
-- ============================================

-- Helper function: check if user is admin (superadmin or docente)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('superadmin', 'docente')
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function: check if user is superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'superadmin'
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function: check if user can broadcast
CREATE OR REPLACE FUNCTION public.can_user_broadcast()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND can_broadcast = TRUE
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function: get current user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.profiles
  WHERE id = auth.uid() AND is_active = TRUE;
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;


-- ============================================
-- PROFILES
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can read basic public profile info
CREATE POLICY "profiles_public_read"
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- Users can update their own profile (limited fields handled at app level)
CREATE POLICY "profiles_self_update"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can update any profile
CREATE POLICY "profiles_admin_update"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can insert profiles (for manual user creation)
CREATE POLICY "profiles_admin_insert"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Only superadmin can delete profiles
CREATE POLICY "profiles_superadmin_delete"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (public.is_superadmin());


-- ============================================
-- CHANNELS
-- ============================================
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

-- Anyone can read active channels
CREATE POLICY "channels_public_read"
  ON public.channels
  FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

-- Admins can read all channels (including inactive)
CREATE POLICY "channels_admin_read_all"
  ON public.channels
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Only superadmin can create channels
CREATE POLICY "channels_superadmin_insert"
  ON public.channels
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_superadmin());

-- Only superadmin can update channels
CREATE POLICY "channels_superadmin_update"
  ON public.channels
  FOR UPDATE
  TO authenticated
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

-- Only superadmin can delete channels
CREATE POLICY "channels_superadmin_delete"
  ON public.channels
  FOR DELETE
  TO authenticated
  USING (public.is_superadmin());


-- ============================================
-- CHANNEL MEMBERS
-- ============================================
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;

-- Anyone can read channel members
CREATE POLICY "channel_members_public_read"
  ON public.channel_members
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- Admins can insert channel members
CREATE POLICY "channel_members_admin_insert"
  ON public.channel_members
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can update channel members
CREATE POLICY "channel_members_admin_update"
  ON public.channel_members
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete channel members
CREATE POLICY "channel_members_admin_delete"
  ON public.channel_members
  FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================
-- PROGRAMS
-- ============================================
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Anyone can read programs (scheduled, live, completed)
CREATE POLICY "programs_public_read"
  ON public.programs
  FOR SELECT
  TO anon, authenticated
  USING (status IN ('scheduled', 'live', 'completed'));

-- Admins can read all programs (including cancelled)
CREATE POLICY "programs_admin_read_all"
  ON public.programs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can create programs
CREATE POLICY "programs_admin_insert"
  ON public.programs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can update programs
CREATE POLICY "programs_admin_update"
  ON public.programs
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete programs
CREATE POLICY "programs_admin_delete"
  ON public.programs
  FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================
-- PROGRAM HOSTS
-- ============================================
ALTER TABLE public.program_hosts ENABLE ROW LEVEL SECURITY;

-- Anyone can read program hosts
CREATE POLICY "program_hosts_public_read"
  ON public.program_hosts
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- Admins can manage program hosts
CREATE POLICY "program_hosts_admin_insert"
  ON public.program_hosts
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "program_hosts_admin_delete"
  ON public.program_hosts
  FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================
-- BROADCASTS
-- ============================================
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

-- Anyone can read live broadcasts
CREATE POLICY "broadcasts_public_read_live"
  ON public.broadcasts
  FOR SELECT
  TO anon, authenticated
  USING (status = 'live');

-- Authenticated users can read all broadcasts
CREATE POLICY "broadcasts_auth_read_all"
  ON public.broadcasts
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Users with broadcast permission can create broadcasts
CREATE POLICY "broadcasts_broadcaster_insert"
  ON public.broadcasts
  FOR INSERT
  TO authenticated
  WITH CHECK (public.can_user_broadcast() AND started_by = auth.uid());

-- Broadcaster can update their own broadcast (end it)
CREATE POLICY "broadcasts_broadcaster_update_own"
  ON public.broadcasts
  FOR UPDATE
  TO authenticated
  USING (started_by = auth.uid())
  WITH CHECK (started_by = auth.uid());

-- Admins can update any broadcast
CREATE POLICY "broadcasts_admin_update"
  ON public.broadcasts
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete broadcasts
CREATE POLICY "broadcasts_admin_delete"
  ON public.broadcasts
  FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================
-- RECORDINGS
-- ============================================
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;

-- Anyone can read published recordings
CREATE POLICY "recordings_public_read_published"
  ON public.recordings
  FOR SELECT
  TO anon, authenticated
  USING (is_published = TRUE AND status = 'published');

-- Admins can read all recordings
CREATE POLICY "recordings_admin_read_all"
  ON public.recordings
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can create recordings
CREATE POLICY "recordings_admin_insert"
  ON public.recordings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Broadcasters can create recordings of their own broadcasts
CREATE POLICY "recordings_broadcaster_insert"
  ON public.recordings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.can_user_broadcast() AND
    EXISTS (
      SELECT 1 FROM public.broadcasts
      WHERE broadcasts.id = broadcast_id
      AND broadcasts.started_by = auth.uid()
    )
  );

-- Admins can update recordings
CREATE POLICY "recordings_admin_update"
  ON public.recordings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only superadmin can delete recordings
CREATE POLICY "recordings_superadmin_delete"
  ON public.recordings
  FOR DELETE
  TO authenticated
  USING (public.is_superadmin());


-- ============================================
-- CHAT MESSAGES
-- ============================================
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can read chat messages
CREATE POLICY "chat_messages_public_read"
  ON public.chat_messages
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- Anyone (including anon) can insert chat messages
CREATE POLICY "chat_messages_anon_insert"
  ON public.chat_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    LENGTH(content) > 0 AND
    LENGTH(content) <= 500 AND
    LENGTH(alias) >= 2 AND
    LENGTH(alias) <= 30
  );

-- Admins can delete chat messages
CREATE POLICY "chat_messages_admin_delete"
  ON public.chat_messages
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Admins can update chat messages (for moderation flags)
CREATE POLICY "chat_messages_admin_update"
  ON public.chat_messages
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================
-- REJECTED MESSAGES
-- ============================================
ALTER TABLE public.rejected_messages ENABLE ROW LEVEL SECURITY;

-- Only admins can read rejected messages
CREATE POLICY "rejected_messages_admin_read"
  ON public.rejected_messages
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- System/anon can insert rejected messages (from filter)
CREATE POLICY "rejected_messages_insert"
  ON public.rejected_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

-- Admins can update (mark as reviewed)
CREATE POLICY "rejected_messages_admin_update"
  ON public.rejected_messages
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete rejected messages
CREATE POLICY "rejected_messages_admin_delete"
  ON public.rejected_messages
  FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================
-- BANNED WORDS
-- ============================================
ALTER TABLE public.banned_words ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read banned words (needed for client-side filtering)
CREATE POLICY "banned_words_auth_read"
  ON public.banned_words
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Anon can also read (for client-side pre-filter)
CREATE POLICY "banned_words_anon_read"
  ON public.banned_words
  FOR SELECT
  TO anon
  USING (is_active = TRUE);

-- Only admins can insert banned words
CREATE POLICY "banned_words_admin_insert"
  ON public.banned_words
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Only admins can update banned words
CREATE POLICY "banned_words_admin_update"
  ON public.banned_words
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can delete banned words
CREATE POLICY "banned_words_admin_delete"
  ON public.banned_words
  FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================
-- CHAT SANCTIONS
-- ============================================
ALTER TABLE public.chat_sanctions ENABLE ROW LEVEL SECURITY;

-- Only admins can read sanctions
CREATE POLICY "chat_sanctions_admin_read"
  ON public.chat_sanctions
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Anon can check if their session is sanctioned
CREATE POLICY "chat_sanctions_anon_check"
  ON public.chat_sanctions
  FOR SELECT
  TO anon
  USING (is_active = TRUE);

-- Only admins can create sanctions
CREATE POLICY "chat_sanctions_admin_insert"
  ON public.chat_sanctions
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Only admins can update sanctions
CREATE POLICY "chat_sanctions_admin_update"
  ON public.chat_sanctions
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can delete sanctions
CREATE POLICY "chat_sanctions_admin_delete"
  ON public.chat_sanctions
  FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================
-- MODERATION LOG
-- ============================================
ALTER TABLE public.moderation_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read moderation log
CREATE POLICY "moderation_log_admin_read"
  ON public.moderation_log
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Only admins can insert moderation log entries
CREATE POLICY "moderation_log_admin_insert"
  ON public.moderation_log
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());


-- ============================================
-- CHAT SETTINGS
-- ============================================
ALTER TABLE public.chat_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read chat settings
CREATE POLICY "chat_settings_public_read"
  ON public.chat_settings
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- Only admins can update chat settings
CREATE POLICY "chat_settings_admin_update"
  ON public.chat_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================
-- RADIO SETTINGS
-- ============================================
ALTER TABLE public.radio_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read radio settings
CREATE POLICY "radio_settings_public_read"
  ON public.radio_settings
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- Only admins can update radio settings
CREATE POLICY "radio_settings_admin_update"
  ON public.radio_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only superadmin can insert radio settings
CREATE POLICY "radio_settings_superadmin_insert"
  ON public.radio_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_superadmin());
