export type Target = {
  x: number;
  y: number;
};

export type CommandName = 'paint' | 'eat' | 'splat' | 'bomb' | 'expand';

export type Command = {
  command: CommandName;
  targets: Target[];
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
  splat: {
    maxTargets: 16,
    cooldown: 30
  },
  expand: {
    maxTargets: 0,
    cooldown: 50
  },
} as const

