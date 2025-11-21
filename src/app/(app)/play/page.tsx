"use client";

import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/lib/stores/useGameStore";
import { useUserStore } from "@/lib/stores/useUserStore";
import { generateQuestion } from "@/lib/game-engine/question-generator";
import { saveGameSession } from "@/lib/game-engine/session-manager";
import { MasteryTracker } from "@/lib/game-engine/mastery-tracker";
import { EngagementManager } from "@/lib/game-engine/engagement-manager";
import { MasteryRecord, Achievement } from "@/lib/db";
import { GameCanvas } from "@/components/game/GameCanvas";
import { TimerBar } from "@/components/game/TimerBar";
import { QuestionDisplay } from "@/components/game/QuestionDisplay";
import { Numpad } from "@/components/game/Numpad";
import { ResultScreen } from "@/components/game/ResultScreen";
import { GameSetup } from "@/components/game/setup/GameSetup";
import { AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { useGameSound } from "@/lib/hooks/useGameSound";
import styles from './page.module.css';

export default function PlayPage() {
  const router = useRouter();

  const hasSavedRef = useRef(false);
  const { activeProfileId } = useUserStore();
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const weakFactsRef = useRef<MasteryRecord[]>([]);
  const questionStartTimeRef = useRef<number>(Date.now());
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const { play, vibrate } = useGameSound();

  const { 
    status, 
    config,
    timeLeft, 
    score, 
    currentQuestion, 
    input,
    questionsAnswered,
    questionsCorrect,
    startGame, 
    tick, 
    setQuestion, 
    appendInput, 
    clearInput, 
    submitAnswer,
    endGame
  } = useGameStore();

  // Game Loop & Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (status === 'playing') {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [status, tick]);

  // Check for Sprint Mode End Condition
  useEffect(() => {
    if (status === 'playing' && config.mode === 'sprint') {
      if (questionsCorrect >= config.questionCount) {
        endGame();
      }
    }
  }, [status, config.mode, config.questionCount, questionsCorrect, endGame]);

  // Low time warning
  useEffect(() => {
    if (status === 'playing' && config.mode === 'timed' && timeLeft <= 5 && timeLeft > 0) {
      play('TICK');
    }
  }, [timeLeft, status, play, config.mode]);

  // Initialize Game Session when status changes to playing
  useEffect(() => {
    if (status === 'playing' && questionsAnswered === 0) {
      // Initialize Engagement Manager (seed achievements)
      EngagementManager.initialize();
      
      hasSavedRef.current = false;
      sessionIdRef.current = crypto.randomUUID();
      setUnlockedAchievements([]);
      
      // Load weak facts if we have a profile
      if (activeProfileId) {
        MasteryTracker.getWeakFacts(activeProfileId).then(facts => {
          weakFactsRef.current = facts;
          // Generate first question AFTER loading weak facts to potentially use one
          setQuestion(generateQuestion(config.difficulty, facts, config.operations, config.selectedNumbers));
        });
      } else {
        setQuestion(generateQuestion(config.difficulty, [], config.operations, config.selectedNumbers));
      }

      questionStartTimeRef.current = Date.now();
    }
  }, [status, activeProfileId, config, setQuestion, questionsAnswered]);

  // Save Session on Finish
  useEffect(() => {
    if (status === 'finished' && !hasSavedRef.current) {
      play('GAME_OVER');
      hasSavedRef.current = true;
      saveGameSession({
        sessionId: sessionIdRef.current,
        profileId: activeProfileId || 'guest',
        score,
        questionsAnswered,
        questionsCorrect,
        mode: config.mode,
        durationSeconds: config.mode === 'timed' ? config.duration - timeLeft : 0 // Approximate
      }).then(({ newAchievements }) => {
        if (newAchievements.length > 0) {
          setUnlockedAchievements(newAchievements);
          play('WIN'); // Play win sound if achievements unlocked
        }
      }).catch(console.error);
    }
  }, [status, score, questionsAnswered, questionsCorrect, activeProfileId, timeLeft, play, config]);

  // Handle Answer Submission
  const handleSubmit = () => {
    const timeTaken = Date.now() - questionStartTimeRef.current;
    const isCorrect = submitAnswer();
    
    // Record attempt
    if (currentQuestion && activeProfileId) {
      MasteryTracker.recordAttempt(
        activeProfileId,
        sessionIdRef.current,
        currentQuestion,
        isCorrect,
        timeTaken
      ).catch(console.error);
    }

    if (isCorrect) {
      play('CORRECT');
      // Generate next question
      setQuestion(generateQuestion(config.difficulty, weakFactsRef.current, config.operations, config.selectedNumbers));
      questionStartTimeRef.current = Date.now();
    } else {
      play('WRONG');
      vibrate([50, 50, 50]);
      // Shake effect or error feedback could go here
      clearInput();
    }
  };

  // Keyboard Support
  useEffect(() => {
    if (status !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        play('CLICK');
        vibrate(10);
        appendInput(e.key);
      } else if (e.key === 'Enter') {
        play('CLICK');
        vibrate(10);
        handleSubmit();
      } else if (e.key === 'Backspace' || e.key === 'Escape') {
        play('CLICK');
        vibrate(10);
        clearInput();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, appendInput, clearInput, handleSubmit, play, vibrate]);

  if (status === 'idle') {
    return <GameSetup onStart={() => {}} />;
  }

  if (status === 'finished') {
    return (
      <ResultScreen 
        score={score}
        correct={questionsCorrect}
        total={questionsAnswered}
        achievements={unlockedAchievements}
        onPlayAgain={() => {
          hasSavedRef.current = false;
          sessionIdRef.current = crypto.randomUUID();
          questionStartTimeRef.current = Date.now();
          setUnlockedAchievements([]);
          
          if (activeProfileId) {
            MasteryTracker.getWeakFacts(activeProfileId).then(facts => {
              weakFactsRef.current = facts;
            });
          }
          
          startGame();
          // Question generation happens in the useEffect when status becomes playing
        }}
        onHome={() => router.push('/')}
      />
    );
  }

  return (
    <GameCanvas>
      <div className={styles.header} role="status" aria-label="Game Status">
        <div className={styles.score} aria-label={`Score: ${score}`}>Score: {score}</div>
        {config.mode === 'timed' && (
          <div className={styles.timer} role="timer" aria-label={`${timeLeft} seconds remaining`}>{timeLeft}s</div>
        )}
        {config.mode === 'sprint' && (
          <div className={styles.timer} role="timer" aria-label="Questions remaining">
            {questionsCorrect} / {config.questionCount}
          </div>
        )}
      </div>
      
      {config.mode === 'timed' && (
        <TimerBar timeLeft={timeLeft} totalTime={config.duration} />
      )}
      {config.mode === 'sprint' && (
        <TimerBar timeLeft={questionsCorrect} totalTime={config.questionCount} />
      )}
      
      <div className={styles.gameArea} aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <QuestionDisplay text={currentQuestion.text} />
          )}
        </AnimatePresence>
        
        <div className={styles.inputDisplay} aria-label={`Current input: ${input || "empty"}`}>
          {input || "_"}
        </div>
      </div>

      <Numpad 
        onPress={appendInput} 
        onClear={clearInput} 
        onSubmit={handleSubmit}
        disabled={status !== 'playing'}
      />
    </GameCanvas>
  );
}

