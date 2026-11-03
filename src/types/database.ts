// ============================================
// RADIO ESCOLAR - Database TypeScript Types
// Matches Supabase schema exactly
// ============================================

// ============================================
// ENUMS
// ============================================

export type UserRole = 'superadmin' | 'docente' | 'alumno';

export type ChannelMemberRole = 'host' | 'member';

export type ProgramStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';

export type BroadcastStatus = 'live' | 'ended' | 'error';

export type RecordingStatus = 'processing' | 'ready' | 'published' | 'deleted';

export type RecordingFormat = 'webm' | 'mp3' | 'ogg' | 'wav';

export type BannedWordCategory =
  | 'insult'
  | 'threat'
  | 'harassment'
  | 'discrimination'
  | 'sexual'
  | 'spam'
  | 'general';

export type SanctionType = 'mute' | 'ban' | 'slow_mode';

export type ThemeMode = 'light' | 'dark' | 'auto';

// ============================================
// TABLE ROW TYPES
// ============================================

export interface Profile {
  id: string;
  email: string | null;
  full_name: string;
  display_name: string;
  avatar_url: string | null;
  role: UserRole;
  can_broadcast: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Channel {
  id: string;
  name: string;
  slug: string;
  slogan: string | null;
  description: string | null;
  case_file: string | null;
  color: string;
  logo_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  role: ChannelMemberRole;
  is_broadcaster: boolean;
  created_at: string;
}

export interface Program {
  id: string;
  channel_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  scheduled_date: string | null;
  scheduled_time_start: string | null;
  scheduled_time_end: string | null;
  status: ProgramStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProgramHost {
  id: string;
  program_id: string;
  user_id: string;
}

export interface Broadcast {
  id: string;
  program_id: string | null;
  channel_id: string;
  started_by: string;
  title: string | null;
  status: BroadcastStatus;
  listener_count: number;
  livekit_room_name: string | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
}

export interface Recording {
  id: string;
  broadcast_id: string | null;
  program_id: string | null;
  channel_id: string | null;
  title: string;
  description: string | null;
  file_path: string | null;
  file_url: string | null;
  file_size_bytes: number | null;
  duration_seconds: number | null;
  format: string;
  status: RecordingStatus;
  is_published: boolean;
  published_by: string | null;
  published_at: string | null;
  recorded_at: string;
  expires_at: string | null;
  consent_obtained: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  broadcast_id: string | null;
  alias: string;
  content: string;
  is_moderator: boolean;
  user_id: string | null;
  session_id: string;
  created_at: string;
}

export interface RejectedMessage {
  id: string;
  broadcast_id: string | null;
  alias: string;
  content: string;
  reason: string;
  matched_filter: string | null;
  session_id: string;
  reviewed: boolean;
  reviewed_by: string | null;
  created_at: string;
}

export interface BannedWord {
  id: string;
  word: string;
  category: BannedWordCategory;
  is_regex: boolean;
  is_active: boolean;
  created_at: string;
}

export interface ChatSanction {
  id: string;
  session_id: string | null;
  alias: string | null;
  sanction_type: SanctionType;
  reason: string | null;
  imposed_by: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ModerationLog {
  id: string;
  moderator_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface ChatSettings {
  id: string;
  is_enabled: boolean;
  slow_mode_seconds: number;
  max_message_length: number;
  rate_limit_messages: number;
  rate_limit_window_seconds: number;
  require_alias: boolean;
  created_at: string;
  updated_at: string;
}

export interface RadioSettings {
  id: string;
  radio_name: string;
  institution_name: string;
  logo_url: string | null;
  welcome_message: string;
  primary_color: string;
  secondary_color: string;
  social_facebook: string | null;
  social_instagram: string | null;
  social_twitter: string | null;
  social_youtube: string | null;
  privacy_policy: string | null;
  recording_retention_days: number;
  allow_simultaneous_broadcasts: boolean;
  theme: ThemeMode;
  created_at: string;
  updated_at: string;
}

// ============================================
// INSERT TYPES (optional fields marked with ?)
// ============================================

export interface ProfileInsert {
  id: string;
  email?: string | null;
  full_name: string;
  display_name: string;
  avatar_url?: string | null;
  role?: UserRole;
  can_broadcast?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ChannelInsert {
  id?: string;
  name: string;
  slug: string;
  slogan?: string | null;
  description?: string | null;
  case_file?: string | null;
  color?: string;
  logo_url?: string | null;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ChannelMemberInsert {
  id?: string;
  channel_id: string;
  user_id: string;
  role?: ChannelMemberRole;
  is_broadcaster?: boolean;
  created_at?: string;
}

export interface ProgramInsert {
  id?: string;
  channel_id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  scheduled_date?: string | null;
  scheduled_time_start?: string | null;
  scheduled_time_end?: string | null;
  status?: ProgramStatus;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProgramHostInsert {
  id?: string;
  program_id: string;
  user_id: string;
}

export interface BroadcastInsert {
  id?: string;
  program_id?: string | null;
  channel_id: string;
  started_by: string;
  title?: string | null;
  status?: BroadcastStatus;
  listener_count?: number;
  livekit_room_name?: string | null;
  started_at?: string;
  ended_at?: string | null;
  duration_seconds?: number | null;
}

export interface RecordingInsert {
  id?: string;
  broadcast_id?: string | null;
  program_id?: string | null;
  channel_id?: string | null;
  title: string;
  description?: string | null;
  file_path?: string | null;
  file_url?: string | null;
  file_size_bytes?: number | null;
  duration_seconds?: number | null;
  format?: string;
  status?: RecordingStatus;
  is_published?: boolean;
  published_by?: string | null;
  published_at?: string | null;
  recorded_at?: string;
  expires_at?: string | null;
  consent_obtained?: boolean;
  created_at?: string;
}

export interface ChatMessageInsert {
  id?: string;
  broadcast_id?: string | null;
  alias: string;
  content: string;
  is_moderator?: boolean;
  user_id?: string | null;
  session_id: string;
  created_at?: string;
}

export interface RejectedMessageInsert {
  id?: string;
  broadcast_id?: string | null;
  alias: string;
  content: string;
  reason: string;
  matched_filter?: string | null;
  session_id: string;
  reviewed?: boolean;
  reviewed_by?: string | null;
  created_at?: string;
}

export interface BannedWordInsert {
  id?: string;
  word: string;
  category?: BannedWordCategory;
  is_regex?: boolean;
  is_active?: boolean;
  created_at?: string;
}

export interface ChatSanctionInsert {
  id?: string;
  session_id?: string | null;
  alias?: string | null;
  sanction_type: SanctionType;
  reason?: string | null;
  imposed_by: string;
  expires_at?: string | null;
  is_active?: boolean;
  created_at?: string;
}

export interface ModerationLogInsert {
  id?: string;
  moderator_id: string;
  action: string;
  target_type: string;
  target_id?: string | null;
  details?: Record<string, unknown> | null;
  created_at?: string;
}

export interface ChatSettingsInsert {
  id?: string;
  is_enabled?: boolean;
  slow_mode_seconds?: number;
  max_message_length?: number;
  rate_limit_messages?: number;
  rate_limit_window_seconds?: number;
  require_alias?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RadioSettingsInsert {
  id?: string;
  radio_name?: string;
  institution_name?: string;
  logo_url?: string | null;
  welcome_message?: string;
  primary_color?: string;
  secondary_color?: string;
  social_facebook?: string | null;
  social_instagram?: string | null;
  social_twitter?: string | null;
  social_youtube?: string | null;
  privacy_policy?: string | null;
  recording_retention_days?: number;
  allow_simultaneous_broadcasts?: boolean;
  theme?: ThemeMode;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// UPDATE TYPES (all fields optional)
// ============================================

export interface ProfileUpdate {
  id?: string;
  email?: string | null;
  full_name?: string;
  display_name?: string;
  avatar_url?: string | null;
  role?: UserRole;
  can_broadcast?: boolean;
  is_active?: boolean;
  updated_at?: string;
}

export interface ChannelUpdate {
  name?: string;
  slug?: string;
  slogan?: string | null;
  description?: string | null;
  case_file?: string | null;
  color?: string;
  logo_url?: string | null;
  is_active?: boolean;
  sort_order?: number;
  updated_at?: string;
}

export interface ChannelMemberUpdate {
  role?: ChannelMemberRole;
  is_broadcaster?: boolean;
}

export interface ProgramUpdate {
  channel_id?: string;
  name?: string;
  description?: string | null;
  image_url?: string | null;
  scheduled_date?: string | null;
  scheduled_time_start?: string | null;
  scheduled_time_end?: string | null;
  status?: ProgramStatus;
  created_by?: string | null;
  updated_at?: string;
}

export interface BroadcastUpdate {
  title?: string | null;
  status?: BroadcastStatus;
  listener_count?: number;
  ended_at?: string | null;
  duration_seconds?: number | null;
}

export interface RecordingUpdate {
  title?: string;
  description?: string | null;
  file_path?: string | null;
  file_url?: string | null;
  file_size_bytes?: number | null;
  duration_seconds?: number | null;
  format?: string;
  status?: RecordingStatus;
  is_published?: boolean;
  published_by?: string | null;
  published_at?: string | null;
  expires_at?: string | null;
  consent_obtained?: boolean;
}

export interface ChatMessageUpdate {
  is_moderator?: boolean;
}

export interface RejectedMessageUpdate {
  reviewed?: boolean;
  reviewed_by?: string | null;
}

export interface BannedWordUpdate {
  word?: string;
  category?: BannedWordCategory;
  is_regex?: boolean;
  is_active?: boolean;
}

export interface ChatSanctionUpdate {
  sanction_type?: SanctionType;
  reason?: string | null;
  expires_at?: string | null;
  is_active?: boolean;
}

export interface ChatSettingsUpdate {
  is_enabled?: boolean;
  slow_mode_seconds?: number;
  max_message_length?: number;
  rate_limit_messages?: number;
  rate_limit_window_seconds?: number;
  require_alias?: boolean;
}

export interface RadioSettingsUpdate {
  radio_name?: string;
  institution_name?: string;
  logo_url?: string | null;
  welcome_message?: string;
  primary_color?: string;
  secondary_color?: string;
  social_facebook?: string | null;
  social_instagram?: string | null;
  social_twitter?: string | null;
  social_youtube?: string | null;
  privacy_policy?: string | null;
  recording_retention_days?: number;
  allow_simultaneous_broadcasts?: boolean;
  theme?: ThemeMode;
}

// ============================================
// DATABASE TYPE (Supabase-compatible format)
// ============================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      channels: {
        Row: Channel;
        Insert: ChannelInsert;
        Update: ChannelUpdate;
        Relationships: [];
      };
      channel_members: {
        Row: ChannelMember;
        Insert: ChannelMemberInsert;
        Update: ChannelMemberUpdate;
        Relationships: [
          {
            foreignKeyName: 'channel_members_channel_id_fkey';
            columns: ['channel_id'];
            referencedRelation: 'channels';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'channel_members_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      programs: {
        Row: Program;
        Insert: ProgramInsert;
        Update: ProgramUpdate;
        Relationships: [
          {
            foreignKeyName: 'programs_channel_id_fkey';
            columns: ['channel_id'];
            referencedRelation: 'channels';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'programs_created_by_fkey';
            columns: ['created_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      program_hosts: {
        Row: ProgramHost;
        Insert: ProgramHostInsert;
        Update: never;
        Relationships: [
          {
            foreignKeyName: 'program_hosts_program_id_fkey';
            columns: ['program_id'];
            referencedRelation: 'programs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'program_hosts_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      broadcasts: {
        Row: Broadcast;
        Insert: BroadcastInsert;
        Update: BroadcastUpdate;
        Relationships: [
          {
            foreignKeyName: 'broadcasts_program_id_fkey';
            columns: ['program_id'];
            referencedRelation: 'programs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'broadcasts_channel_id_fkey';
            columns: ['channel_id'];
            referencedRelation: 'channels';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'broadcasts_started_by_fkey';
            columns: ['started_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      recordings: {
        Row: Recording;
        Insert: RecordingInsert;
        Update: RecordingUpdate;
        Relationships: [
          {
            foreignKeyName: 'recordings_broadcast_id_fkey';
            columns: ['broadcast_id'];
            referencedRelation: 'broadcasts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'recordings_program_id_fkey';
            columns: ['program_id'];
            referencedRelation: 'programs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'recordings_channel_id_fkey';
            columns: ['channel_id'];
            referencedRelation: 'channels';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'recordings_published_by_fkey';
            columns: ['published_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: ChatMessageInsert;
        Update: ChatMessageUpdate;
        Relationships: [
          {
            foreignKeyName: 'chat_messages_broadcast_id_fkey';
            columns: ['broadcast_id'];
            referencedRelation: 'broadcasts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chat_messages_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      rejected_messages: {
        Row: RejectedMessage;
        Insert: RejectedMessageInsert;
        Update: RejectedMessageUpdate;
        Relationships: [
          {
            foreignKeyName: 'rejected_messages_broadcast_id_fkey';
            columns: ['broadcast_id'];
            referencedRelation: 'broadcasts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'rejected_messages_reviewed_by_fkey';
            columns: ['reviewed_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      banned_words: {
        Row: BannedWord;
        Insert: BannedWordInsert;
        Update: BannedWordUpdate;
        Relationships: [];
      };
      chat_sanctions: {
        Row: ChatSanction;
        Insert: ChatSanctionInsert;
        Update: ChatSanctionUpdate;
        Relationships: [
          {
            foreignKeyName: 'chat_sanctions_imposed_by_fkey';
            columns: ['imposed_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      moderation_log: {
        Row: ModerationLog;
        Insert: ModerationLogInsert;
        Update: never;
        Relationships: [
          {
            foreignKeyName: 'moderation_log_moderator_id_fkey';
            columns: ['moderator_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      chat_settings: {
        Row: ChatSettings;
        Insert: ChatSettingsInsert;
        Update: ChatSettingsUpdate;
        Relationships: [];
      };
      radio_settings: {
        Row: RadioSettings;
        Insert: RadioSettingsInsert;
        Update: RadioSettingsUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_superadmin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      can_user_broadcast: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      get_user_role: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      user_role: UserRole;
      channel_member_role: ChannelMemberRole;
      program_status: ProgramStatus;
      broadcast_status: BroadcastStatus;
      recording_status: RecordingStatus;
      banned_word_category: BannedWordCategory;
      sanction_type: SanctionType;
      theme_mode: ThemeMode;
    };
  };
}

// ============================================
// UTILITY TYPES
// ============================================

/** Extract table names from the Database type */
export type TableName = keyof Database['public']['Tables'];

/** Get Row type for a given table */
export type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];

/** Get Insert type for a given table */
export type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];

/** Get Update type for a given table */
export type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];

// ============================================
// JOINED/EXTENDED TYPES (for queries with joins)
// ============================================

/** Channel with its members */
export interface ChannelWithMembers extends Channel {
  channel_members: (ChannelMember & {
    profile: Pick<Profile, 'id' | 'display_name' | 'avatar_url'>;
  })[];
}

/** Program with channel and hosts */
export interface ProgramWithDetails extends Program {
  channel: Pick<Channel, 'id' | 'name' | 'slug' | 'color'>;
  program_hosts: (ProgramHost & {
    profile: Pick<Profile, 'id' | 'display_name' | 'avatar_url'>;
  })[];
}

/** Broadcast with channel and broadcaster info */
export interface BroadcastWithDetails extends Broadcast {
  channel: Pick<Channel, 'id' | 'name' | 'slug' | 'color' | 'logo_url'>;
  program: Pick<Program, 'id' | 'name'> | null;
  broadcaster: Pick<Profile, 'id' | 'display_name' | 'avatar_url'>;
}

/** Recording with related info */
export interface RecordingWithDetails extends Recording {
  channel: Pick<Channel, 'id' | 'name' | 'slug' | 'color'> | null;
  program: Pick<Program, 'id' | 'name'> | null;
  publisher: Pick<Profile, 'id' | 'display_name'> | null;
}

/** Chat message with optional user info */
export interface ChatMessageWithUser extends ChatMessage {
  profile: Pick<Profile, 'id' | 'display_name' | 'avatar_url' | 'role'> | null;
}

/** Moderation log with moderator info */
export interface ModerationLogWithModerator extends ModerationLog {
  moderator: Pick<Profile, 'id' | 'display_name' | 'avatar_url'>;
}

/** Rejected message with reviewer info */
export interface RejectedMessageWithReviewer extends RejectedMessage {
  reviewer: Pick<Profile, 'id' | 'display_name'> | null;
}

/** Chat sanction with imposer info */
export interface ChatSanctionWithImposer extends ChatSanction {
  imposer: Pick<Profile, 'id' | 'display_name'>;
}
