import { Pixel } from './Pixel';

export type MapSerialized = {
  pixels: string[];
  width: number;
  height: number;
}

export class GameMap {
  private readonly pixels: Pixel[][]

  constructor(private readonly width: number, private readonly height: number) {
    this.pixels = createMap(width, height);
  }

  getPixel(x: number, y: number): Pixel | undefined {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return undefined;
    }
    return this.pixels?.[x]?.[y];
  }

  addPlayer(color: string) {
    const x = Math.floor(Math.random() * this.width);
    const y = Math.floor(Math.random() * this.height);
    const startPixel = this.getPixel(x, y);
    if (startPixel) {
      startPixel.color = color;
    }
  }

  getSurroundingPixels(color: string): Pixel[] {
    const height = this.width;
    const width = this.height;
    const result: Pixel[] = [];
    const seen = new Set<string>();

    const directions = [
      [-1, -1], [0, -1], [1, -1], // góra
      [-1, 0], /* [0, 0], */[1, 0],  // środek
      [-1, 1], [0, 1], [1, 1], // dół
    ] as const;

    // get all pixels with color
    const playerPixels = this.flatten().filter(p => p.color === color);
    // console.log(playerPixels.length, playerPixels)

    // add every neighboring pixel to result without playerPixels
    playerPixels.forEach(({ x, y }) => {
      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;

        if (
          nx >= 0 &&
          ny >= 0 &&
          nx < width &&
          ny < height
        ) {
          const neighbor = this.getPixel(nx, ny);
          if (neighbor && neighbor.color !== color) {
            const key = `${nx},${ny}`;
            if (!seen.has(key)) {
              seen.add(key);
              result.push(neighbor);
            }
          }
        }
      }
    })
    //
    // console.log(result.map(p => ({ x: p.x, y: p.y })))
    // if (playerPixels.length === 2)
    //   throw new Error('Not implemented');

    return result;
  }

  flatten(): Pixel[] {
    return this.pixels.flat();
  }

  removeColor(color: string) {
    this.pixels.forEach((row) => {
      row.forEach((pixel) => {
        if (pixel.color === color) {
          pixel.reset();
        }
      })
    });
  }

  serialize(): MapSerialized {
    return {
      pixels: this.flatten().map(p => p.color),
      width: this.width,
      height: this.height,
    }
  }
};

const createMap = (width: number, height: number): Pixel[][] => {
  const pixels = new Array(height).fill(null).map((_, x) => new Array(width).fill(null).map((_, y) => new Pixel(x, y, '#ffffff')));
  return pixels as Pixel[][];
}


