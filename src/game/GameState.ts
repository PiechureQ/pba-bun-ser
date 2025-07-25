import { CommandRules, Target, type Command } from './Command';
import { Player } from './Player';
import { GameMap, type MapSerialized } from './GameMap';
import { createEmitter } from './Events';
import type { GameEventsCallbacks } from './Events';
import { Pixel } from './Pixel';

export class GameState {
  state: 'waiting' | 'playing' = 'waiting';
  private readonly players = new Map<string, Player>();
  private readonly map: GameMap;

  private readonly emitter = createEmitter();
  private loop: undefined | NodeJS.Timer = undefined;

  private turnNumber = 0;
  private roundNumber = 0;
  private activePlayer: undefined | string = undefined;
  private mapChanges: Pixel[];

  constructor(private readonly turnTime: number, width: number, height: number) {
    this.map = new GameMap(width, height);
    this.mapChanges = [];
  }

  async start(opts?: { _noLoop?: boolean }) {
    this.turnNumber = 0;
    this.roundNumber = 0;
    this.activePlayer = this.players.keys().next().value;
    this.state = 'playing';

    this.emitter.emit('gameStart', this.serialize());

    if (opts?._noLoop) return;
    if (this.loop) clearInterval(this.loop);
    this.loop = setInterval(this.onLoop.bind(this), this.turnTime);
  }

  onLoop() {
    if (this.players.size < 1) return

    const player = this.players.values().toArray()[this.turnNumber % this.players.size];
    if (player) {
      this.emitter.emit('turnBegin', { playerId: player.id, state: this.serialize() });

      this.activePlayer = player.id;

      this.emitter.emit('turnChange', { playerId: player.id, state: this.serialize(), availableCommands: this.getAvailableCommands(player.id, this.roundNumber) });

      this.turnNumber = this.turnNumber + 1;

      this.emitter.emit('turnEnd', { playerId: player.id, state: this.serialize() });
    }
    if (this.turnNumber === this.players.size) {
      this.turnNumber = 0;
      this.roundNumber++;
      this.emitter.emit('roundEnd', { state: this.serialize(), mapChanges: this.mapChanges });
      this.mapChanges = [];
    }
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

  onRoundEnd(cb: GameEventsCallbacks['roundEnd']) {
    this.emitter.on('roundEnd', cb);
  }

  addPlayer(): Player {
    const player = new Player('Player');
    this.players.set(player.id, player);
    // this.map.addPlayer(player.color);
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

  processPlayerMove(playerId: string, move: Command): { status: boolean; message: undefined | string; affected: Pixel[] } {
    const affected: Pixel[] = []
    let success = false;
    let message: undefined | string = undefined;

    const player = this.players.get(playerId);
    if (!player) return { status: false, affected };

    const command = move.command;
    const maxTargets = CommandRules[command].maxTargets;

    if (!player.canUseCommand(command, this.roundNumber)) return { status: false, affected };

    switch (command) {
      case 'paint':
        message = (() => {
          const target = move.targets[0];
          if (!target) return 'no valid target';
          const mapPixel = this.map.getPixel(target.x, target.y);
          if (!mapPixel) return 'target is not on map';
          mapPixel.color = player.color;
          affected.push(mapPixel);
          success = true;
        })()
        break;
      case 'bomb':
        (() => {
          const target = move.targets[0];
          if (!target) return;
          const targetPixel = this.map.getPixel(target.x, target.y);
          if (!targetPixel) return;
          let randomFrom = targetPixel;

          const { size } = CommandRules.bomb;
          const painted = new Set<string>();

          const queue: Pixel[] = [targetPixel];
          painted.add(`${target.x},${target.y}`);

          while (painted.size < size && queue.length > 0) {
            const nbr = this.map.getSurroundingPixel(randomFrom);
            if (nbr.length === 0) continue;
            // get random from nbr
            const random = nbr[Math.floor(Math.random() * nbr.length)];
            if (!random) continue;
            randomFrom = random;
            if (painted.has(`${random.x},${random.y}`)) continue;
            painted.add(`${random.x},${random.y}`);
            queue.push(random);
          }

          queue.forEach(pixel => {
            pixel.color = player.color;
            const mapPixel = this.map.getPixel(pixel.x, pixel.y);
            if (mapPixel) {
              mapPixel.color = player.color;
              affected.push(mapPixel);
            }
          })

          success = true;
        })()
        break;
      case 'eat':
        (() => {
          const target = move.targets[0];
          if (!target) return;
          const queue = this.map.getEnclosedPixels(player.color);
          queue.forEach(pixel => {
            pixel.color = player.color;
            const mapPixel = this.map.getPixel(pixel.x, pixel.y);
            if (mapPixel) {
              mapPixel.color = player.color;
              affected.push(mapPixel);
            }
          })
          success = true;
        })()
        break;
      case 'expand':
        (() => {
          const target = move.targets[0];
          if (!target) return;
          const queue = this.map.getSurroundingColor(player.color);
          queue.forEach(pixel => {
            pixel.color = player.color;
            const mapPixel = this.map.getPixel(pixel.x, pixel.y);
            if (mapPixel) {
              mapPixel.color = player.color;
              affected.push(mapPixel);
            }
          })
          success = true;
        })()
        break;
      default:
        break;
    }

    if (success) {
      player.setCommandUsed(command, this.roundNumber);
      this.mapChanges.push(...affected);
    }
    return { status: success, message, affected };
  }

  serialize(): GameStateSerialized {
    return {
      state: this.state,
      roundNumber: this.roundNumber,
      players: Array.from(this.players.values()),
      map: this.map.serialize(),
    };
  }

  getAvailableCommands(playerId: string, roundNumber: number): Command[] {
    const player = this.players.get(playerId);
    if (!player) return [];

    const commands = player.getAvailableCommands(roundNumber);

    return commands.map(command => {
      switch (command) {
        case 'paint':
        // return {
        //   command,
        //   targets: this.map.getSurroundingColor(player.color).map(p => ({ x: p.x, y: p.y }))
        // }
        case 'bomb':
        case 'eat':
        case 'expand':
          return {
            command,
            targets: []
          }
        default:
          return undefined;
      }
    }).filter(Boolean) as Command[];
  }

  getMap() {
    return this.map
  }
};

export type GameStateSerialized = {
  state: 'waiting' | 'playing';
  roundNumber: number;
  players: Player[];
  map: MapSerialized;
};
