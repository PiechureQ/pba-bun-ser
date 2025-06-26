import type { MapSerialized } from '../game/GameMap';
import type { Player } from '../game/Player';

export type GameUpdate = {
  "type": "gameUpdate",
  "playerId": string,
  "turnNumber": number,
  "roundNumber": number,
  "map": MapSerialized,
  "players": Player[],
}
