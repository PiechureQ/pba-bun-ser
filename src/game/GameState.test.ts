import { GameState } from './GameState';
import { Player } from './Player';

describe('GameState', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = new GameState(1000, 10, 20);
  });

  it('should create a GameState instance', () => {
    expect(gameState).toBeInstanceOf(GameState);
  });

  it('should start in the "waiting" state', () => {
    expect(gameState.state).toBe('waiting');
  });

  it('should transition to the "playing" state on start', () => {
    gameState.start();
    expect(gameState.state).toBe('playing');
    gameState.stop();
  });

  it('should stop the game', () => {
    gameState.start();
    gameState.stop();
    expect(gameState.state).toBe('waiting');
  });

  it('should add a player', () => {
    const player = gameState.addPlayer();
    expect(player).toBeInstanceOf(Player);
  });

  it('should remove a player', () => {
    const player = gameState.addPlayer();
    gameState.removePlayer(player.id);
  });

  describe('processPlayerMove', () => {
    let player: Player;

    beforeEach(() => {
      player = gameState.addPlayer();
      gameState.start();
    });

    afterEach(() => {
      gameState.stop();
    });

    it('should process a "paint" command', () => {
      const move = {
        command: 'paint' as const,
        targets: [{ x: 5, y: 5 }],
      };
      const result = gameState.processPlayerMove(player.id, move);
      expect(result).toBe(true);
    });

    it('should process a "splat" command', () => {
      const move = {
        command: 'splat' as const,
        targets: [{ x: 5, y: 5 }, { x: 6, y: 6 }],
      };
      const result = gameState.processPlayerMove(player.id, move);
      expect(result).toBe(true);
    });

    it('should process a "bomb" command', () => {
      const move = {
        command: 'bomb' as const,
        targets: [{ x: 5, y: 5 }],
      };
      const result = gameState.processPlayerMove(player.id, move);
      expect(result).toBe(true);
    });
  });
});
