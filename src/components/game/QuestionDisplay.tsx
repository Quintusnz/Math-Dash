import { motion } from "motion/react";
import styles from './QuestionDisplay.module.css';

interface QuestionDisplayProps {
  text: string;
}

export function QuestionDisplay({ text }: QuestionDisplayProps) {
  return (
    <div className={styles.container}>
      <motion.h1 
        key={text}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={styles.text}
      >
        {text} = ?
      </motion.h1>
    </div>
  );
}
