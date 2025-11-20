export const SOUNDS = {
  CORRECT: '/sounds/correct.mp3',
  WRONG: '/sounds/wrong.mp3',
  CLICK: '/sounds/click.mp3',
  WIN: '/sounds/win.mp3',
  GAME_OVER: '/sounds/game-over.mp3',
  TICK: '/sounds/tick.mp3',
} as const;

export type SoundName = keyof typeof SOUNDS;
