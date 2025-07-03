import { Pixel } from './Pixel';

export type MapSerialized = {
  pixels: string[];
  width: number;
  height: number;
}

export class GameMap {
  private readonly pixels: Pixel[][]

  static createMap(width: number, height: number): Pixel[][] {
    const pixels = new Array(height).fill(null).map((_, y) => new Array(width).fill(null).map((_, x) => new Pixel(x, y, '#ffffff')));
    return pixels as Pixel[][];
  }

  constructor(private readonly _width: number, private readonly _height: number) {
    this.pixels = GameMap.createMap(_width, _height);
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  getPixel(x: number, y: number): Pixel | undefined {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return undefined;
    }
    return this.pixels?.[y]?.[x];
  }

  addPlayer(color: string) {
    const x = Math.floor(Math.random() * this.width);
    const y = Math.floor(Math.random() * this.height);
    const startPixel = this.getPixel(x, y);
    if (startPixel) {
      startPixel.color = color;
    }
  }

  getSurroundingColor(color: string): Pixel[] {
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
          this.isOnMap(nx, ny)
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

    return result;
  }

  // TODO implement depth
  getSurroundingPixel(pixel: Pixel, _depth: number = 1): Pixel[] {
    const result: Pixel[] = [];
    const seen = new Set<string>();

    const directions = [
      [-1, -1], [0, -1], [1, -1], // góra
      [-1, 0], /* [0, 0], */[1, 0],  // środek
      [-1, 1], [0, 1], [1, 1], // dół
    ] as const;

    const { x, y } = pixel;
    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;

      if (
        this.isOnMap(nx, ny)
      ) {
        const neighbor = this.getPixel(nx, ny);
        if (neighbor) {
          const key = `${nx},${ny}`;
          if (!seen.has(key)) {
            seen.add(key);
            result.push(neighbor);
          }
        }
      }
    }

    return result;
  }

  getEnclosedPixels(color: string): Pixel[] {
    const enclosedPixels: Pixel[] = [];
    const visited = new Array(this.height).fill(null).map(() => new Array(this.width).fill(false)) as boolean[][];
    const queue: Pixel[] = [];

    // 1. Initialize queue with all border pixels that are not the given color
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (y === 0 || y === this.height - 1 || x === 0 || x === this.width - 1) {
          const pixel = this.getPixel(x, y);
          if (pixel && pixel.color !== color) {
            queue.push(pixel);
            // @ts-ignore: TODO
            visited[y][x] = true;
          }
        }
      }
    }

    const directions = [
      [-1, -1], [0, -1], [1, -1],
      [-1, 0], [1, 0],
      [-1, 1], [0, 1], [1, 1],
    ] as const;

    // 2. Flood fill from the border to find all "outside" pixels
    let head = 0;
    while (head < queue.length) {
      const pixel = queue[head++];
      if (!pixel) continue;

      for (const [dx, dy] of directions) {
        const nx = pixel.x + dx;
        const ny = pixel.y + dy;

        // @ts-ignore: TODO
        if (this.isOnMap(nx, ny) && !visited[ny][nx]) {
          const neighbor = this.getPixel(nx, ny);
          if (neighbor && neighbor.color !== color) {
            // @ts-ignore: TODO
            visited[ny][nx] = true;
            queue.push(neighbor);
          }
        }
      }
    }

    // 3. Collect all unvisited pixels that are not the given color
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const pixel = this.getPixel(x, y);
        // @ts-ignore: TODO
        if (pixel && pixel.color !== color && !visited[y][x]) {
          enclosedPixels.push(pixel);
        }
      }
    }

    return enclosedPixels;
  }

  isOnMap(x: number, y: number): boolean {
    return x >= 0 &&
      y >= 0 &&
      x < this.width &&
      y < this.height
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
