"use client";

import { useEffect } from "react";
import { useDuelStore } from "@/lib/stores/useDuelStore";
import { generateQuestion, Difficulty } from "@/lib/game-engine/question-generator";
import { DuelLayout } from "@/components/game/duel/DuelLayout";
import { PlayerLane } from "@/components/game/duel/PlayerLane";
import { TimerBar } from "@/components/game/TimerBar";
import { useRouter } from "next/navigation";
import { useGameSound } from "@/lib/hooks/useGameSound";
import styles from './page.module.css';

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
      <div className={styles.container}>
        <h1 className={styles.title}>Duel Setup</h1>
        
        <div className={styles.setupGrid}>
          {/* Player 1 Setup */}
          <div className={`${styles.playerCard} ${styles.playerCardP1}`}>
            <h2 className={`${styles.playerTitle} ${styles.playerTitleP1}`}>Player 1</h2>
            <div className="space-y-4">
              <label className={styles.label}>Difficulty</label>
              <div className={styles.difficultyGroup}>
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty('p1', d)}
                    className={`${styles.difficultyButton} ${styles.difficultyButtonP1} ${
                      player1.difficulty === d ? styles.difficultyButtonP1Active : ''
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* VS Badge */}
          <div className={styles.vsContainer}>
            <div className={styles.vsText}>VS</div>
          </div>

          {/* Player 2 Setup */}
          <div className={`${styles.playerCard} ${styles.playerCardP2}`}>
            <h2 className={`${styles.playerTitle} ${styles.playerTitleP2}`}>Player 2</h2>
            <div className="space-y-4">
              <label className={styles.label}>Difficulty</label>
              <div className={styles.difficultyGroup}>
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty('p2', d)}
                    className={`${styles.difficultyButton} ${styles.difficultyButtonP2} ${
                      player2.difficulty === d ? styles.difficultyButtonP2Active : ''
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            onClick={() => router.push('/')}
            className={styles.buttonBack}
          >
            Back
          </button>
          <button 
            onClick={handleStart}
            className={styles.buttonStart}
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
      <div className={styles.resultContainer}>
        <h1 className={styles.title}>Game Over!</h1>
        <h2 className={styles.winnerTitle}>
          {winner === 'Draw' ? "It's a Draw!" : `${winner} Wins!`}
        </h2>
        
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.statCardP1}`}>
            <h3 className={`${styles.statTitle} ${styles.statTitleP1}`}>Player 1</h3>
            <div className={styles.statScore}>{player1.score}</div>
            <div className={styles.statDetail}>{player1.questionsCorrect} correct</div>
            <div className={styles.statSubDetail}>{player1.difficulty}</div>
          </div>
          <div className={`${styles.statCard} ${styles.statCardP2}`}>
            <h3 className={`${styles.statTitle} ${styles.statTitleP2}`}>Player 2</h3>
            <div className={styles.statScore}>{player2.score}</div>
            <div className={styles.statDetail}>{player2.questionsCorrect} correct</div>
            <div className={styles.statSubDetail}>{player2.difficulty}</div>
          </div>
        </div>

        <div className={styles.resultActions}>
          <button 
            onClick={handleStart}
            className={styles.buttonRematch}
          >
            Rematch
          </button>
          <button 
            onClick={() => setSetup()}
            className={styles.buttonSettings}
          >
            Change Settings
          </button>
          <button 
            onClick={() => router.push('/')}
            className={styles.buttonHome}
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
        <div className={styles.timerContainer}>
          <span className={styles.timerText}>{timeLeft}</span>
          <div className={styles.timerBarWrapper}>
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
        />
      }
    />
  );
}
