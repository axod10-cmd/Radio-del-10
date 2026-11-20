-- ============================================
-- RADIO ESCOLAR - Crear Usuarios Iniciales en Supabase
-- Ejecutar en el SQL Editor de tu proyecto en Supabase
-- ============================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Superadministrador
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@colegio10.edu.ar',
  crypt('Radio10Admin2026!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Super Administrador","display_name":"Admin Radio 10"}',
  now(),
  now()
) ON CONFLICT (email) DO NOTHING;

UPDATE public.profiles
SET role = 'superadmin', can_broadcast = TRUE, is_active = TRUE
WHERE email = 'admin@colegio10.edu.ar';


-- 2. Docente Coordinador
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'docente@colegio10.edu.ar',
  crypt('DocenteRadio10!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Docente Coordinador","display_name":"Prof. García"}',
  now(),
  now()
) ON CONFLICT (email) DO NOTHING;

UPDATE public.profiles
SET role = 'docente', can_broadcast = TRUE, is_active = TRUE
WHERE email = 'docente@colegio10.edu.ar';


-- 3. Alumno Locutor (con permiso para transmitir)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'alumno@colegio10.edu.ar',
  crypt('AlumnoRadio10!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Alumno Locutor","display_name":"Locutor 1er Año"}',
  now(),
  now()
) ON CONFLICT (email) DO NOTHING;

UPDATE public.profiles
SET role = 'alumno', can_broadcast = TRUE, is_active = TRUE
WHERE email = 'alumno@colegio10.edu.ar';
