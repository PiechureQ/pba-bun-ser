import { GameState } from "../../game/GameState";
import { SocketHandlerInterface, WebSocketData } from "../handler";
import { ObserverOut } from "./message";

export class ObserverHandler implements SocketHandlerInterface {
  onOpen(ws: Bun.ServerWebSocket<WebSocketData>, gameState: GameState): void {
    gameState.onRoundEnd(({ state, mapChanges }) => {
      ws.send(ObserverOut.stringify({
        type: 'gameUpdate',
        round: state.roundNumber,
        mapChanges,
      }));
    })
  }
  onMessage(ws: Bun.ServerWebSocket<WebSocketData>, gameState: GameState): void {
  }
  onClose(ws: Bun.ServerWebSocket<WebSocketData>, gameState: GameState): void {
  }
}

