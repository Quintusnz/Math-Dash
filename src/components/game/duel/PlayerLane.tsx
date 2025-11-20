import { Question } from "@/lib/stores/useGameStore";
import { AnimatePresence } from "motion/react";
import { QuestionDisplay } from "../QuestionDisplay";
import { Numpad } from "../Numpad";
import styles from './PlayerLane.module.css';

interface PlayerLaneProps {
  playerId: 'p1' | 'p2';
  score: number;
  input: string;
  currentQuestion: Question | null;
  onInput: (digit: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function PlayerLane({
  playerId,
  score,
  input,
  currentQuestion,
  onInput,
  onClear,
  onSubmit,
  disabled
}: PlayerLaneProps) {
  return (
    <div className={styles.lane}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.playerName}>
          {playerId === 'p1' ? 'Player 1' : 'Player 2'}
        </div>
        <div className={styles.score}>
          {score}
        </div>
      </div>

      {/* Game Area */}
      <div className={styles.gameArea}>
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <QuestionDisplay text={currentQuestion.text} />
          )}
        </AnimatePresence>
        
        <div className={styles.inputDisplay}>
          {input || "_"}
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <Numpad 
          onPress={onInput} 
          onClear={onClear} 
          onSubmit={onSubmit}
          disabled={disabled}
          compact={true} // We might need to add a compact prop to Numpad
        />
      </div>
    </div>
  );
}

