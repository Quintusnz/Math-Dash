import useSound from 'use-sound';
import { SOUNDS } from '../constants/sounds';
import { useUserStore } from '../stores/useUserStore';

export function useGameSound() {
  const { soundEnabled, hapticsEnabled } = useUserStore();

  // We use the sprite or individual files. For simplicity, individual files.
  // Note: In a real app, we might want to use a sprite for performance.
  const [playCorrect] = useSound(SOUNDS.CORRECT, { volume: 0.5, interrupt: true });
  const [playWrong] = useSound(SOUNDS.WRONG, { volume: 0.5, interrupt: true });
  const [playClick] = useSound(SOUNDS.CLICK, { volume: 0.2, interrupt: true });
  const [playWin] = useSound(SOUNDS.WIN, { volume: 0.6 });
  const [playGameOver] = useSound(SOUNDS.GAME_OVER, { volume: 0.6 });
  const [playTick] = useSound(SOUNDS.TICK, { volume: 0.3, interrupt: true });

  const play = (sound: keyof typeof SOUNDS) => {
    if (!soundEnabled) return;

    switch (sound) {
      case 'CORRECT': playCorrect(); break;
      case 'WRONG': playWrong(); break;
      case 'CLICK': playClick(); break;
      case 'WIN': playWin(); break;
      case 'GAME_OVER': playGameOver(); break;
      case 'TICK': playTick(); break;
    }
  };

  const vibrate = (pattern: number | number[] = 10) => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  return { play, vibrate };
}
