import type { CommandName, Target } from '../game/Command';
import type { MapSerialized } from '../game/GameMap';
import type { Player } from '../game/Player';

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
  "map": MapSerialized,
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
