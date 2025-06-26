import type { PlayerMove, PlayerTurn, PlayerMessages } from "../ws/player";

const ws = new WebSocket("ws://localhost:3000/ws/player");

function start() {
  let playerId = '';
  let color = '';

  // socket opened
  ws.addEventListener("open", event => {
    console.log('🔌 Połączono z WebSocketem');
    ws.send(JSON.stringify({ type: 'join' }));
  });

  // message is received
  ws.addEventListener("message", event => {
    const message = JSON.parse(event.data) as PlayerMessages;
    if (message.type === 'joined') {
      console.log('message', message, typeof message)
      playerId = message.playerId;
      color = message.playerColor;
      console.log(`🧠 Dołączono do gry jako ${playerId} (kolor: ${color})`);
    } else if (message.type === 'playerTurn' && message.playerId === playerId) {
      const response = handlePlayerTurn(playerId, color, message as PlayerTurn);
      ws.send(JSON.stringify(response));
    }
  });

  // socket closed
  ws.addEventListener("close", () => {
    console.log('❌ Połączenie z WebSocketem zamknięte');
  });

  // error handler
  ws.addEventListener("error", event => { });
}

function handlePlayerTurn(playerId: string, color: string, message: PlayerTurn): PlayerMove | undefined {
  const paintCommand = message.availableCommands.find(cmd => cmd.type === 'paint');
  if (paintCommand && paintCommand.availableTargets.length > 0) {
    const target = paintCommand.availableTargets[0]; // pierwszy dostępny cel

    if (target) {
      const move: PlayerMove = {
        type: 'playerMove',
        command: 'paint',
        targets: [target]
      };

      console.log(`🖌️ Maluję pole: (${target?.x}, ${target?.y})`);
      return move;
    }
  } else {
    console.log('⚠️ Brak dostępnych ruchów');
  }
}

start();
