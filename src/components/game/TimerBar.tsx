import { motion } from "motion/react";
import styles from './TimerBar.module.css';

interface TimerBarProps {
  timeLeft: number;
  totalTime: number;
}

export function TimerBar({ timeLeft, totalTime }: TimerBarProps) {
  const percentage = Math.max(0, (timeLeft / totalTime) * 100);
  
  return (
    <div 
      className={styles.container}
      role="progressbar"
      aria-valuenow={timeLeft}
      aria-valuemin={0}
      aria-valuemax={totalTime}
      aria-label="Time remaining"
    >
      <motion.div 
        className={styles.bar}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: "linear" }}
        style={{
            backgroundColor: percentage < 20 ? 'var(--destructive)' : 'var(--primary)'
        }}
      />
    </div>
  );
}
