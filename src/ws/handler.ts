import type { GameState } from '../game/GameState';

export type WebSocketData = { url: URL, playerId?: string };

export interface SocketHandlerInterface {
  onOpen(ws: Bun.ServerWebSocket<WebSocketData>, gameState: GameState): void;
  onMessage(ws: Bun.ServerWebSocket<WebSocketData>, gameState: GameState, payload: string | Buffer): void;
  onClose(ws: Bun.ServerWebSocket<WebSocketData>, gameState: GameState): void;
}
