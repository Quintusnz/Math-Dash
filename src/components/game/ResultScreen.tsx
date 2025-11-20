import { motion } from "motion/react";
import { HistoryList } from "./HistoryList";
import styles from './ResultScreen.module.css';
import { Achievement } from "@/lib/db";

interface ResultScreenProps {
  score: number;
  correct: number;
  total: number;
  achievements?: Achievement[];
  onPlayAgain: () => void;
  onHome: () => void;
}

export function ResultScreen({ score, correct, total, achievements, onPlayAgain, onHome }: ResultScreenProps) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className={styles.container}>
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={styles.card}
      >
        <h1 className={styles.title}>Time's Up!</h1>
        
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Score</span>
            <span className={styles.statValue}>{score}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Accuracy</span>
            <span className={styles.statValue}>{accuracy}%</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Correct</span>
            <span className={styles.statValue}>{correct}/{total}</span>
          </div>
        </div>

        {achievements && achievements.length > 0 && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="my-4 p-4 bg-yellow-100 rounded-lg border-2 border-yellow-400 text-center"
          >
            <h3 className="text-yellow-800 font-bold mb-2">🏆 Achievements Unlocked!</h3>
            <div className="flex gap-2 justify-center flex-wrap">
              {achievements.map(a => (
                <div key={a.id} className="flex flex-col items-center p-2 bg-white rounded shadow-sm">
                  <span className="text-2xl" role="img" aria-label={a.title}>{a.icon}</span>
                  <span className="text-xs font-bold text-gray-600">{a.title}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className={styles.actions}>
          <button onClick={onPlayAgain} className={styles.primaryButton}>
            Play Again
          </button>
          <button onClick={onHome} className={styles.secondaryButton}>
            Home
          </button>
        </div>
      </motion.div>
      
      <HistoryList />
    </div>
  );
}
