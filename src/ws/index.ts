import { WebSocketHandler } from "bun";
import { GameState } from "../game/GameState";
import { SocketHandlerInterface, type WebSocketData } from "./handler";
import { PlayerHandler } from "./player/handler";
import { ObserverHandler } from "./observer/handler";

export function createWebSocket(gameState: GameState) {
  let handler: SocketHandlerInterface | null = null;

  return {
    open(ws) {
      const data = ws.data;
      const url = new URL(data.url);
      if (url.pathname.includes('/player')) {
        handler = new PlayerHandler();
      } else if (url.pathname.includes('/observer')) {
        handler = new ObserverHandler();
      }

      handler?.onOpen(ws, gameState);
    },
    message(ws, payload) {
      handler?.onMessage(ws, gameState, payload);
    },
    close(ws) {
      handler?.onClose(ws, gameState);
    }
  } as WebSocketHandler<WebSocketData>
}
