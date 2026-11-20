const livekitUrl = import.meta.env.VITE_LIVEKIT_URL

if (!livekitUrl) {
  console.warn('⚠️ LiveKit URL not configured. Create a .env file based on .env.example')
}

export const LIVEKIT_URL = livekitUrl || ''

export interface LiveKitTokenRequest {
  roomName: string
  participantName: string
  participantIdentity: string
  canPublish: boolean
}

export async function requestLiveKitToken(params: LiveKitTokenRequest): Promise<string> {
  // Primary attempt: Vercel serverless API endpoint (/api/livekit-token)
  try {
    const res = await fetch('/api/livekit-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
    if (res.ok) {
      const data = await res.json()
      if (data.token) return data.token
    }
  } catch (err) {
    console.warn('Vercel API livekit-token failed, trying fallback:', err)
  }

  // Fallback: Supabase Edge Function
  if (import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-livekit-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(params),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.token) return data.token
      }
    } catch (edgeErr) {
      console.warn('Supabase edge function token failed:', edgeErr)
    }
  }

  throw new Error('Error al obtener token de transmisión WebRTC')
}
