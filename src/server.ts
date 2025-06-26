import { serve } from 'bun';
import type { PlayerMove, PlayerTurn, ReceivedMessages } from './ws/player';
import { GameState } from './game/GameState';

type GameServerSettings = {
  /**
   * ms time of one turn
   */
  turnTime: number;
}

export function gameServer(settings: GameServerSettings) {
  const gameState = new GameState(settings.turnTime);

  const server = serve({
    port: 3000,
    fetch(req, server) {
      const url = new URL(req.url);

      if (url.pathname === '/game-state' && req.method === 'GET') {
        return new Response(JSON.stringify(gameState.serialize()), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (url.pathname === '/start' && req.method === 'GET') {
        gameState.start();
        return new Response(JSON.stringify(gameState.serialize()), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (url.pathname === '/stop' && req.method === 'GET') {
        gameState.stop();
        return new Response('ok', {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (url.pathname.startsWith('/ws')) {
        if (server.upgrade(req, { data: { url } })) return;
        return new Response(null, { status: 426 });
      }

      return new Response('Not Found', { status: 404 });
    },
    websocket: {
      open(ws) {
        const data = ws.data as { url: URL, playerId?: string };
        const url = new URL(data.url);
        if (url.pathname.includes('/player')) {
          // listen for player turn and send it to the player
          gameState.onTurnChange(({ playerId, state, availableCommands }) => {
            // console.log(`Sending player turn to ${playerId}`, state, availableCommands);
            ws.send(JSON.stringify({
              type: 'playerTurn',
              playerId,
              ...state,
              availableCommands: availableCommands.map(command => ({ type: command.command, availableTargets: command.targets }))
            } as PlayerTurn));
          })
          ws.subscribe('join');
          ws.subscribe('playerMove');
        } else if (url.pathname.includes('/observer')) {
          // setupObserverSocket(ws, gameState);
        } else {
          ws.close();
        }
      },
      message(ws, payload) {
        const message = JSON.parse(payload.toString()) as ReceivedMessages;

        if (message.type === 'join') {
          ws.publish('join', payload);
          const player = gameState.addPlayer();
          (ws.data as { playerId?: string }).playerId = player.id;
          console.log('Player joined:', player.id, player.color);
          // Możesz wysłać potwierdzenie do gracza
          ws.send(JSON.stringify({ type: 'joined', playerId: player.id, playerColor: player.color }));
        } else if (message.type === 'playerMove') {
          // console.log('Processing player move:', message);
          ws.publish('playerMove', payload);

          const playerId = (ws.data as { playerId?: string }).playerId;
          if (!playerId) return
          const { command, targets } = message;
          const success = gameState.processPlayerMove(playerId, { command, targets });

          if (!success) {
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid move' }));
          }
        };
      },
      close(ws) {
        const data = ws.data as { playerId?: string };
        if (data.playerId) {
          gameState.removePlayer(data.playerId);
          console.log(`Player ${data.playerId} disconnected`);
        }
      }
    },
  });

  console.log(`Pixel Bot Arena server running on http://localhost:${server.port}`);

  return server;
}
