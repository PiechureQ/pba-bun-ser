// Połączenie WebSocket do obserwatora
const socket = new WebSocket('ws://localhost:3000/ws/observer'); // Zmień URL na swój serwer

// Elementy DOM
const gameStateElement = document.getElementById('game-state');
const roundNumberElement = document.getElementById('round-number');
const turnNumberElement = document.getElementById('turn-number');
const activePlayerElement = document.getElementById('active-player');
const playersListElement = document.getElementById('players');
const mapElement = document.getElementById('map');

// Obsługa wiadomości WebSocket
socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'gameUpdate') {
    // updateGameState(data);
    renderMap(data.map);
    renderPlayers(data.players);
  }
});

// Aktualizacja stanu gry
function updateGameState(data) {
  gameStateElement.textContent = data.state;
  roundNumberElement.textContent = data.roundNumber;
  turnNumberElement.textContent = data.turnNumber;
  activePlayerElement.textContent = data.activePlayer || 'Brak';
}

// Renderowanie listy graczy
function renderPlayers(players) {
  playersListElement.innerHTML = '';
  players.forEach(player => {
    const li = document.createElement('li');
    li.innerHTML = `<span style="color: ${player.color}">■</span> ${player.id}`;
    playersListElement.appendChild(li);
  });
}

function renderMap(mapData) {
  mapElement.innerHTML = '';

  const { pixels, width, height } = mapData;

  // Ustaw siatkę CSS na podstawie szerokości
  mapElement.style.gridTemplateColumns = `repeat(${width}, 20px)`;

  // Renderuj każdy piksel
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      const color = pixels[index] || 'white'; // Domyślny kolor jeśli brak danych

      const pixel = document.createElement('div');
      pixel.className = 'pixel';
      pixel.style.backgroundColor = color;
      pixel.title = `(${x}, ${y})`;

      mapElement.appendChild(pixel);
    }
  }
}

// Obsługa błędów
socket.addEventListener('error', (error) => {
  console.error('WebSocket error:', error);
  gameStateElement.textContent = 'Błąd połączenia';
});

socket.addEventListener('close', () => {
  gameStateElement.textContent = 'Połączenie zamknięte';
});
