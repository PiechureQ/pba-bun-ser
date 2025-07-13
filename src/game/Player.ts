import { CommandName, CommandRules } from "./Command";

export class Player {
  public readonly id: string = crypto.randomUUID();
  public name: string;
  public readonly color: string = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

  public score: number = 0;
  private commandsUsed: Record<CommandName, number> = {
    paint: 0,
    bomb: 0,
    expand: 0,
    eat: 0
  }

  constructor(name: string) {
    this.name = name;
  }

  getAvailableCommands(round: number): CommandName[] {
    return Object.keys(this.commandsUsed).filter(command => this.canUseCommand(command as CommandName, round)) as CommandName[];
  }

  canUseCommand(command: CommandName, round: number): boolean {
    this.commandsUsed[command] = this.commandsUsed[command];

    return this.commandsUsed[command] + CommandRules[command].cooldown <= round;
  }

  setCommandUsed(command: CommandName, round: number) {
    this.commandsUsed[command] = round;
  }
}
