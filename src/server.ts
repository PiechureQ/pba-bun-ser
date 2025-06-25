import { serve } from 'bun';
import { playerSocket } from './ws/player';
// import { setupObserverSocket } from './ws/observer';
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
        if (server.upgrade(req)) return;
        return new Response(null, { status: 426 });
      }

      return new Response('Not Found', { status: 404 });
    },
    websocket: {
      open(ws) {
        const url = new URL(ws.data.url);
        if (url.pathname.includes('/player')) {
          playerSocket(ws, gameState);
        } else if (url.pathname.includes('/observer')) {
          // setupObserverSocket(ws, gameState);
        } else {
          ws.close();
        }
      },
      message(ws, message) {
        console.log(message);
        if (message.type === 'join') {
          ws.publish('join', message);
        } else if (message.type === 'playerMove') {
          ws.publish('playerMove', message);
        };
      },
      close(ws) {
        if (ws.data.playerId) {
          gameState.removePlayer(playerId);
        }
      }
    },
  });

  console.log(`Pixel Bot Arena server running on http://localhost:${server.port}`);

  return server;
}
