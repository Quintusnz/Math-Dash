"use client";

import { useEffect } from "react";
import { useDuelStore } from "@/lib/stores/useDuelStore";
import { generateQuestion, Difficulty } from "@/lib/game-engine/question-generator";
import { DuelLayout } from "@/components/game/duel/DuelLayout";
import { PlayerLane } from "@/components/game/duel/PlayerLane";
import { TimerBar } from "@/components/game/TimerBar";
import { useRouter } from "next/navigation";
import { useGameSound } from "@/lib/hooks/useGameSound";

export default function DuelPage() {
  const router = useRouter();
  const { play, vibrate } = useGameSound();
  const { 
    status, 
    timeLeft, 
    player1, 
    player2,
    setSetup,
    setDifficulty,
    startGame, 
    endGame,
    tick, 
    setQuestion, 
    appendInput, 
    clearInput, 
    submitAnswer 
  } = useDuelStore();

  // Game Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'playing') {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, tick]);

  // Sound Effects
  useEffect(() => {
    if (status === 'playing' && timeLeft <= 5 && timeLeft > 0) {
      play('TICK');
    }
    if (status === 'finished') {
      play('GAME_OVER');
    }
  }, [timeLeft, status, play]);

  // Initial Start
  useEffect(() => {
    if (status === 'idle') {
      setSetup();
    }
  }, [status, setSetup]);

  // Handle P1 Submit
  const handleP1Submit = () => {
    const isCorrect = submitAnswer('p1');
    if (isCorrect) {
      play('CORRECT');
      setQuestion('p1', generateQuestion(player1.difficulty));
    } else {
      play('WRONG');
      vibrate(50);
      clearInput('p1');
    }
  };

  // Handle P2 Submit
  const handleP2Submit = () => {
    const isCorrect = submitAnswer('p2');
    if (isCorrect) {
      play('CORRECT');
      setQuestion('p2', generateQuestion(player2.difficulty));
    } else {
      play('WRONG');
      vibrate(50);
      clearInput('p2');
    }
  };

  const handleStart = () => {
    startGame();
    setQuestion('p1', generateQuestion(player1.difficulty));
    setQuestion('p2', generateQuestion(player2.difficulty));
  };

  if (status === 'setup') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background p-8">
        <h1 className="text-4xl font-bold mb-8">Duel Setup</h1>
        
        <div className="flex gap-8 mb-12 w-full max-w-4xl">
          {/* Player 1 Setup */}
          <div className="flex-1 p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Player 1</h2>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Difficulty</label>
              <div className="flex flex-col gap-2">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty('p1', d)}
                    className={`px-4 py-3 rounded-lg font-bold capitalize transition-colors ${
                      player1.difficulty === d 
                        ? 'bg-blue-500 text-white shadow-md' 
                        : 'bg-white text-gray-600 hover:bg-blue-100'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* VS Badge */}
          <div className="flex items-center justify-center">
            <div className="text-4xl font-black text-gray-300">VS</div>
          </div>

          {/* Player 2 Setup */}
          <div className="flex-1 p-6 bg-red-50 rounded-xl border-2 border-red-200">
            <h2 className="text-2xl font-bold text-red-800 mb-4">Player 2</h2>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Difficulty</label>
              <div className="flex flex-col gap-2">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty('p2', d)}
                    className={`px-4 py-3 rounded-lg font-bold capitalize transition-colors ${
                      player2.difficulty === d 
                        ? 'bg-red-500 text-white shadow-md' 
                        : 'bg-white text-gray-600 hover:bg-red-100'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => router.push('/')}
            className="px-8 py-4 text-gray-600 font-bold hover:bg-gray-100 rounded-full"
          >
            Back
          </button>
          <button 
            onClick={handleStart}
            className="px-12 py-4 bg-primary text-primary-foreground rounded-full font-bold text-xl shadow-lg hover:scale-105 transition-transform"
          >
            Start Duel!
          </button>
        </div>
      </div>
    );
  }

  if (status === 'finished') {
    // Simple result screen for now
    const winner = player1.score > player2.score ? 'Player 1' : player2.score > player1.score ? 'Player 2' : 'Draw';
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Game Over!</h1>
        <h2 className="text-2xl mb-8 text-primary font-bold">
          {winner === 'Draw' ? "It's a Draw!" : `${winner} Wins!`}
        </h2>
        
        <div className="flex gap-8 mb-8 w-full max-w-md">
          <div className="flex-1 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-bold text-blue-800">Player 1</h3>
            <div className="text-3xl font-bold">{player1.score}</div>
            <div className="text-sm text-muted-foreground">{player1.questionsCorrect} correct</div>
            <div className="text-xs text-muted-foreground mt-1 capitalize">{player1.difficulty}</div>
          </div>
          <div className="flex-1 p-4 bg-red-50 rounded-lg">
            <h3 className="font-bold text-red-800">Player 2</h3>
            <div className="text-3xl font-bold">{player2.score}</div>
            <div className="text-sm text-muted-foreground">{player2.questionsCorrect} correct</div>
            <div className="text-xs text-muted-foreground mt-1 capitalize">{player2.difficulty}</div>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={handleStart}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-bold text-lg"
          >
            Rematch
          </button>
          <button 
            onClick={() => setSetup()}
            className="px-8 py-3 bg-secondary text-secondary-foreground rounded-full font-bold text-lg"
          >
            Change Settings
          </button>
          <button 
            onClick={() => router.push('/')}
            className="px-8 py-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-full font-bold text-lg"
          >
            Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <DuelLayout
      timer={
        <div className="w-full max-w-md px-4 flex items-center gap-4">
          <span className="font-mono font-bold text-xl w-8">{timeLeft}</span>
          <div className="flex-1">
            <TimerBar timeLeft={timeLeft} totalTime={60} />
          </div>
        </div>
      }
      player1={
        <PlayerLane
          playerId="p1"
          score={player1.score}
          input={player1.input}
          currentQuestion={player1.currentQuestion}
          onInput={(d) => appendInput('p1', d)}
          onClear={() => clearInput('p1')}
          onSubmit={handleP1Submit}
          disabled={status !== 'playing'}
          color="bg-blue-50/30"
        />
      }
      player2={
        <PlayerLane
          playerId="p2"
          score={player2.score}
          input={player2.input}
          currentQuestion={player2.currentQuestion}
          onInput={(d) => appendInput('p2', d)}
          onClear={() => clearInput('p2')}
          onSubmit={handleP2Submit}
          disabled={status !== 'playing'}
          color="bg-red-50/30"
        />
      }
    />
  );
}
