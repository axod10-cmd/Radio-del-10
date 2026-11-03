# 🎙️ RADIO ESCOLAR — Colegio Provincial N.º 10 (La Rioja)

Plataforma Web Progresiva (PWA) de streaming de audio en vivo con baja latencia (WebRTC), chat en tiempo real moderado, administración institucional y archivo fonográfico para la **Expo Innovarte 2026**.

---

## 🚀 Tecnologías Implementadas

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Zustand, Date-fns.
- **Streaming de Audio**: LiveKit Client SDK (WebRTC con supresión de ruido, eco y control automático de ganancia para voz).
- **Base de Datos & Backend**: Supabase (PostgreSQL, Row Level Security, Realtime, Auth, Storage).
- **Backend Token Server**: Supabase Edge Functions (Deno + LiveKit Server SDK).
- **PWA**: Web App Manifest, Service Worker con cache offline y diseño 100% responsive.

---

## 📻 Los Cuatro Canales Iniciales (Expo Innovarte 2026)

Precargados en la base de datos con identidad gráfica propia:

1. **Enigma TV** (Púrpura `#8b5cf6`)
   - *Eslogan*: "Investigar antes de afirmar"
   - *Expediente*: La estación de las sombras
2. **Alerta 10** (Rojo `#ef4444`)
   - *Eslogan*: "La información es protagonista"
   - *Expediente*: Las luces que nadie puede explicar
3. **Código Misterio** (Cian `#06b6d4`)
   - *Eslogan*: "Todas las versiones cuentan"
   - *Expediente*: El misterio de la biblioteca
4. **Punto Paranormal** (Ámbar `#f59e0b`)
   - *Eslogan*: "El misterio bajo la lupa"
   - *Expediente*: La radio que transmite sola

---

## 🛠️ Puesta en Marcha

### 1. Variables de Entorno (`.env`)

Copia el archivo `.env.example` a `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Completa las variables con tus credenciales de **Supabase** y **LiveKit**:

```env
# Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui

# LiveKit Streaming
VITE_LIVEKIT_URL=wss://tu-servidor.livekit.cloud
```

### 2. Base de Datos en Supabase

En el **SQL Editor** de tu panel de Supabase, ejecuta en orden los siguientes scripts ubicados en la carpeta `supabase/`:

1. [`supabase/schema.sql`](file:///d:/WEB%20APP%20RADIO%2010/supabase/schema.sql): Crea las 14 tablas relacionales, índices y triggers.
2. [`supabase/rls-policies.sql`](file:///d:/WEB%20APP%20RADIO%2010/supabase/rls-policies.sql): Habilita RLS y las políticas de seguridad para roles público, docente y superadmin.
3. [`supabase/seed.sql`](file:///d:/WEB%20APP%20RADIO%2010/supabase/seed.sql): Precarga los 4 canales de la Expo, configuraciones por defecto y más de 100 expresiones prohibidas (español argentino).

### 3. Edge Function para Tokens de Transmisión

Para generar tokens WebRTC seguros sin exponer credenciales en el cliente:

```bash
supabase functions deploy generate-livekit-token
supabase secrets set LIVEKIT_API_KEY=tu_api_key LIVEKIT_API_SECRET=tu_api_secret
```

### 4. Ejecución en Desarrollo

```bash
npm run dev
```

La aplicación quedará disponible en `http://localhost:3000`.

### 5. Compilación para Producción

```bash
npm run build
```

Genera la versión optimizada en la carpeta `dist/`.

---

## 🛡️ Roles y Seguridad Escolar

- **Público (Oyentes)**: Ingreso sin registro. Escucha en vivo, acceso a grabaciones publicadas, participación en chat con alias previa aceptación de normas. No tienen acceso a datos privados de menores.
- **Alumno Locutor**: Acceso al estudio de transmisión solo si fue autorizado previamente por un docente (`can_broadcast: true`).
- **Docente**: Gestión de programación, inicio/fin de emisiones, revisión y publicación de grabaciones, moderación de chat en tiempo real.
- **Superadministrador**: Control institucional completo, gestión de usuarios, canales y configuración del establecimiento.

---

## 📱 Funcionalidades PWA

- **Instalable**: Compatible con Android, iOS, Windows y macOS como aplicación de escritorio o móvil.
- **Offline Shell**: Caché de interfaz y pantalla informativa ante cortes de conexión.
- **Segundo Plano**: Reproducción continua de audio en navegadores compatibles.
