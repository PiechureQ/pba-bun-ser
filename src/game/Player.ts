
export class Player {
  public readonly id: string = crypto.randomUUID();
  public name: string;
  public readonly color: string = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

  constructor(name: string) {
  this.name = name;
  }
}
