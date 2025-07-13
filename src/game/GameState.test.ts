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
      gameState.start({ _noLoop: true });
      gameState.onLoop();
    });

    afterEach(() => {
      gameState.stop();
    });

    describe('paint', () => {
      it('should process a "paint" command', () => {
        const move = {
          command: 'paint' as const,
          targets: [{ x: 5, y: 5 }],
        };
        const result = gameState.processPlayerMove(player.id, move);
        expect(result.status).toBe(true);
        expect(result.affected.length).toBe(1);
        expect(result.affected[0]?.x).toBe(5);
        expect(result.affected[0]?.y).toBe(5);
        expect(result.affected[0]?.color).toBe(player.color);
      });

      it('should change color of a pixel', () => {
        const move = {
          command: 'paint' as const,
          targets: [{ x: 5, y: 5 }],
        };
        gameState.processPlayerMove(player.id, move);

        expect(gameState.getMap().getPixel(5, 5)?.color).toBe(player.color);
      })

      it('should not change more than one color of a pixel', () => {
        const move = {
          command: 'paint' as const,
          targets: [{ x: 5, y: 5 }, { x: 6, y: 6 }],
        };
        gameState.processPlayerMove(player.id, move);

        expect(gameState.getMap().getPixel(6, 6)?.color).not.toBe(player.color);
      })

      it('should not process more then once per round', () => {
        const move = {
          command: 'paint' as const,
          targets: [{ x: 5, y: 5 }],
        };
        gameState.processPlayerMove(player.id, move);
        const result = gameState.processPlayerMove(player.id, move);

        expect(result.status).toBe(false);
        expect(result.affected.length).toBe(0);
      })
    })

    describe('bomb', () => {
      beforeEach(() => {
        // mock 10 rounds
        for (let i = 0; i < 10; i++) {
          gameState.onLoop()
        }
      })

      it('should process a "bomb" command', () => {
        const move = {
          command: 'bomb' as const,
          targets: [{ x: 5, y: 5 }],
        };
        const result = gameState.processPlayerMove(player.id, move);
        expect(result.status).toBe(true);
        expect(result.affected.length).toBe(16);
        expect(result.affected[0]?.x).toBe(5);
        expect(result.affected[0]?.y).toBe(5);
        expect(result.affected[0]?.color).toBe(player.color);
      });

      it('should change color of affeted pixel', () => {
        const move = {
          command: 'bomb' as const,
          targets: [{ x: 5, y: 5 }],
        };
        const result = gameState.processPlayerMove(player.id, move);

        const affected = result.affected;
        affected.forEach((pixel) => {
          expect(gameState.getMap().getPixel(pixel.x, pixel.y)?.color).toBe(player.color);
        })
      });

      it('should not process before cooldown', () => {
        const move = {
          command: 'bomb' as const,
          targets: [{ x: 5, y: 5 }],
        };
        gameState.processPlayerMove(player.id, move);

        const notProcess = gameState.processPlayerMove(player.id, move);

        expect(notProcess.status).toBe(false);
        expect(notProcess.affected.length).toBe(0);

        for (let i = 0; i < 10; i++) {
          gameState.onLoop()
        }

        const result = gameState.processPlayerMove(player.id, move);

        expect(result.status).toBe(true);
        expect(result.affected.length).toBe(16);
      });
    })
  });
});
