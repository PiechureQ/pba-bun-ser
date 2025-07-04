import { Pixel } from '../../game/Pixel';
import type { Player } from '../../game/Player';

type Score = Player['score']

export namespace ObserverOut {
  export type GameUpdate = {
    "type": "gameUpdate",
    "round": number,
    "mapChanges": Pixel[],
  }

  export type PlayersUpdate = {
    "type": "gameUpdate",
    "players": Score[],
  }

  export type Messages = GameUpdate | PlayersUpdate;

  export function stringify(data: Messages) {
    return JSON.stringify(data);
  }
}
