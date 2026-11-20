import { AccessToken } from 'livekit-server-sdk'

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    let body = req.body
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body)
      } catch {}
    }
    body = body || {}

    const { roomName, participantName, participantIdentity, canPublish } = body

    if (!roomName || !participantName || !participantIdentity) {
      return res.status(400).json({
        error: 'Faltan parámetros requeridos (roomName, participantName, participantIdentity)',
      })
    }

    const apiKey = process.env.LIVEKIT_API_KEY || 'APIfbsAjd4kdQYi'
    const apiSecret = process.env.LIVEKIT_API_SECRET || 'gCoF9JU9Nm6Ri7ciIkb7k6K7J2OTuM9yMvmsZG5eDTZ'

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantIdentity,
      name: participantName,
    })

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: Boolean(canPublish),
      canSubscribe: true,
      canPublishData: true,
    })

    const token = await at.toJwt()
    return res.status(200).json({ token })
  } catch (err) {
    console.error('Error in livekit-token handler:', err)
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Internal Server Error',
    })
  }
}
