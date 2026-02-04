// Player state
export interface Player {
  name: string
  number: number | null
  ready: boolean
}

// Round history entry
export interface RoundEntry {
  challengerNumber: number
  challengedNumber: number
  result: 'match' | 'close' | 'no_match'
}

// Game state
export interface GameState {
  roomCode: string
  challenge: string
  maxNumber: number | null
  previousMaxNumber: number | null
  challenger: Player | null
  challenged: Player | null
  phase: 'waiting' | 'setting_max' | 'choosing' | 'reveal'
  result: 'match' | 'no_match' | null
  isCounterChallenge: boolean
  counterChallengeUsed: boolean
  roundHistory: RoundEntry[]
}

// WebSocket message types
export type MessageType =
  | 'create_room'
  | 'join_room'
  | 'set_max_number'
  | 'choose_number'
  | 'reset_game'
  | 'counter_challenge'
  | 'get_state'

// Cloudflare bindings
export type Bindings = {
  GAME_ROOM: DurableObjectNamespace
}
