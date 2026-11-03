// Supabase Edge Function: generate-livekit-token
// Generates secure JWT tokens for LiveKit WebRTC streaming
// Runs server-side with Deno

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { AccessToken } from 'npm:livekit-server-sdk@2.6.0'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { roomName, participantName, participantIdentity, canPublish } = await req.json()

    if (!roomName || !participantName || !participantIdentity) {
      return new Response(
        JSON.stringify({ error: 'Faltan parámetros requeridos (roomName, participantName, participantIdentity)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If requesting permission to publish audio (broadcaster), verify authorization
    if (canPublish) {
      const authHeader = req.headers.get('Authorization')
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Se requiere autenticación para transmitir' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      })

      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Usuario no autenticado' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check profile permissions
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, can_broadcast, is_active')
        .eq('id', user.id)
        .single()

      if (!profile || profile.is_active === false) {
        return new Response(
          JSON.stringify({ error: 'Cuenta inactiva o no autorizada' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const isAuthorized =
        profile.role === 'superadmin' ||
        profile.role === 'docente' ||
        (profile.role === 'alumno' && profile.can_broadcast === true)

      if (!isAuthorized) {
        return new Response(
          JSON.stringify({ error: 'No tenés permisos para transmitir audio en vivo' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Get LiveKit API credentials from server environment
    const apiKey = Deno.env.get('LIVEKIT_API_KEY')
    const apiSecret = Deno.env.get('LIVEKIT_API_SECRET')

    if (!apiKey || !apiSecret) {
      // In local dev without livekit credentials, return mock token error explanation
      return new Response(
        JSON.stringify({
          error: 'Credenciales de LiveKit no configuradas en el servidor. Configurar LIVEKIT_API_KEY y LIVEKIT_API_SECRET en Supabase Secrets.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Access Token
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantIdentity,
      name: participantName,
      ttl: '4h',
    })

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: !!canPublish,
      canSubscribe: true,
      canPublishData: true,
    })

    const token = await at.toJwt()

    return new Response(JSON.stringify({ token }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
