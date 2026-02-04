import { html, raw } from 'hono/html'
import { styles } from './styles'
import { getClientScript } from './scripts'

export const homePage = (joinCode?: string) => html`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Probabilidades - El Juego</title>
  <style>${raw(styles)}</style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🎲 Probabilidades</h1>
      <p class="subtitle">¿Te atreves a aceptar el reto?</p>
    </header>

    <!-- HOME SCREEN -->
    <div id="home-screen">
      <div class="card">
        <h2 style="text-align: center; margin-bottom: 20px;">¿Cómo jugar?</h2>
        <p style="color: #8892b0; line-height: 1.6;">
          1. Un jugador crea un reto (ej: "comerte un limón")<br><br>
          2. El otro jugador se une y elige un número máximo (ej: 10)<br><br>
          3. Ambos eligen un número del 1 al máximo<br><br>
          4. Si coinciden... ¡el retado debe cumplir! 😈
        </p>
      </div>
      
      <button class="btn btn-primary" onclick="showCreateRoom()">
        Crear Reto
      </button>
      <button class="btn btn-secondary" onclick="showJoinRoom()">
        Unirse a Reto
      </button>
    </div>

    <!-- CREATE ROOM SCREEN -->
    <div id="create-screen" class="hidden">
      <div class="card">
        <h2 style="margin-bottom: 20px;">Crear un Reto</h2>
        <div>
          <label>Tu nombre</label>
          <input type="text" id="creator-name" placeholder="Ej: Juan" maxlength="20">
        </div>
        <div>
          <label>El reto</label>
          <textarea id="challenge-text" placeholder="Ej: Comerse un limón entero" rows="3" maxlength="200"></textarea>
        </div>
        <button class="btn btn-primary" id="create-room-btn" onclick="createRoom()">
          <span class="btn-text">Crear Sala</span>
        </button>
        <button class="btn btn-secondary" onclick="goHome()">
          Volver
        </button>
      </div>
    </div>

    <!-- JOIN ROOM SCREEN -->
    <div id="join-screen" class="hidden">
      <div class="card">
        <h2 style="margin-bottom: 20px;">Unirse a un Reto</h2>
        <div>
          <label>Tu nombre</label>
          <input type="text" id="joiner-name" placeholder="Ej: María" maxlength="20">
        </div>
        <div>
          <label>Código de sala</label>
          <input type="text" id="room-code-input" placeholder="Ej: ABC123" maxlength="6" style="text-transform: uppercase;">
        </div>
        <button class="btn btn-primary" id="join-room-btn" onclick="joinRoom()">
          <span class="btn-text">Unirse</span>
        </button>
        <button class="btn btn-secondary" onclick="goHome()">
          Volver
        </button>
      </div>
    </div>

    <!-- WAITING ROOM SCREEN -->
    <div id="waiting-screen" class="hidden">
      <div class="card">
        <h2 style="text-align: center;">Sala Creada</h2>
        <div class="room-code" id="display-room-code">------</div>
        <div class="share-section">
          <button class="btn btn-primary" onclick="shareChallenge()">
            📤 Compartir Reto
          </button>
        </div>
        <div class="challenge-text" id="display-challenge">"..."</div>
        <div class="status">
          <p>Esperando al otro jugador...</p>
          <div class="waiting-animation">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- SET MAX NUMBER SCREEN -->
    <div id="max-number-screen" class="hidden">
      <div class="card">
        <h2 style="text-align: center; margin-bottom: 10px;" id="max-screen-title">El Reto</h2>
        <div id="counter-challenge-banner" class="hidden" style="background: rgba(255, 152, 0, 0.2); border: 1px solid #ff9800; border-radius: 8px; padding: 10px; margin-bottom: 15px; text-align: center;">
          🔄 <strong>¡Reto devuelto!</strong>
        </div>
        <div class="challenge-text" id="max-challenge-text">"..."</div>
        <div class="players-status">
          <div class="player-status">
            <div class="name" id="max-challenger-name">Retador</div>
            <div class="ready">Reta</div>
          </div>
          <div class="player-status">
            <div class="name" id="max-challenged-name">Retado</div>
            <div class="waiting">Elige el número</div>
          </div>
        </div>
        <div id="max-number-input-section">
          <label id="max-number-label">¿Probabilidades de 1 en...?</label>
          <input type="number" id="max-number-input" placeholder="Mínimo 3" min="3" max="100">
          <p id="max-limit-warning" class="hidden" style="color: #ff9800; font-size: 0.85rem; margin-top: 5px;"></p>
          <button class="btn btn-primary" onclick="setMaxNumber()">
            Confirmar
          </button>
        </div>
        <div id="max-number-waiting-section" class="hidden">
          <p class="status" id="waiting-max-text">Esperando que el retado elija el número máximo...</p>
          <div class="waiting-animation">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- CHOOSE NUMBER SCREEN -->
    <div id="choose-screen" class="hidden">
      <div class="card">
        <h2 style="text-align: center; margin-bottom: 10px;">Elige tu número</h2>
        <div class="challenge-text" id="choose-challenge-text">"..."</div>
        <div class="max-number-display">
          Probabilidades: 1 en <span id="choose-max-number">?</span>
        </div>
        <div id="round-history" class="round-history hidden"></div>
        <div class="players-status">
          <div class="player-status">
            <div class="name" id="choose-challenger-name">Retador</div>
            <div id="challenger-status" class="waiting">Eligiendo...</div>
          </div>
          <div class="player-status">
            <div class="name" id="choose-challenged-name">Retado</div>
            <div id="challenged-status" class="waiting">Eligiendo...</div>
          </div>
        </div>
        <div id="number-input-section">
          <label>Tu número secreto (1 - <span id="max-number-label">?</span>)</label>
          <input type="number" id="player-number-input" placeholder="Elige tu número" min="1">
          <button class="btn btn-primary" id="confirm-number-btn" onclick="confirmNumber()">
            Confirmar Elección
          </button>
        </div>
        <div id="waiting-other" class="hidden">
          <p class="status">Esperando al otro jugador...</p>
          <div class="waiting-animation">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- RESULT SCREEN -->
    <div id="result-screen" class="hidden">
      <div class="card result-card" id="result-card">
        <div class="result-icon" id="result-icon">🎲</div>
        <h2 class="result-title" id="result-title">Resultado</h2>
        <p id="result-message" style="color: #8892b0; margin-bottom: 20px;"></p>
        <div class="result-numbers">
          <div class="player-result">
            <div class="player-name" id="result-challenger-name">Retador</div>
            <div class="player-number" id="result-challenger-number">?</div>
          </div>
          <div class="player-result">
            <div class="player-name" id="result-challenged-name">Retado</div>
            <div class="player-number" id="result-challenged-number">?</div>
          </div>
        </div>
        <div class="challenge-text" id="result-challenge">"..."</div>
        <div id="result-round-history" class="round-history hidden"></div>
        <button class="btn btn-primary hidden" id="counter-challenge-btn" onclick="counterChallenge()">
          🔄 Devolver el Reto
        </button>
        <p id="counter-challenge-info" class="hidden" style="color: #ff9800; font-size: 0.9rem; margin: 10px 0;">
          (El retador deberá elegir máximo <span id="counter-max-limit">?</span>)
        </p>
        <button class="btn btn-secondary" onclick="showNewChallengeScreen()">
          Nuevo Reto
        </button>
        <button class="btn btn-secondary" onclick="exitGame()">
          Salir
        </button>
      </div>
    </div>

    <!-- NEW CHALLENGE SCREEN -->
    <div id="new-challenge-screen" class="hidden">
      <div class="card">
        <h2 style="text-align: center; margin-bottom: 20px;">Nuevo Reto</h2>
        <div class="players-status" style="margin-bottom: 20px;">
          <div class="player-status">
            <div class="name" id="new-challenger-name">Retador</div>
          </div>
          <div style="color: #e94560; font-size: 1.5rem;">VS</div>
          <div class="player-status">
            <div class="name" id="new-challenged-name">Retado</div>
          </div>
        </div>
        <div id="new-challenge-input-section">
          <label>El nuevo reto</label>
          <textarea id="new-challenge-text" placeholder="Ej: Hacer 10 flexiones" rows="3" maxlength="200"></textarea>
          <button class="btn btn-primary" onclick="submitNewChallenge()">
            Crear Reto
          </button>
        </div>
        <div id="new-challenge-waiting-section" class="hidden">
          <p class="status">Esperando a que el retador escriba el nuevo reto...</p>
          <div class="waiting-animation">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>
        <button class="btn btn-secondary" onclick="exitGame()">
          Salir
        </button>
      </div>
    </div>
  </div>

  <script>${raw(getClientScript(joinCode))}</script>
</body>
</html>
`
