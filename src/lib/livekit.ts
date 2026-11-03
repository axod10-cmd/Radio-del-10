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
  // This will call a Supabase Edge Function
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-livekit-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(params),
  })
  
  if (!response.ok) {
    throw new Error('Error al obtener token de transmisión')
  }
  
  const data = await response.json()
  return data.token
}
