import { serve } from 'bun';
import { GameState } from './game/GameState';
import { createFetch } from './http';
import { createWebSocket } from './ws';

type GameServerSettings = {
  /**
   * ms time of one turn
   */
  turnTime: number;
}

export function gameServer(settings: GameServerSettings) {
  const gameState = new GameState(settings.turnTime, 60, 80);

  const server = serve({
    port: 3000,
    fetch: createFetch(gameState),
    websocket: createWebSocket(gameState),
  });

  console.log(`Pixel Bot Arena server running on http://localhost:${server.port}`);

  return server;
}
