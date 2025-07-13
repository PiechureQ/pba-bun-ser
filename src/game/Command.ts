export type Target = {
  x: number;
  y: number;
};

export const CommandRules = {
  paint: {
    maxTargets: 1,
    cooldown: 1
  },
  eat: {
    maxTargets: 0,
    cooldown: 10_0
  },
  bomb: {
    maxTargets: 1,
    size: 16,
    cooldown: 10
  },
  expand: {
    maxTargets: 0,
    cooldown: 50
  },
} as const

export type CommandName = keyof typeof CommandRules;

export type Command = {
  command: CommandName;
  targets: Target[];
};

