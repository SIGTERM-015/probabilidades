import { GameState, RoundEntry } from './types'

export class GameRoom {
  state: DurableObjectState
  sessions: WebSocket[] = []
  gameState: GameState

  constructor(state: DurableObjectState) {
    this.state = state
    this.gameState = this.getInitialState()
  }

  private getInitialState(): GameState {
    return {
      roomCode: '',
      challenge: '',
      maxNumber: null,
      previousMaxNumber: null,
      challenger: null,
      challenged: null,
      phase: 'waiting',
      result: null,
      isCounterChallenge: false,
      counterChallengeUsed: false,
      roundHistory: []
    }
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/websocket') {
      const upgradeHeader = request.headers.get('Upgrade')
      if (!upgradeHeader || upgradeHeader !== 'websocket') {
        return new Response('Expected WebSocket', { status: 426 })
      }

      const pair = new WebSocketPair()
      const [client, server] = Object.values(pair)

      this.handleSession(server)

      return new Response(null, {
        status: 101,
        webSocket: client
      })
    }

    return new Response('Not found', { status: 404 })
  }

  private handleSession(ws: WebSocket) {
    ws.accept()
    this.sessions.push(ws)

    ws.addEventListener('message', async (event) => {
      try {
        const data = JSON.parse(event.data as string)
        await this.handleMessage(ws, data)
      } catch (e) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message' }))
      }
    })

    ws.addEventListener('close', () => {
      this.sessions = this.sessions.filter(s => s !== ws)
    })
  }

  private async handleMessage(ws: WebSocket, data: any) {
    switch (data.type) {
      case 'create_room':
        this.handleCreateRoom(data)
        break

      case 'join_room':
        this.handleJoinRoom(ws, data)
        break

      case 'set_max_number':
        this.handleSetMaxNumber(data)
        break

      case 'choose_number':
        this.handleChooseNumber(data)
        break

      case 'reset_game':
        this.handleResetGame()
        break

      case 'new_challenge':
        this.handleNewChallenge(data)
        break

      case 'counter_challenge':
        this.handleCounterChallenge(ws)
        break

      case 'get_state':
        ws.send(JSON.stringify({ type: 'state_update', state: this.gameState }))
        break

      case 'reconnect':
        this.handleReconnect(ws, data)
        break
    }
  }

  private handleReconnect(ws: WebSocket, data: any) {
    const playerName = data.playerName
    
    // Check if room has been initialized
    if (!this.gameState.roomCode) {
      ws.send(JSON.stringify({ type: 'room_not_found' }))
      return
    }

    // Check if player was in this room
    const isChallenger = this.gameState.challenger?.name === playerName
    const isChallenged = this.gameState.challenged?.name === playerName

    if (!isChallenger && !isChallenged) {
      // Player was not in this room, check if they can join
      if (this.gameState.challenged) {
        ws.send(JSON.stringify({ type: 'room_full' }))
      } else {
        ws.send(JSON.stringify({ type: 'room_not_found' }))
      }
      return
    }

    // Player was in this room, send current state
    ws.send(JSON.stringify({ type: 'reconnected', state: this.gameState }))
  }

  private handleCreateRoom(data: any) {
    this.gameState.roomCode = data.roomCode
    this.gameState.challenge = data.challenge
    this.gameState.challenger = { name: data.playerName, number: null, ready: false }
    this.gameState.phase = 'waiting'
    this.broadcast({ type: 'room_created', state: this.gameState })
  }

  private handleJoinRoom(ws: WebSocket, data: any) {
    // Check if room exists (has a challenger)
    if (!this.gameState.challenger) {
      ws.send(JSON.stringify({ type: 'room_not_found' }))
      return
    }

    // Check if room is full
    if (this.gameState.challenged) {
      // Check if it's the same player reconnecting
      if (this.gameState.challenged.name === data.playerName) {
        ws.send(JSON.stringify({ type: 'reconnected', state: this.gameState }))
        return
      }
      ws.send(JSON.stringify({ type: 'room_full' }))
      return
    }

    // Join the room
    this.gameState.challenged = { name: data.playerName, number: null, ready: false }
    this.gameState.phase = 'setting_max'
    this.broadcast({ type: 'player_joined', state: this.gameState })
  }

  private handleSetMaxNumber(data: any) {
    if (this.gameState.phase === 'setting_max') {
      this.gameState.maxNumber = data.maxNumber
      this.gameState.phase = 'choosing'
      this.broadcast({ type: 'max_set', state: this.gameState })
    }
  }

  private handleChooseNumber(data: any) {
    const isChallenger = data.playerName === this.gameState.challenger?.name
    const player = isChallenger ? this.gameState.challenger : this.gameState.challenged

    if (player && this.gameState.phase === 'choosing') {
      player.number = data.number
      player.ready = true

      // Check if both players have chosen
      if (this.gameState.challenger?.ready && this.gameState.challenged?.ready) {
        const challengerNum = this.gameState.challenger.number!
        const challengedNum = this.gameState.challenged.number!
        const diff = Math.abs(challengerNum - challengedNum)

        // Add to round history
        let roundResult: 'match' | 'close' | 'no_match'
        if (diff === 0) {
          roundResult = 'match'
        } else if (diff === 1) {
          roundResult = 'close'
        } else {
          roundResult = 'no_match'
        }

        this.gameState.roundHistory.push({
          challengerNumber: challengerNum,
          challengedNumber: challengedNum,
          result: roundResult
        })

        if (diff === 0) {
          // Exact match - challenged must do the challenge
          this.gameState.phase = 'reveal'
          this.gameState.result = 'match'
          this.broadcast({ type: 'number_chosen', state: this.gameState })
        } else if (diff === 1) {
          // Close call - reset and try again
          this.gameState.challenger.number = null
          this.gameState.challenger.ready = false
          this.gameState.challenged.number = null
          this.gameState.challenged.ready = false
          this.broadcast({ type: 'close_call', state: this.gameState })
        } else {
          // No match - challenged is safe
          this.gameState.phase = 'reveal'
          this.gameState.result = 'no_match'
          this.broadcast({ type: 'number_chosen', state: this.gameState })
        }
      } else {
        this.broadcast({ type: 'number_chosen', state: this.gameState })
      }
    }
  }

  private handleResetGame() {
    if (this.gameState.challenger) {
      this.gameState.challenger.number = null
      this.gameState.challenger.ready = false
    }
    if (this.gameState.challenged) {
      this.gameState.challenged.number = null
      this.gameState.challenged.ready = false
    }
    this.gameState.maxNumber = null
    this.gameState.previousMaxNumber = null
    this.gameState.phase = 'setting_max'
    this.gameState.result = null
    this.gameState.isCounterChallenge = false
    this.gameState.counterChallengeUsed = false
    this.gameState.roundHistory = []
    this.broadcast({ type: 'game_reset', state: this.gameState })
  }

  private handleNewChallenge(data: any) {
    // Reset game state but keep both players
    if (this.gameState.challenger) {
      this.gameState.challenger.number = null
      this.gameState.challenger.ready = false
    }
    if (this.gameState.challenged) {
      this.gameState.challenged.number = null
      this.gameState.challenged.ready = false
    }
    
    // Set new challenge
    this.gameState.challenge = data.challenge
    this.gameState.maxNumber = null
    this.gameState.previousMaxNumber = null
    this.gameState.phase = 'setting_max'
    this.gameState.result = null
    this.gameState.isCounterChallenge = false
    this.gameState.counterChallengeUsed = false
    this.gameState.roundHistory = []
    
    this.broadcast({ type: 'new_challenge', state: this.gameState })
  }

  private handleCounterChallenge(ws: WebSocket) {
    // Only allow one counter-challenge per game
    if (this.gameState.counterChallengeUsed) {
      ws.send(JSON.stringify({ type: 'error', message: 'Ya se devolvió el reto una vez' }))
      return
    }

    // Swap roles: challenged becomes challenger, challenger becomes challenged
    const prevMaxNumber = this.gameState.maxNumber
    const oldChallenger = this.gameState.challenger
    const oldChallenged = this.gameState.challenged

    this.gameState.challenger = oldChallenged
    this.gameState.challenged = oldChallenger

    // Reset numbers but keep the limit
    if (this.gameState.challenger) {
      this.gameState.challenger.number = null
      this.gameState.challenger.ready = false
    }
    if (this.gameState.challenged) {
      this.gameState.challenged.number = null
      this.gameState.challenged.ready = false
    }

    this.gameState.maxNumber = null
    this.gameState.previousMaxNumber = prevMaxNumber
    this.gameState.phase = 'setting_max'
    this.gameState.result = null
    this.gameState.isCounterChallenge = true
    this.gameState.counterChallengeUsed = true
    this.gameState.roundHistory = []
    this.broadcast({ type: 'counter_challenge', state: this.gameState })
  }

  private broadcast(message: any) {
    const msg = JSON.stringify(message)
    this.sessions.forEach(ws => {
      try {
        ws.send(msg)
      } catch (e) {
        // Session closed
      }
    })
  }
}
