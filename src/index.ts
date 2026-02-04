import { Hono } from 'hono'
import { Bindings } from './types'
import { homePage } from './templates/home'

// Re-export GameRoom for Cloudflare Workers
export { GameRoom } from './game-room'

const app = new Hono<{ Bindings: Bindings }>()

// Home page
app.get('/', (c) => {
  return c.html(homePage())
})

// Direct join link
app.get('/join/:roomCode', (c) => {
  const roomCode = c.req.param('roomCode').toUpperCase()
  return c.html(homePage(roomCode))
})

// WebSocket endpoint for game rooms
app.get('/room/:roomCode/websocket', async (c) => {
  const roomCode = c.req.param('roomCode')
  const id = c.env.GAME_ROOM.idFromName(roomCode)
  const room = c.env.GAME_ROOM.get(id)

  return room.fetch(new Request(new URL('/websocket', c.req.url), {
    headers: c.req.raw.headers
  }))
})

export default app
