import type { Command } from './Command';
import { Player } from './Player';
import { GameMap, type MapSerialized } from './GameMap';
import { createEmitter } from './Events';
import type { GameEventsCallbacks } from './Events';

export class GameState {
  state: 'waiting' | 'playing' = 'waiting';
  private readonly players = new Map<string, Player>();
  private readonly map = new GameMap(40, 40);

  private readonly emitter = createEmitter();
  private loop: undefined | NodeJS.Timer = undefined;

  private turnNumber = 0;
  private roundNumber = 0;
  private activePlayer: undefined | string = undefined;

  constructor(private readonly turnTime: number) { }

  async start() {
    this.turnNumber = 0;
    this.roundNumber = 0;
    this.activePlayer = this.players.keys().next().value;
    this.state = 'playing';

    this.emitter.emit('gameStart', this.serialize());

    if (this.loop) clearInterval(this.loop);
    this.loop = setInterval(() => {
      const player = this.players.values().toArray()[this.turnNumber % this.players.size];
      if (player) {
        this.emitter.emit('turnBegin', { playerId: player.id, state: this.serialize() });

        this.activePlayer = player.id;

        this.emitter.emit('turnChange', { playerId: player.id, state: this.serialize(), availableCommands: this.getAvailableCommands(player.id) });

        this.turnNumber++;

        this.emitter.emit('turnEnd', { playerId: player.id, state: this.serialize() });
      }
      if (this.turnNumber === this.players.size) {
        this.turnNumber = 0;
        this.roundNumber++;
      }
    }, this.turnTime);
  }

  stop() {
    if (this.loop) clearInterval(this.loop);
    this.state = 'waiting';
    this.emitter.emit('gameStop', this.serialize());
  }

  onTurnChange(cb: GameEventsCallbacks['turnChange']) {
    this.emitter.on('turnChange', cb);
  }

  onTurnEnd(cb: GameEventsCallbacks['turnEnd']) {
    this.emitter.on('turnEnd', cb);
  }

  addPlayer(): Player {
    const player = new Player('Player');
    this.players.set(player.id, player);
    this.map.addPlayer(player.color);
    return player;
  }

  removePlayer(id: string) {
    const player = this.players.get(id) as Player | undefined;
    if (player) {
      // this.map.removeColor(player?.color);
      this.players.delete(id);
    } else {
      // Player not found
    }
  }

  processPlayerMove(playerId: string, move: Command): boolean {
    const player = this.players.get(playerId);
    if (!player) return false;

    if (move.command === 'paint') {
      move.targets.forEach((target) => {
        if (!target) return;
        const mapPixel = this.map.getPixel(target.x, target.y);
        if (mapPixel)
          mapPixel.color = player.color;
      });
    }

    return true;
  }

  serialize(): GameStateSerialized {
    return {
      state: this.state,
      activePlayer: this.activePlayer || '',
      turnNumber: this.turnNumber,
      roundNumber: this.roundNumber,
      players: Array.from(this.players.values()),
      map: this.map.serialize(),
    };
  }

  getAvailableCommands(playerId: string): Command[] {
    const player = this.players.get(playerId);
    if (!player) return [];

    //paint
    return [{
      command: 'paint',
      targets: this.map.getSurroundingPixels(player.color).map(p => ({ x: p.x, y: p.y }))
    }];
  }
};

export type GameStateSerialized = {
  state: 'waiting' | 'playing';
  turnNumber: number;
  roundNumber: number;
  activePlayer: string;
  players: Player[];
  map: MapSerialized;
};
