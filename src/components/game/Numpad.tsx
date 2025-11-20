import { motion } from "motion/react";
import styles from './Numpad.module.css';
import { useGameSound } from '@/lib/hooks/useGameSound';

interface NumpadProps {
  onPress: (digit: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  disabled?: boolean;
  compact?: boolean;
}

export function Numpad({ onPress, onClear, onSubmit, disabled, compact }: NumpadProps) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'Enter'];
  const { play, vibrate } = useGameSound();

  return (
    <div className={`${styles.grid} ${compact ? styles.compact : ''}`}>
      {keys.map((key) => (
        <motion.button
          key={key}
          whileTap={{ scale: 0.95 }}
          disabled={disabled}
          className={`${styles.key} ${key === 'Enter' ? styles.enter : ''} ${key === 'C' ? styles.clear : ''}`}
          aria-label={key === 'C' ? 'Clear' : key === 'Enter' ? 'Submit Answer' : key}
          onClick={() => {
            play('CLICK');
            vibrate(10);
            if (key === 'C') onClear();
            else if (key === 'Enter') onSubmit();
            else onPress(key);
          }}
        >
          {key === 'Enter' ? 'GO' : key}
        </motion.button>
      ))}
    </div>
  );
}
