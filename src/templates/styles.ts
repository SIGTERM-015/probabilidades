export const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    min-height: 100vh;
    color: #fff;
  }
  
  .container {
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  header {
    text-align: center;
    padding: 30px 0;
  }
  
  h1 {
    font-size: 2.5rem;
    background: linear-gradient(45deg, #e94560, #ff6b6b);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 10px;
  }
  
  .subtitle {
    color: #8892b0;
    font-size: 1rem;
  }
  
  .card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    padding: 30px;
    margin: 15px 0;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .btn {
    width: 100%;
    padding: 15px 30px;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin: 10px 0;
  }
  
  .btn-primary {
    background: linear-gradient(45deg, #e94560, #ff6b6b);
    color: white;
  }
  
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(233, 69, 96, 0.3);
  }
  
  .btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  input, textarea {
    width: 100%;
    padding: 15px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    color: white;
    font-size: 1rem;
    margin: 10px 0;
    transition: all 0.3s ease;
  }
  
  input:focus, textarea:focus {
    outline: none;
    border-color: #e94560;
    background: rgba(255, 255, 255, 0.1);
  }
  
  input::placeholder, textarea::placeholder {
    color: #8892b0;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    color: #ccd6f6;
    font-weight: 500;
  }
  
  .hidden {
    display: none !important;
  }
  
  .room-code {
    font-size: 2rem;
    font-weight: bold;
    letter-spacing: 8px;
    text-align: center;
    color: #e94560;
    padding: 20px;
    background: rgba(233, 69, 96, 0.1);
    border-radius: 12px;
    margin: 15px 0;
  }
  
  .challenge-text {
    font-size: 1.3rem;
    text-align: center;
    padding: 20px;
    color: #ccd6f6;
    font-style: italic;
  }
  
  .status {
    text-align: center;
    padding: 15px;
    color: #8892b0;
    font-size: 0.95rem;
  }
  
  #number-input-section {
    margin: 20px 0;
  }

  #player-number-input {
    font-size: 1.5rem;
    text-align: center;
    font-weight: bold;
  }
  
  .result-card {
    text-align: center;
    padding: 40px 20px;
  }
  
  .result-match {
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.1));
    border-color: #4caf50;
  }
  
  .result-no-match {
    background: linear-gradient(135deg, rgba(233, 69, 96, 0.2), rgba(233, 69, 96, 0.1));
  }
  
  .result-icon {
    font-size: 4rem;
    margin-bottom: 20px;
  }
  
  .result-title {
    font-size: 1.8rem;
    margin-bottom: 10px;
  }
  
  .result-numbers {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin: 30px 0;
  }
  
  .player-result {
    text-align: center;
  }
  
  .player-name {
    color: #8892b0;
    margin-bottom: 10px;
  }
  
  .player-number {
    font-size: 3rem;
    font-weight: bold;
    color: #e94560;
  }
  
  .waiting-animation {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 20px;
  }
  
  .dot {
    width: 12px;
    height: 12px;
    background: #e94560;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out;
  }
  
  .dot:nth-child(1) { animation-delay: -0.32s; }
  .dot:nth-child(2) { animation-delay: -0.16s; }
  .dot:nth-child(3) { animation-delay: 0; }
  
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
  
  .players-status {
    display: flex;
    justify-content: space-around;
    margin: 20px 0;
  }
  
  .player-status {
    text-align: center;
    padding: 15px;
  }
  
  .player-status .name {
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .player-status .ready {
    color: #4caf50;
  }
  
  .player-status .waiting {
    color: #ff9800;
  }

  .copy-btn {
    background: none;
    border: none;
    color: #e94560;
    cursor: pointer;
    padding: 5px 10px;
    font-size: 0.9rem;
  }

  .copy-btn:hover {
    text-decoration: underline;
  }

  .max-number-display {
    font-size: 1.5rem;
    text-align: center;
    color: #e94560;
    margin: 10px 0;
  }

  .share-section {
    margin: 20px 0;
  }

  .copied-toast {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: #4caf50;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 500;
    animation: fadeInOut 2s ease;
    z-index: 1000;
  }

  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
    15% { opacity: 1; transform: translateX(-50%) translateY(0); }
    85% { opacity: 1; transform: translateX(-50%) translateY(0); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  }

  .round-history {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    padding: 15px;
    margin: 15px 0;
  }

  .history-title {
    font-weight: bold;
    color: #ccd6f6;
    margin-bottom: 10px;
    font-size: 0.95rem;
  }

  .history-entry {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    margin: 5px 0;
    border-radius: 8px;
    font-size: 0.9rem;
  }

  .history-entry.close {
    background: rgba(255, 152, 0, 0.2);
    border: 1px solid rgba(255, 152, 0, 0.4);
  }

  .history-entry.match {
    background: rgba(76, 175, 80, 0.2);
    border: 1px solid rgba(76, 175, 80, 0.4);
  }

  .history-entry.no-match {
    background: rgba(233, 69, 96, 0.2);
    border: 1px solid rgba(233, 69, 96, 0.4);
  }

  .round-num {
    color: #8892b0;
    font-weight: 500;
  }

  .round-numbers {
    font-weight: bold;
    color: #ccd6f6;
  }

  .round-result {
    font-weight: 600;
  }

  .history-entry.close .round-result {
    color: #ff9800;
  }

  .history-entry.match .round-result {
    color: #4caf50;
  }

  .history-entry.no-match .round-result {
    color: #e94560;
  }

  .btn.loading {
    opacity: 0.7;
    pointer-events: none;
    position: relative;
  }

  .btn.loading .btn-text {
    visibility: hidden;
  }

  .btn.loading::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    top: 50%;
    left: 50%;
    margin-left: -10px;
    margin-top: -10px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`
