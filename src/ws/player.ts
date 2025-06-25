import type { ServerWebSocket } from 'bun';
import type { GameState } from '../game/GameState';
import type { Pixel } from '../game/Pixel';
import type { Player } from '../game/Player';
import type { CommandName, Target } from '../game/Command';

type PlayerMove = {
  "type": "playerMove",
  "command": CommandName,
  "targets": Target[]
}

type PlayerTurn = {
  "type": "turnChange",
  "playerId": string,
  "turnNumber": number,
  "roundNumber": number,
  "map": Pixel[],
  "players": Player[],
  "availableCommands": PlayerCommand[]
}

type PlayerCommand = {
  "type": CommandName, 
  "availableTargets": Target[]
}

export function playerSocket(ws: ServerWebSocket, gameState: GameState) {
  let playerId: string | null = null;

  gameState.onTurnChange(({playerId, state, availableCommands}) => {
    ws.send(JSON.stringify({ type: 'turnChange', playerId, ...state, availableCommands: availableCommands.map(command => ({ type: command.command, availableTargets: command.targets })) } as PlayerTurn));
  })

  ws.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === 'join') {
        playerId = gameState.addPlayer().id;
        ws.data.playerId = playerId;
        // Możesz wysłać potwierdzenie do gracza
        ws.send(JSON.stringify({ type: 'joined', playerId }));
      }

      if (data.type === 'playerMove' && playerId) {
        // Przetwórz ruch gracza
        const { command, targets } = data as PlayerMove;
        const success = gameState.processPlayerMove(playerId, {command, targets});

        if (!success) {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid move' }));
        }
      }
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON or command' }));
    }
  };

  ws.onclose = () => {
    if (playerId) {
      gameState.removePlayer(playerId);
    }
  };
}
