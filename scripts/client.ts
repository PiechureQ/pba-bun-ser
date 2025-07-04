import type { PlayerIn, PlayerOut } from "../src/ws/player/message";


function start() {
  const ws = new WebSocket("ws://localhost:3000/ws/player");

  let playerId = '';
  let color = '';

  // socket opened
  ws.addEventListener("open", event => {
    console.log('🔌 Połączono z WebSocketem');
    ws.send(JSON.stringify({ type: 'join' }));
  });

  // message is received
  ws.addEventListener("message", event => {
    const message = JSON.parse(event.data) as PlayerOut.Messages;
    if (message.type === 'joined') {
      console.log('message', message, typeof message)
      playerId = message.playerId;
      color = message.playerColor;
      console.log(`🧠 Dołączono do gry jako ${playerId} (kolor: ${color})`);
    } else if (message.type === 'playerTurn') {
      const response = handlePlayerTurn(message as PlayerOut.PlayerTurn);
      if (response)
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

function handlePlayerTurn(message: PlayerOut.PlayerTurn): PlayerIn.PlayerMove | undefined {
  const availableCommands = message.availableCommands;

  const command = availableCommands[Math.floor(Math.random() * availableCommands.length)]

  if (command) {
    const randomTarget = command.availableTargets[Math.floor(Math.random() * command.availableTargets.length)];

    const move: PlayerIn.PlayerMove = {
      type: 'playerMove',
      command: command.type,
      targets: randomTarget ? [randomTarget] : []
    };

    if (randomTarget) {
      console.log(`🏃 Wykonuję komendę ${command.type} na polu: (${randomTarget.x}, ${randomTarget.y})`);
    } else {
      console.log(`🏃 Wykonuję komendę ${command.type}`);
    }
    return move;
  }

  console.log('⚠️ Brak dostępnych ruchów');
  return undefined;
}

start();
start();
start();
start();
start();
