"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useGameStore } from "@/lib/stores/useGameStore";
import { useProfileStore } from "@/lib/stores/useProfileStore";
import { generateQuestion, clearQuestionHistory, clearMultiplierTracking } from "@/lib/game-engine/question-generator";
import { saveGameSession } from "@/lib/game-engine/session-manager";
import { MasteryTracker } from "@/lib/game-engine/mastery-tracker";
import { EngagementManager } from "@/lib/game-engine/engagement-manager";
import { getStoppingCueData, StoppingCue } from "@/lib/game-engine/stopping-cues";
import { db, MasteryRecord, Achievement, WeeklyGoal } from "@/lib/db";
import { GameCanvas } from "@/components/game/GameCanvas";
import { TimerBar } from "@/components/game/TimerBar";
import { QuestionDisplay } from "@/components/game/QuestionDisplay";
import { Numpad } from "@/components/game/Numpad";
import { MultipleChoiceInput } from "@/components/game/MultipleChoiceInput";
import { VoskSpeechInput } from "@/components/game/VoskSpeechInput";
import { ResultScreen } from "@/components/game/ResultScreen";
import { GameSetup } from "@/components/game/setup/GameSetup";
import { PauseModal } from "@/components/game/PauseModal";
import { AuthGuard } from "@/components/features/auth";
import { ProfileChip } from "@/components/features/profiles/ProfileChip";
import { AnimatePresence } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGameSound } from "@/lib/hooks/useGameSound";
import { useBackgroundTheme } from "@/lib/hooks/useBackgroundTheme";
import { useFocusLoss } from "@/lib/hooks/useFocusLoss";
import styles from './page.module.css';

// Background themes for visual variety
const BACKGROUND_THEMES = [
  styles.themeBluePlus,
  styles.themeCoralMinus,
  styles.themeGoldMultiply,
  styles.themeTealDivide,
] as const;

function PlayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Select a background theme that's different from the last 3 visits
  const backgroundTheme = useBackgroundTheme(BACKGROUND_THEMES);

  const hasSavedRef = useRef(false);
  const quickPlayTriggeredRef = useRef(false);
  const { activeProfile } = useProfileStore();
  const activeProfileId = activeProfile?.id || null;
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const weakFactsRef = useRef<MasteryRecord[]>([]);
  const questionStartTimeRef = useRef<number>(Date.now());
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [weeklyGoalData, setWeeklyGoalData] = useState<{ goal: WeeklyGoal; justCompleted: boolean } | null>(null);
  const [stoppingCueData, setStoppingCueData] = useState<{ cue: StoppingCue; sessionsToday: number } | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isHighScore, setIsHighScore] = useState(false);
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
    pauseCount,
    pauseStartedAt,
    startGame, 
    tick, 
    setQuestion, 
    setInput,
    appendInput, 
    clearInput, 
    submitAnswer,
    endGame,
    pauseGame,
    resumeGame,
  } = useGameStore();

  // Pause state for modal visibility (separate from game paused state)
  const [showPauseModal, setShowPauseModal] = useState(false);

  // Handle focus loss - pause the game when tab/window loses focus
  const handleFocusLost = useCallback(() => {
    if (status === 'playing') {
      pauseGame();
    }
  }, [status, pauseGame]);

  const handleFocusRegained = useCallback(() => {
    // Show the pause modal when focus is regained (user is back)
    // Only show if game was paused (not if it ended or is idle)
    if (status === 'paused') {
      setShowPauseModal(true);
    }
  }, [status]);

  // Use focus loss detection
  useFocusLoss({
    onFocusLost: handleFocusLost,
    onFocusRegained: handleFocusRegained,
    enabled: status === 'playing' || status === 'paused',
  });

  // Handle resume from pause modal
  const handleResume = useCallback(() => {
    setShowPauseModal(false);
    resumeGame();
  }, [resumeGame]);

  // Handle end session from pause modal
  const handleEndFromPause = useCallback(() => {
    setShowPauseModal(false);
    resumeGame(); // Resume first to calculate pause duration
    endGame();
  }, [resumeGame, endGame]);

  // Quick Play: Auto-start game when ?quick=true is in URL
  useEffect(() => {
    const isQuickPlay = searchParams.get('quick') === 'true';
    
    if (isQuickPlay && status === 'idle' && !quickPlayTriggeredRef.current) {
      // Mark as triggered to prevent re-triggering
      quickPlayTriggeredRef.current = true;
      
      // Config should already be set by QuickPlay component
      // Clear the URL param and start the game
      window.history.replaceState({}, '', '/play');
      startGame();
    }
  }, [searchParams, status, startGame]);

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
      
      // Clear question history and multiplier tracking for fresh session
      clearQuestionHistory();
      clearMultiplierTracking();
      
      hasSavedRef.current = false;
      sessionIdRef.current = crypto.randomUUID();
      setUnlockedAchievements([]);
      
      // Determine if we're using special topics, number range (for add/sub), or selected numbers (mult/div)
      const usesSpecialTopics = config.selectedTopics && config.selectedTopics.length > 0;
      const usesNumberRange = !usesSpecialTopics && (config.operations[0] === 'addition' || config.operations[0] === 'subtraction');
      
      // Load weak facts if we have a profile
      if (activeProfileId) {
        MasteryTracker.getWeakFacts(activeProfileId).then(facts => {
          weakFactsRef.current = facts;
          // Generate first question AFTER loading weak facts to potentially use one
          setQuestion(generateQuestion({
            difficulty: config.difficulty,
            weakFacts: facts,
            allowedOperations: usesSpecialTopics ? [] : config.operations,
            selectedNumbers: usesNumberRange || usesSpecialTopics ? [] : config.selectedNumbers,
            numberRange: usesNumberRange ? config.numberRange : undefined,
            selectedTopics: usesSpecialTopics ? config.selectedTopics : undefined
          }));
        });
      } else {
        setQuestion(generateQuestion({
          difficulty: config.difficulty,
          weakFacts: [],
          allowedOperations: usesSpecialTopics ? [] : config.operations,
          selectedNumbers: usesNumberRange || usesSpecialTopics ? [] : config.selectedNumbers,
          numberRange: usesNumberRange ? config.numberRange : undefined,
          selectedTopics: usesSpecialTopics ? config.selectedTopics : undefined
        }));
      }

      questionStartTimeRef.current = Date.now();
    }
  }, [status, activeProfileId, config, setQuestion, questionsAnswered]);

  // Save Session on Finish
  useEffect(() => {
    if (status === 'finished' && !hasSavedRef.current) {
      // Check for high score
      const checkHighScore = async () => {
        if (activeProfileId) {
           const previousBest = await db.sessions
            .where('profileId').equals(activeProfileId)
            .filter(s => s.mode === config.mode)
            .reverse()
            .sortBy('score');
           
           if (previousBest.length === 0 || score > previousBest[0].score) {
             setIsHighScore(true);
           }
        }
      };
      checkHighScore();

      play('GAME_OVER');
      hasSavedRef.current = true;
      saveGameSession({
        sessionId: sessionIdRef.current,
        profileId: activeProfileId || 'guest',
        score,
        questionsAnswered,
        questionsCorrect,
        mode: config.mode,
        durationSeconds: config.mode === 'timed' ? config.duration - timeLeft : 0,
        config: {
          operations: config.operations,
          inputMethod: config.inputMode,
          difficulty: config.difficulty,
          selectedNumbers: config.selectedNumbers
        }
      }).then(({ newAchievements, weeklyGoalJustCompleted }) => {
        if (newAchievements.length > 0) {
          setUnlockedAchievements(newAchievements);
          play('WIN'); // Play win sound if achievements unlocked
        }
        // Fetch the updated weekly goal to display on result screen
        if (activeProfileId && activeProfileId !== 'guest') {
          import('@/lib/game-engine/weekly-goal-tracker').then(({ WeeklyGoalTracker }) => {
            WeeklyGoalTracker.getWeeklyGoal(activeProfileId).then(goal => {
              setWeeklyGoalData({ goal, justCompleted: weeklyGoalJustCompleted });
              if (weeklyGoalJustCompleted) {
                play('WIN'); // Play celebration sound for goal completion
              }
            }).catch(console.error);
          });
          
          // Fetch stopping cue data (not a Daily Dash session in regular play)
          getStoppingCueData(activeProfileId, false).then(data => {
            setStoppingCueData({ cue: data.cue, sessionsToday: data.sessionsToday });
          }).catch(console.error);
        }
      }).catch(console.error);
    }
  }, [status, score, questionsAnswered, questionsCorrect, activeProfileId, timeLeft, play, config]);

  // Handle Answer Submission
  const handleSubmit = () => {
    const timeTaken = Date.now() - questionStartTimeRef.current;
    const givenAnswer = parseInt(input, 10); // Capture the answer before submit clears it
    const isCorrect = submitAnswer();
    
    // Record attempt with the actual answer given
    if (currentQuestion && activeProfileId) {
      MasteryTracker.recordAttempt(
        activeProfileId,
        sessionIdRef.current,
        currentQuestion,
        isCorrect,
        timeTaken,
        isNaN(givenAnswer) ? undefined : givenAnswer
      ).catch(console.error);
    }

    // Shorter feedback delay for voice mode (speed matters!)
    const feedbackDelay = config.inputMode === 'voice' ? 200 : 500;
    
    // Determine if we're using special topics, number range (for add/sub), or selected numbers (mult/div)
    const usesSpecialTopics = config.selectedTopics && config.selectedTopics.length > 0;
    const usesNumberRange = !usesSpecialTopics && (config.operations[0] === 'addition' || config.operations[0] === 'subtraction');

    if (isCorrect) {
      setFeedback('correct');
      play('CORRECT');
      
      // Delay next question to show feedback
      setTimeout(() => {
        setFeedback(null);
        setSelectedAnswer(null);
        // Generate next question
        setQuestion(generateQuestion({
          difficulty: config.difficulty,
          weakFacts: weakFactsRef.current,
          allowedOperations: usesSpecialTopics ? [] : config.operations,
          selectedNumbers: usesNumberRange || usesSpecialTopics ? [] : config.selectedNumbers,
          numberRange: usesNumberRange ? config.numberRange : undefined,
          selectedTopics: usesSpecialTopics ? config.selectedTopics : undefined
        }));
        questionStartTimeRef.current = Date.now();
      }, feedbackDelay);
    } else {
      setFeedback('incorrect');
      play('WRONG');
      vibrate([50, 50, 50]);
      
      setTimeout(() => {
        setFeedback(null);
        setSelectedAnswer(null);
        clearInput();
      }, feedbackDelay);
    }
  };

  const handleDirectAnswer = (answer: number) => {
    setInput(answer.toString());
    setSelectedAnswer(answer);
    // Use setTimeout to ensure state update propagates if needed, though Zustand is sync.
    // But mainly to allow any UI updates if we were showing the number.
    // Here we just submit immediately.
    setTimeout(() => handleSubmit(), 0);
  };

  // Keyboard Support
  useEffect(() => {
    if (status !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only enable keyboard for numpad mode or if we want to support it generally
      // But for multiple choice, maybe 1-5?
      // For now, keep it simple.
      if (config.inputMode !== 'numpad') return;

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
  }, [status, appendInput, clearInput, handleSubmit, play, vibrate, config.inputMode]);

  let content;

  if (status === 'idle') {
    content = <GameSetup onStart={() => {}} />;
  } else if (status === 'finished') {
    content = (
      <ResultScreen 
        score={score}
        correct={questionsCorrect}
        total={questionsAnswered}
        achievements={unlockedAchievements}
        isHighScore={isHighScore}
        weeklyGoal={weeklyGoalData?.goal}
        weeklyGoalJustCompleted={weeklyGoalData?.justCompleted}
        stoppingCue={stoppingCueData?.cue}
        sessionsToday={stoppingCueData?.sessionsToday}
        onPlayAgain={() => {
          hasSavedRef.current = false;
          setIsHighScore(false);
          setWeeklyGoalData(null);
          setStoppingCueData(null);
          sessionIdRef.current = crypto.randomUUID();
          questionStartTimeRef.current = Date.now();
          setUnlockedAchievements([]);
          
          if (activeProfileId) {
            MasteryTracker.getWeakFacts(activeProfileId).then(facts => {
              weakFactsRef.current = facts;
            });
          }
          
          startGame();
        }}
        onNewGame={() => {
          hasSavedRef.current = false;
          setIsHighScore(false);
          setUnlockedAchievements([]);
          setWeeklyGoalData(null);
          setStoppingCueData(null);
          // Clear URL params when starting new game
          window.history.replaceState({}, '', '/play');
          // Reset to idle status to show GameSetup
          useGameStore.setState({ status: 'idle' });
        }}
        onHome={() => {
          // Clear URL params when going home
          window.history.replaceState({}, '', '/play');
          router.push('/dashboard');
        }}
      />
    );
  } else {
    content = (
      <GameCanvas>
        <div className={styles.header} role="status" aria-label="Game Status">
          <div className={styles.leftStats}>
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
          <ProfileChip size="sm" showSwitcher={false} />
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
          
          {config.inputMode === 'numpad' && (
            <div className={styles.inputDisplay} aria-label={`Current input: ${input || "empty"}`}>
              {input || "_"}
            </div>
          )}
        </div>

        {/* Input Methods */}
        {config.inputMode === 'choice' ? (
          <MultipleChoiceInput 
            correctAnswer={currentQuestion?.answer || 0}
            onAnswer={handleDirectAnswer}
            disabled={status !== 'playing' || feedback !== null}
            selectedAnswer={selectedAnswer}
            feedback={feedback}
          />
        ) : config.inputMode === 'voice' ? (
          <VoskSpeechInput
            onAnswer={handleDirectAnswer}
            disabled={status !== 'playing' || feedback !== null}
            expectedAnswer={currentQuestion?.answer}
            showHint={true}
            feedback={feedback}
          />
        ) : (
          <Numpad 
            onPress={appendInput} 
            onClear={clearInput} 
            onSubmit={handleSubmit}
            disabled={status !== 'playing'}
          />
        )}
      </GameCanvas>
    );
  }

  return (
    <div className={`${styles.pageWrapper} ${backgroundTheme}`}>
      {content}
      <PauseModal
        isOpen={showPauseModal}
        onResume={handleResume}
        onEndSession={handleEndFromPause}
        pauseStartedAt={pauseStartedAt}
        pauseCount={pauseCount}
      />
    </div>
  );
}

export default function PlayPage() {
  return (
    <AuthGuard>
      <PlayContent />
    </AuthGuard>
  );
}