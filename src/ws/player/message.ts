import type { CommandName, Target } from '../../game/Command';
import { Pixel } from '../../game/Pixel';

export namespace PlayerIn {
  export type PlayerMove = {
    "type": "playerMove",
    "command": CommandName,
    "targets": Target[]
  }

  export type JoinGame = {
    "type": "join",
  }

  export type Messages = PlayerMove | JoinGame

  export function parse(data: string) {
    return JSON.parse(data) as Messages;
  }
}


export namespace PlayerOut {
  export type JoinedGame = {
    "type": "joined",
    playerId: string,
    playerColor: string
  }

  export type GameUpdate = {
    "type": "gameUpdate",
    "round": number,
    "mapChanges": Pixel[],
  }

  export type PlayerTurn = {
    "type": "playerTurn",
    "availableCommands": PlayerCommand[]
  }

  export type Messages = JoinedGame | PlayerTurn | GameUpdate;

  type PlayerCommand = {
    "type": CommandName,
    "availableTargets": Target[]
  }

  export function stringify(data: Messages) {
    return JSON.stringify(data);
  }
}
