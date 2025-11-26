import { useEffect, useState, useMemo } from 'react';
import styles from './MultipleChoiceInput.module.css';

interface MultipleChoiceInputProps {
  correctAnswer: number;
  onAnswer: (answer: number) => void;
  disabled?: boolean;
  selectedAnswer?: number | null;
  feedback?: 'correct' | 'incorrect' | null;
}

export function MultipleChoiceInput({ correctAnswer, onAnswer, disabled, selectedAnswer, feedback }: MultipleChoiceInputProps) {
  const options = useMemo(() => {
    const opts = new Set<number>();
    opts.add(correctAnswer);

    // Generate distractors
    while (opts.size < 6) {
      const offset = Math.floor(Math.random() * 10) - 5; // -5 to 5
      const val = correctAnswer + offset;
      if (val >= 0 && val !== correctAnswer) {
        opts.add(val);
      } else {
        // Fallback for edge cases or if we're stuck
        opts.add(Math.floor(Math.random() * 20) + 1);
      }
    }

    return Array.from(opts).sort(() => Math.random() - 0.5);
  }, [correctAnswer]);

  return (
    <div className={styles.container}>
      {options.map((opt, i) => {
        const isSelected = selectedAnswer === opt;
        const statusClass = isSelected && feedback === 'correct' ? styles.correct :
                          isSelected && feedback === 'incorrect' ? styles.incorrect : '';
        
        return (
          <button
            key={i}
            className={`${styles.option} ${statusClass}`}
            onClick={() => onAnswer(opt)}
            disabled={disabled}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
