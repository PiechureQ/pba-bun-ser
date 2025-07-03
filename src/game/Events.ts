import mitt from 'mitt';
import type { GameStateSerialized } from './GameState';
import type { Command } from './Command';
import { Pixel } from './Pixel';

export type GameEvents = {
  turnChange: { playerId: string; state: GameStateSerialized; availableCommands: Command[] };
  turnBegin: { playerId: string; state: GameStateSerialized; }
  turnEnd: { playerId: string; state: GameStateSerialized; }
  roundEnd: { state: GameStateSerialized; mapChanges: Pixel[] }
  gameStart: GameStateSerialized;
  gameStop: GameStateSerialized;
}

export type GameEventsCallbacks = {
  [key in keyof GameEvents]: (data: GameEvents[key]) => void
}

export function createEmitter() {
  return mitt<GameEvents>();
}
