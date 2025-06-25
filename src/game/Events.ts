import mitt from 'mitt';
import type { GameStateSerialized } from './GameState';
import type { Command } from './Command';

export type GameEvents = {
  turnChange: { playerId: string; state: GameStateSerialized; availableCommands: Command[] };
}

export type GameEventsCallbacks = {
  [key in keyof GameEvents]: (data: GameEvents[key]) => void
}

export function createEmitter() {
  return mitt<GameEvents>();
}
