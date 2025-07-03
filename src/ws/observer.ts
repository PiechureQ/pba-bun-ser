import type { MapSerialized } from '../game/GameMap';
import { Pixel } from '../game/Pixel';
import type { Player } from '../game/Player';

export type GameUpdate = {
  "type": "gameUpdate",
  "roundNumber": number,
  "map": MapSerialized,
  "mapChanges": Pixel[],
  "players": Player[],
}
