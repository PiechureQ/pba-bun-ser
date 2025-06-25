export type Target = {
  x: number;
  y: number;
};

export type CommandName = 'paint';

export type Command = {
  command: CommandName;
  targets: Target[];
};
