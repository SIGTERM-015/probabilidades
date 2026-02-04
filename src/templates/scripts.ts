export const getClientScript = (joinCode?: string) => `
  let ws = null;
  let playerName = '';
  let roomCode = '';
  let isChallenger = false;
  let selectedNumber = null;
  let gameState = null;

  function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  function showScreen(screenId) {
    document.querySelectorAll('[id$="-screen"]').forEach(el => {
      el.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
  }

  function goHome() {
    if (ws) {
      ws.close();
      ws = null;
    }
    showScreen('home-screen');
  }

  function showCreateRoom() {
    showScreen('create-screen');
  }

  function showJoinRoom() {
    showScreen('join-screen');
  }

  let pendingMessage = null;
  let connectingBtn = null;

  function setButtonLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    if (btn) {
      if (loading) {
        btn.classList.add('loading');
      } else {
        btn.classList.remove('loading');
      }
    }
  }

  function clearLoadingButtons() {
    if (connectingBtn) {
      setButtonLoading(connectingBtn, false);
      connectingBtn = null;
    }
  }

  function connectWebSocket(code) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(protocol + '//' + window.location.host + '/room/' + code + '/websocket');
    
    ws.onopen = () => {
      console.log('Connected to room:', code);
      // Send pending message if any
      if (pendingMessage) {
        ws.send(JSON.stringify(pendingMessage));
        pendingMessage = null;
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleServerMessage(data);
    };

    ws.onclose = () => {
      console.log('Disconnected from room');
      clearLoadingButtons();
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      showToast('Error de conexión. Intenta de nuevo.');
      pendingMessage = null;
      clearLoadingButtons();
      goHome();
    };
  }

  function sendMessage(message) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      pendingMessage = message;
    }
  }

  function handleServerMessage(data) {
    console.log('Received:', data);
    
    if (data.state) {
      gameState = data.state;
    }

    switch (data.type) {
      case 'room_created':
        clearLoadingButtons();
        showScreen('waiting-screen');
        document.getElementById('display-room-code').textContent = gameState.roomCode;
        document.getElementById('display-challenge').textContent = '"' + gameState.challenge + '"';
        break;

      case 'player_joined':
        clearLoadingButtons();
        updateMaxNumberScreen();
        showScreen('max-number-screen');
        break;

      case 'max_set':
        updateChooseScreen(true);
        showScreen('choose-screen');
        break;

      case 'number_chosen':
        updateChooseScreen();
        if (gameState.phase === 'reveal') {
          showResultScreen();
        }
        break;

      case 'close_call':
        showCloseCallAlert();
        updateChooseScreen(true);
        break;

      case 'game_reset':
        selectedNumber = null;
        isChallenger = playerName === gameState.challenger?.name;
        updateMaxNumberScreen();
        showScreen('max-number-screen');
        break;

      case 'counter_challenge':
        selectedNumber = null;
        isChallenger = playerName === gameState.challenger?.name;
        updateMaxNumberScreen();
        showScreen('max-number-screen');
        break;

      case 'new_challenge':
        selectedNumber = null;
        updateMaxNumberScreen();
        showScreen('max-number-screen');
        break;

      case 'state_update':
        if (gameState.phase === 'waiting') {
          showScreen('waiting-screen');
          document.getElementById('display-room-code').textContent = gameState.roomCode;
          document.getElementById('display-challenge').textContent = '"' + gameState.challenge + '"';
        } else if (gameState.phase === 'setting_max') {
          updateMaxNumberScreen();
          showScreen('max-number-screen');
        } else if (gameState.phase === 'choosing') {
          updateChooseScreen(true);
          showScreen('choose-screen');
        } else if (gameState.phase === 'reveal') {
          showResultScreen();
        }
        break;

      case 'error':
        showToast(data.message);
        break;
    }
  }

  function updateMaxNumberScreen() {
    document.getElementById('max-challenge-text').textContent = '"' + gameState.challenge + '"';
    document.getElementById('max-challenger-name').textContent = gameState.challenger?.name || 'Retador';
    document.getElementById('max-challenged-name').textContent = gameState.challenged?.name || 'Retado';
    
    const isCounter = gameState.isCounterChallenge;
    const prevMax = gameState.previousMaxNumber;
    const banner = document.getElementById('counter-challenge-banner');
    const limitWarning = document.getElementById('max-limit-warning');
    const maxInput = document.getElementById('max-number-input');
    const waitingText = document.getElementById('waiting-max-text');
    
    if (isCounter) {
      banner.classList.remove('hidden');
    } else {
      banner.classList.add('hidden');
    }
    
    if (isChallenger) {
      document.getElementById('max-number-input-section').classList.add('hidden');
      document.getElementById('max-number-waiting-section').classList.remove('hidden');
      waitingText.textContent = isCounter 
        ? 'Esperando... (debe elegir máximo ' + prevMax + ')'
        : 'Esperando que el retado elija el número máximo...';
    } else {
      document.getElementById('max-number-input-section').classList.remove('hidden');
      document.getElementById('max-number-waiting-section').classList.add('hidden');
      
      if (isCounter && prevMax) {
        maxInput.max = prevMax;
        maxInput.placeholder = '3 - ' + prevMax;
        limitWarning.textContent = '⚠️ Máximo permitido: ' + prevMax;
        limitWarning.classList.remove('hidden');
      } else {
        maxInput.max = 100;
        maxInput.placeholder = 'Mínimo 3';
        limitWarning.classList.add('hidden');
      }
    }
  }

  function updateChooseScreen(resetInput = false) {
    document.getElementById('choose-challenge-text').textContent = '"' + gameState.challenge + '"';
    document.getElementById('choose-max-number').textContent = gameState.maxNumber;
    document.getElementById('max-number-label').textContent = gameState.maxNumber;
    document.getElementById('choose-challenger-name').textContent = gameState.challenger?.name || 'Retador';
    document.getElementById('choose-challenged-name').textContent = gameState.challenged?.name || 'Retado';
    
    document.getElementById('challenger-status').textContent = gameState.challenger?.ready ? '✓ Listo' : 'Eligiendo...';
    document.getElementById('challenger-status').className = gameState.challenger?.ready ? 'ready' : 'waiting';
    
    document.getElementById('challenged-status').textContent = gameState.challenged?.ready ? '✓ Listo' : 'Eligiendo...';
    document.getElementById('challenged-status').className = gameState.challenged?.ready ? 'ready' : 'waiting';

    const numberInput = document.getElementById('player-number-input');
    const inputSection = document.getElementById('number-input-section');
    const waitingOther = document.getElementById('waiting-other');
    
    const myReady = isChallenger ? gameState.challenger?.ready : gameState.challenged?.ready;
    
    // Set input constraints
    numberInput.max = gameState.maxNumber;
    numberInput.placeholder = '1 - ' + gameState.maxNumber;
    
    if (myReady) {
      inputSection.classList.add('hidden');
      waitingOther.classList.remove('hidden');
    } else {
      inputSection.classList.remove('hidden');
      waitingOther.classList.add('hidden');
      // Only reset input when explicitly requested (new round)
      if (resetInput) {
        numberInput.value = '';
      }
    }
    
    // Render round history
    renderRoundHistory();
  }

  function showResultScreen() {
    const isMatch = gameState.result === 'match';
    const card = document.getElementById('result-card');
    
    card.className = 'card result-card ' + (isMatch ? 'result-match' : 'result-no-match');
    document.getElementById('result-icon').textContent = isMatch ? '🎉' : '😌';
    document.getElementById('result-title').textContent = isMatch ? '¡COINCIDENCIA!' : 'No hubo match';
    
    const challengedName = gameState.challenged?.name || 'El retado';
    document.getElementById('result-message').textContent = isMatch 
      ? challengedName + ' debe cumplir el reto!'
      : challengedName + ' se salva... por ahora.';
    
    document.getElementById('result-challenger-name').textContent = gameState.challenger?.name || 'Retador';
    document.getElementById('result-challenged-name').textContent = gameState.challenged?.name || 'Retado';
    document.getElementById('result-challenger-number').textContent = gameState.challenger?.number;
    document.getElementById('result-challenged-number').textContent = gameState.challenged?.number;
    document.getElementById('result-challenge').textContent = '"' + gameState.challenge + '"';
    
    const counterBtn = document.getElementById('counter-challenge-btn');
    const counterInfo = document.getElementById('counter-challenge-info');
    const isChallenged = playerName === gameState.challenged?.name;
    const canCounter = !isMatch && isChallenged && !gameState.counterChallengeUsed;
    
    if (canCounter) {
      counterBtn.classList.remove('hidden');
      counterInfo.classList.remove('hidden');
      document.getElementById('counter-max-limit').textContent = gameState.maxNumber;
    } else {
      counterBtn.classList.add('hidden');
      counterInfo.classList.add('hidden');
    }
    
    // Render round history in result screen
    renderResultHistory();
    
    showScreen('result-screen');
  }

  function renderResultHistory() {
    const container = document.getElementById('result-round-history');
    if (!gameState.roundHistory || gameState.roundHistory.length <= 1) {
      container.classList.add('hidden');
      return;
    }
    
    container.classList.remove('hidden');
    let html = '<div class="history-title">Historial de rondas:</div>';
    
    gameState.roundHistory.forEach((round, index) => {
      const resultClass = round.result === 'match' ? 'match' : (round.result === 'close' ? 'close' : 'no-match');
      const resultText = round.result === 'match' ? '¡MATCH!' : (round.result === 'close' ? '¡Casi!' : 'No match');
      html += '<div class="history-entry ' + resultClass + '">';
      html += '<span class="round-num">Ronda ' + (index + 1) + ':</span> ';
      html += '<span class="round-numbers">' + round.challengerNumber + ' vs ' + round.challengedNumber + '</span> ';
      html += '<span class="round-result">' + resultText + '</span>';
      html += '</div>';
    });
    
    container.innerHTML = html;
  }

  function createRoom() {
    const name = document.getElementById('creator-name').value.trim();
    const challenge = document.getElementById('challenge-text').value.trim();
    
    if (!name) {
      showToast('Por favor ingresa tu nombre');
      return;
    }
    if (!challenge) {
      showToast('Por favor ingresa el reto');
      return;
    }

    playerName = name;
    roomCode = generateRoomCode();
    isChallenger = true;

    connectingBtn = 'create-room-btn';
    setButtonLoading('create-room-btn', true);
    
    connectWebSocket(roomCode);
    sendMessage({
      type: 'create_room',
      roomCode: roomCode,
      challenge: challenge,
      playerName: playerName
    });
  }

  function joinRoom() {
    const name = document.getElementById('joiner-name').value.trim();
    const code = document.getElementById('room-code-input').value.trim().toUpperCase();
    
    if (!name) {
      showToast('Por favor ingresa tu nombre');
      return;
    }
    if (!code || code.length !== 6) {
      showToast('Por favor ingresa un código de sala válido (6 caracteres)');
      return;
    }

    playerName = name;
    roomCode = code;
    isChallenger = false;

    connectingBtn = 'join-room-btn';
    setButtonLoading('join-room-btn', true);
    
    connectWebSocket(roomCode);
    sendMessage({
      type: 'join_room',
      playerName: playerName
    });
  }

  function setMaxNumber() {
    const maxNum = parseInt(document.getElementById('max-number-input').value);
    const isCounter = gameState.isCounterChallenge;
    const prevMax = gameState.previousMaxNumber;
    const maxAllowed = isCounter && prevMax ? prevMax : 100;
    
    if (!maxNum || maxNum < 3) {
      showToast('El número mínimo es 3');
      return;
    }
    
    if (maxNum > maxAllowed) {
      showToast('El número máximo permitido es ' + maxAllowed);
      return;
    }

    ws.send(JSON.stringify({
      type: 'set_max_number',
      maxNumber: maxNum
    }));
  }

  function confirmNumber() {
    const numberInput = document.getElementById('player-number-input');
    const num = parseInt(numberInput.value);
    
    if (!num || num < 1) {
      showToast('Por favor ingresa un número válido');
      return;
    }
    
    if (num > gameState.maxNumber) {
      showToast('El número debe ser ' + gameState.maxNumber + ' o menos');
      return;
    }

    ws.send(JSON.stringify({
      type: 'choose_number',
      playerName: playerName,
      number: num
    }));
  }

  function getShareLink() {
    return window.location.origin + '/join/' + roomCode;
  }

  function showToast(message) {
    const existing = document.querySelector('.copied-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'copied-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 2000);
  }

  function showCloseCallAlert() {
    const lastRound = gameState.roundHistory[gameState.roundHistory.length - 1];
    const msg = '¡Por poco! (' + lastRound.challengerNumber + ' vs ' + lastRound.challengedNumber + ') - ¡Vuelven a elegir!';
    showToast(msg);
  }

  function renderRoundHistory() {
    const container = document.getElementById('round-history');
    if (!gameState.roundHistory || gameState.roundHistory.length === 0) {
      container.classList.add('hidden');
      return;
    }
    
    container.classList.remove('hidden');
    let html = '<div class="history-title">Historial de rondas:</div>';
    
    gameState.roundHistory.forEach((round, index) => {
      const resultClass = round.result === 'match' ? 'match' : (round.result === 'close' ? 'close' : 'no-match');
      const resultText = round.result === 'match' ? '¡MATCH!' : (round.result === 'close' ? '¡Casi!' : 'No match');
      html += '<div class="history-entry ' + resultClass + '">';
      html += '<span class="round-num">Ronda ' + (index + 1) + ':</span> ';
      html += '<span class="round-numbers">' + round.challengerNumber + ' vs ' + round.challengedNumber + '</span> ';
      html += '<span class="round-result">' + resultText + '</span>';
      html += '</div>';
    });
    
    container.innerHTML = html;
  }

  function shareChallenge() {
    const link = getShareLink();
    const challenge = gameState?.challenge || 'un reto';
    const text = 'Probabilidades de ' + challenge + ' 🎲';
    
    if (navigator.share) {
      navigator.share({
        title: 'Probabilidades',
        text: text,
        url: link
      }).catch(() => {
        navigator.clipboard.writeText(text + ' ' + link).then(() => {
          showToast('¡Enlace copiado!');
        });
      });
    } else {
      navigator.clipboard.writeText(text + ' ' + link).then(() => {
        showToast('¡Enlace copiado!');
      });
    }
  }

  function playAgain() {
    selectedNumber = null;
    ws.send(JSON.stringify({ type: 'reset_game' }));
  }

  function showNewChallengeScreen() {
    document.getElementById('new-challenger-name').textContent = gameState.challenger?.name || 'Retador';
    document.getElementById('new-challenged-name').textContent = gameState.challenged?.name || 'Retado';
    document.getElementById('new-challenge-text').value = '';
    
    // Only the challenger can write the new challenge
    if (isChallenger) {
      document.getElementById('new-challenge-input-section').classList.remove('hidden');
      document.getElementById('new-challenge-waiting-section').classList.add('hidden');
    } else {
      document.getElementById('new-challenge-input-section').classList.add('hidden');
      document.getElementById('new-challenge-waiting-section').classList.remove('hidden');
    }
    
    showScreen('new-challenge-screen');
  }

  function submitNewChallenge() {
    const challenge = document.getElementById('new-challenge-text').value.trim();
    
    if (!challenge) {
      showToast('Por favor ingresa el nuevo reto');
      return;
    }
    
    selectedNumber = null;
    ws.send(JSON.stringify({
      type: 'new_challenge',
      challenge: challenge
    }));
  }

  function counterChallenge() {
    selectedNumber = null;
    isChallenger = !isChallenger;
    ws.send(JSON.stringify({ type: 'counter_challenge' }));
  }

  function exitGame() {
    window.location.href = '/';
  }

  // Check for direct join link
  const joinCodeFromUrl = '${joinCode || ''}';
  if (joinCodeFromUrl) {
    document.getElementById('room-code-input').value = joinCodeFromUrl;
    showJoinRoom();
  }
`
