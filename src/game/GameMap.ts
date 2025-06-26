import { Pixel } from './Pixel';

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
      [0, -1], // góra
      [0, 1],  // dół
      [-1, 0], // lewo
      [1, 0],  // prawo
    ] as const;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = this.getPixel(y, x);
        if (pixel && pixel.color !== color) continue;

        for (const [dx, dy] of directions) {
          const nx = x + dx;
          const ny = y + dy;

          if (
            nx >= 0 &&
            ny >= 0 &&
            nx < width &&
            ny < height
          ) {
            const neighbor = this.getPixel(ny, nx);
            if (neighbor && neighbor.color !== color) {
              const key = `${nx},${ny}`;
              if (!seen.has(key)) {
                seen.add(key);
                result.push(neighbor);
              }
            }
          }
        }
      }
    }

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
};

const createMap = (width: number, height: number): Pixel[][] => {
  const pixels = new Array(width).fill(null).map((_, y) => new Array(height).fill(null).map((_, x) => new Pixel(x, y, '#000000')));
  return pixels as Pixel[][];
}
