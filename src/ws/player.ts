import type { ServerWebSocket } from 'bun';
import type { GameState } from '../game/GameState';
import type { Pixel } from '../game/Pixel';
import type { Player } from '../game/Player';
import type { CommandName, Target } from '../game/Command';

export type PlayerMove = {
  "type": "playerMove",
  "command": CommandName,
  "targets": Target[]
}

export type PlayerTurn = {
  "type": "playerTurn",
  "playerId": string,
  "turnNumber": number,
  "roundNumber": number,
  "map": Pixel[],
  "players": Player[],
  "availableCommands": PlayerCommand[]
}

export type JoinGame = {
  "type": "join",
}

export type ReceivedMessages = JoinGame | PlayerMove;

export type PlayerCommand = {
  "type": CommandName,
  "availableTargets": Target[]
}
