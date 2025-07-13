import { GameState } from "../../game/GameState";
import { SocketHandlerInterface, WebSocketData } from "../handler";
import { PlayerIn, PlayerOut } from "./message";

export class PlayerHandler implements SocketHandlerInterface {
  onOpen(ws: Bun.ServerWebSocket<WebSocketData>, gameState: GameState): void {
    ws.subscribe('join');
    ws.subscribe('playerMove');
    gameState.onTurnChange(({ playerId, state, availableCommands }) => {
      if (ws.data.playerId === playerId) {
        // console.log(`Sending player turn to ${playerId}`, state, availableCommands);
        ws.send(PlayerOut.stringify({
          type: 'playerTurn',
          availableCommands: availableCommands.map(command => ({ type: command.command, availableTargets: command.targets }))
        }));
      }
    })

    gameState.onRoundEnd(({ state, mapChanges }) => {
      if (mapChanges.length > 0) {
        ws.send(PlayerOut.stringify({
          type: 'gameUpdate',
          round: state.roundNumber,
          mapChanges,
        }))
      }
    })
  }

  onMessage(ws: Bun.ServerWebSocket<WebSocketData>, gameState: GameState, payload: string | Buffer): void {
    try {
      const message = PlayerIn.parse(payload.toString());

      if (message.type === 'join') {
        ws.publish('join', payload);

        const player = gameState.addPlayer();
        ws.data.playerId = player.id;
        console.log('Player joined:', player.id, player.color);

        ws.send(PlayerOut.stringify({ type: 'joined', playerId: player.id, playerColor: player.color }));
      } else if (message.type === 'playerMove') {
        ws.publish('playerMove', payload);

        const playerId = ws.data.playerId;
        if (!playerId) return
        const { command, targets } = message;

        gameState.processPlayerMove(playerId, { command, targets });
      };
    } catch (e) {
      console.error('Error parsing message:', e);
      return
    }
  }
  onClose(ws: Bun.ServerWebSocket<WebSocketData>, gameState: GameState): void {
    const data = ws.data as { playerId?: string };
    if (data.playerId) {
      gameState.removePlayer(data.playerId);
      console.log(`Player ${data.playerId} disconnected`);
    }
  }
}

