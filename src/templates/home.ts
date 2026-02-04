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
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'%3E%3Cpath fill='%23FFCC4D' d='M36 18c0 9.941-8.059 18-18 18-9.94 0-18-8.059-18-18C0 8.06 8.06 0 18 0c9.941 0 18 8.06 18 18'/%3E%3Cpath fill='%23664500' d='M6.001 19a1 1 0 0 1-.601-1.799c.143-.107 2.951-2.183 6.856-2.933C9.781 13.027 7.034 13 6.999 13A1.001 1.001 0 0 1 7 11c.221 0 5.452.038 8.707 3.293A1 1 0 0 1 15 16c-4.613 0-8.363 2.772-8.4 2.8a.996.996 0 0 1-.599.2zm23.998-.001a.998.998 0 0 1-.598-.198C29.363 18.772 25.59 16 21 16a.999.999 0 0 1-.707-1.707C23.549 11.038 28.779 11 29 11a1 1 0 0 1 .002 2c-.036 0-2.783.027-5.258 1.268 3.905.75 6.713 2.825 6.855 2.933a1 1 0 0 1-.6 1.798zM16 29c2-5 13-5 13-3 0 1-8-1-13 3z'/%3E%3Cpath fill='%23CCD6DD' d='M18.406 18.033c2.678 2.676-3.974 15.524-5.25 16.8-1.05 1.05-4.2 1.05-5.25-1.05-1.05-2.1-4.2 0-5.25-1.05-2.1-2.1 1.05-3.15 0-5.25s-3.15-3.15-1.05-5.25 7.35-1.05 10.5-3.15c3.15-2.1 5.249-2.1 6.3-1.05z'/%3E%3Cpath fill='%23F5F8FA' d='M17.322 19.872c-.016-.062-.053-.113-.079-.17-.03-.066-.05-.135-.094-.194a1.042 1.042 0 0 0-.694-.415h-.001a1.066 1.066 0 0 0-.406.022c-.091.023-.169.071-.249.117-.038.021-.08.03-.115.056a1.053 1.053 0 0 0-.278.305c-2.934 4.89-9.942 7.944-10.013 7.975a1.05 1.05 0 0 0 .828 1.93c.223-.096 4.055-1.77 7.425-4.712-2.068 3.825-5.23 5.995-5.273 6.025a1.05 1.05 0 0 0 1.167 1.747c.273-.183 6.703-4.549 7.807-12.274.018-.14.009-.279-.025-.412z'/%3E%3C/svg%3E">
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
