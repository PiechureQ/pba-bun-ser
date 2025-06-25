export class Pixel {
  readonly x: number;
  readonly y: number;
  color: string;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    this.color = color;
  }

  reset() {
    this.color = '#000000';
  }
};
