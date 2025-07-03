import { GameMap } from './GameMap';
import { Pixel } from './Pixel';

describe('GameMap', () => {
  let gameMap: GameMap;

  beforeEach(() => {
    gameMap = new GameMap(10, 20);
  });

  it('should create a GameMap instance', () => {
    expect(gameMap).toBeInstanceOf(GameMap);
  });

  it('should have the correct width and height', () => {
    expect(gameMap.width).toBe(10);
    expect(gameMap.height).toBe(20);
  });

  describe('getPixel', () => {
    it('should return the correct pixel for valid coordinates', () => {
      const pixel = gameMap.getPixel(5, 5);
      expect(pixel).toBeDefined();
      expect(pixel?.x).toBe(5);
      expect(pixel?.y).toBe(5);
    });

    it('should return undefined for invalid coordinates', () => {
      expect(gameMap.getPixel(-1, 0)).toBeUndefined();
      expect(gameMap.getPixel(10, 0)).toBeUndefined();
      expect(gameMap.getPixel(0, 20)).toBeUndefined();
    });
  });

  describe('addPlayer', () => {
    it('should add a player with the specified color to the map', () => {
      gameMap.addPlayer('red');
      const pixels = gameMap.flatten();
      const redPixels = pixels.filter(pixel => pixel.color === 'red');
      expect(redPixels.length).toBeGreaterThan(0);
    });
  });

  describe('getSurroundingPixels', () => {
    it('should return the correct surrounding pixels for a given color', () => {
      gameMap.addPlayer('red');
      const surroundingPixels = gameMap.getSurroundingPixels('red');
      expect(surroundingPixels.length).toBeGreaterThan(0);
      surroundingPixels.forEach(pixel => {
        expect(pixel.color).not.toBe('red');
      });
    });
  });

  describe('flatten', () => {
    it('should return a flattened array of pixels with the correct length', () => {
      const pixels = gameMap.flatten();
      expect(pixels.length).toBe(10 * 20);
    });
  });

  describe('removeColor', () => {
    it('should remove the specified color from all pixels on the map', () => {
      gameMap.addPlayer('red');
      gameMap.removeColor('red');
      const pixels = gameMap.flatten();
      const redPixels = pixels.filter(pixel => pixel.color === 'red');
      expect(redPixels.length).toBe(0);
    });
  });

  describe('serialize', () => {
    it('should return a serialized map with the correct width, height, and pixel colors', () => {
      gameMap.addPlayer('red');
      const serializedMap = gameMap.serialize();
      expect(serializedMap.width).toBe(10);
      expect(serializedMap.height).toBe(20);
      expect(serializedMap.pixels.length).toBe(10 * 20);
      const redPixels = serializedMap.pixels.filter(pixel => pixel === 'red');
      expect(redPixels.length).toBeGreaterThan(0);
    });
  });
});

describe('createMap', () => {
  it('should return a 2D array with the correct dimensions', () => {
    const width = 5;
    const height = 7;
    const map = GameMap.createMap(width, height) as Pixel[][];
    const test = new GameMap(width, height);
    expect(map.length).toBe(height);
    map.forEach((row: Pixel[]) => {
      expect(row.length).toBe(width);
    });
  });

  it('should return a 2D array of Pixel instances', () => {
    const width = 3;
    const height = 4;
    const map = GameMap.createMap(width, height) as Pixel[][];
    map.forEach((row: Pixel[]) => {
      row.forEach(pixel => {
        expect(pixel).toBeInstanceOf(Pixel);
      });
    });
  });

  it('should create pixels for every x from 0 to width - 1 and y from 0 to height - 1', () => {
    const width = 5;
    const height = 7;
    const map = GameMap.createMap(width, height) as Pixel[][];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = map[y][x];
        expect(pixel).toBeInstanceOf(Pixel);
        expect(pixel.x).toBe(x);
        expect(pixel.y).toBe(y);
      }
    }
  });
});

