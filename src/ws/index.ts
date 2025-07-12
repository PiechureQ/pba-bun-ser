import { WebSocketHandler } from "bun";
import { GameState } from "../game/GameState";
import { SocketHandlerInterface, type WebSocketData } from "./handler";
import { PlayerHandler } from "./player/handler";
import { ObserverHandler } from "./observer/handler";

export function createWebSocket(gameState: GameState) {
  const playerHandler = new PlayerHandler();
  const observerHandler = new ObserverHandler();

  return {
    open(ws) {
      const data = ws.data;
      const url = new URL(data.url);
      if (url.pathname.includes('/player')) {
        playerHandler.onOpen(ws, gameState);
      } else if (url.pathname.includes('/observer')) {
        observerHandler.onOpen(ws, gameState);
      }
    },
    message(ws, payload) {
      const data = ws.data;
      const url = new URL(data.url);
      if (url.pathname.includes('/player')) {
        playerHandler.onMessage(ws, gameState, payload);
      } else if (url.pathname.includes('/observer')) {
        observerHandler.onMessage(ws, gameState, payload);
      }
    },
    close(ws) {
      const data = ws.data;
      const url = new URL(data.url);
      if (url.pathname.includes('/player')) {
        playerHandler.onClose(ws, gameState);
      } else if (url.pathname.includes('/observer')) {
        observerHandler.onClose(ws, gameState);
      }
    }
  } as WebSocketHandler<WebSocketData>
}
