import { RoomServiceClient } from 'livekit-server-sdk'

// In-memory cache for the latest broadcast metadata
let activeBroadcast = null

export default async function handler(req, res) {
  // CORS
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

  const apiKey = process.env.LIVEKIT_API_KEY || 'APIfbsAjd4kdQYi'
  const apiSecret = process.env.LIVEKIT_API_SECRET || 'gCoF9JU9Nm6Ri7ciIkb7k6K7J2OTuM9yMvmsZG5eDTZ'
  const livekitHost = 'https://radio-10-0ag5em23.livekit.cloud'

  if (req.method === 'POST') {
    let body = req.body
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body)
      } catch {}
    }
    body = body || {}

    if (body.action === 'start') {
      activeBroadcast = {
        id: body.id || 'broadcast-' + Date.now(),
        channel_id: body.channelId || 'enigma-tv',
        title: body.title || 'Transmisión en vivo',
        livekit_room_name: body.roomName || 'radio-studio',
        started_at: new Date().toISOString(),
        status: 'live',
        listener_count: 1,
      }
      return res.status(200).json({ status: 'ok', broadcast: activeBroadcast })
    }

    if (body.action === 'stop') {
      activeBroadcast = null
      return res.status(200).json({ status: 'ok', broadcast: null })
    }
  }

  // GET: Check active rooms in LiveKit
  try {
    const svc = new RoomServiceClient(livekitHost, apiKey, apiSecret)
    const rooms = await svc.listRooms()

    // Find any active radio room with participants
    const liveRoom = rooms.find((r) => r.numParticipants > 0)

    if (liveRoom) {
      const roomName = liveRoom.name
      // If we don't have local metadata, extract channel from room name (e.g. radio-enigma-tv)
      const channelSlug = roomName.replace('radio-', '')
      const responseBroadcast = activeBroadcast && activeBroadcast.livekit_room_name === roomName
        ? {
            ...activeBroadcast,
            listener_count: Math.max(1, liveRoom.numParticipants),
          }
        : {
            id: 'room-' + roomName,
            channel_id: channelSlug || 'enigma-tv',
            title: activeBroadcast?.title || 'Transmisión en vivo',
            livekit_room_name: roomName,
            started_at: activeBroadcast?.started_at || new Date().toISOString(),
            status: 'live',
            listener_count: Math.max(1, liveRoom.numParticipants),
          }

      return res.status(200).json({
        isLive: true,
        broadcast: responseBroadcast,
      })
    }

    // If no participants in LiveKit rooms
    if (activeBroadcast) {
      // Check if it was started very recently (within 20 seconds, waiting for broadcaster connect)
      const startedAge = Date.now() - new Date(activeBroadcast.started_at).getTime()
      if (startedAge < 20000) {
        return res.status(200).json({
          isLive: true,
          broadcast: activeBroadcast,
        })
      }
      activeBroadcast = null
    }

    return res.status(200).json({
      isLive: false,
      broadcast: null,
    })
  } catch (err) {
    console.error('Error querying LiveKit rooms in broadcast api:', err)
    return res.status(200).json({
      isLive: Boolean(activeBroadcast),
      broadcast: activeBroadcast,
    })
  }
}
