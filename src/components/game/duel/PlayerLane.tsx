import { Question } from "@/lib/stores/useGameStore";
import { AnimatePresence } from "motion/react";
import { QuestionDisplay } from "../QuestionDisplay";
import { Numpad } from "../Numpad";

interface PlayerLaneProps {
  playerId: 'p1' | 'p2';
  score: number;
  input: string;
  currentQuestion: Question | null;
  onInput: (digit: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  disabled?: boolean;
  color?: string;
}

export function PlayerLane({
  playerId,
  score,
  input,
  currentQuestion,
  onInput,
  onClear,
  onSubmit,
  disabled,
  color = 'bg-blue-50'
}: PlayerLaneProps) {
  return (
    <div className={`flex-1 flex flex-col h-full relative ${color} border-r border-gray-200 last:border-r-0`}>
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <div className="text-lg font-bold text-gray-600">
          {playerId === 'p1' ? 'Player 1' : 'Player 2'}
        </div>
        <div className="text-2xl font-bold text-primary">
          {score}
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative p-4">
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <QuestionDisplay text={currentQuestion.text} />
          )}
        </AnimatePresence>
        
        <div className="text-3xl font-mono h-12 mb-4 text-primary font-bold">
          {input || "_"}
        </div>
      </div>

      {/* Controls */}
      <div className="p-2 pb-4">
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
