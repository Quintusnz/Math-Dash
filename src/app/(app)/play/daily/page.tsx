"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/stores/useGameStore";
import { useProfileStore } from "@/lib/stores/useProfileStore";
import { useLiveQuery } from "dexie-react-hooks";
import { generateQuestion, clearQuestionHistory, clearMultiplierTracking } from "@/lib/game-engine/question-generator";
import { saveGameSession } from "@/lib/game-engine/session-manager";
import { MasteryTracker } from "@/lib/game-engine/mastery-tracker";
import { EngagementManager } from "@/lib/game-engine/engagement-manager";
import { DailyDashTracker } from "@/lib/game-engine/daily-dash-tracker";
import { getTodayDate } from "@/lib/game-engine/weekly-goal-tracker";
import { getStoppingCueData, StoppingCue } from "@/lib/game-engine/stopping-cues";
import { db, DailyDash, MasteryRecord, Achievement, WeeklyGoal } from "@/lib/db";
import { GameCanvas } from "@/components/game/GameCanvas";
import { TimerBar } from "@/components/game/TimerBar";
import { QuestionDisplay } from "@/components/game/QuestionDisplay";
import { Numpad } from "@/components/game/Numpad";
import { MultipleChoiceInput } from "@/components/game/MultipleChoiceInput";
import { VoskSpeechInput } from "@/components/game/VoskSpeechInput";
import { ResultScreen } from "@/components/game/ResultScreen";
import { PauseModal } from "@/components/game/PauseModal";
import { AuthGuard } from "@/components/features/auth";
import { ProfileChip } from "@/components/features/profiles/ProfileChip";
import { AnimatePresence, motion } from "motion/react";
import { useGameSound } from "@/lib/hooks/useGameSound";
import { useBackgroundTheme } from "@/lib/hooks/useBackgroundTheme";
import { useFocusLoss } from "@/lib/hooks/useFocusLoss";
import { Zap, RefreshCw, ChevronLeft } from "lucide-react";
import Link from "next/link";
import styles from '../page.module.css';

// Background themes for visual variety
const BACKGROUND_THEMES = [
  styles.themeBluePlus,
  styles.themeCoralMinus,
  styles.themeGoldMultiply,
  styles.themeTealDivide,
] as const;

function DailyDashContent() {
  const router = useRouter();
  
  // Select a background theme that's different from the last 3 visits
  const backgroundTheme = useBackgroundTheme(BACKGROUND_THEMES);

  const hasSavedRef = useRef(false);
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
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [dailyDashState, setDailyDashState] = useState<DailyDash | null | undefined>(undefined);
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
    setConfig,
    pauseGame,
    resumeGame,
  } = useGameStore();

  // Pause state for modal visibility
  const [showPauseModal, setShowPauseModal] = useState(false);

  // Handle focus loss - pause the game when tab/window loses focus
  const handleFocusLost = useCallback(() => {
    if (status === 'playing') {
      pauseGame();
    }
  }, [status, pauseGame]);

  const handleFocusRegained = useCallback(() => {
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
    resumeGame();
    endGame();
  }, [resumeGame, endGame]);

  // READ-ONLY: Fetch today's Daily Dash from database
  const today = getTodayDate();
  const existingDailyDash = useLiveQuery(
    async () => {
      if (!activeProfileId) return null;
      // Only READ - no writes in useLiveQuery
      const existing = await db.dailyDash
        .where('[profileId+date]')
        .equals([activeProfileId, today])
        .first();
      return existing ?? null;
    },
    [activeProfileId, today]
  );

  // WRITE: Generate daily dash outside of useLiveQuery if none exists
  useEffect(() => {
    const generateDashIfNeeded = async () => {
      if (!activeProfileId) {
        setDailyDashState(null);
        return;
      }
      
      // If useLiveQuery is still loading, wait
      if (existingDailyDash === undefined) {
        return;
      }
      
      // If we already have one, use it
      if (existingDailyDash) {
        setDailyDashState(existingDailyDash);
        return;
      }
      
      // Generate a new one (write operation - outside useLiveQuery)
      try {
        const newDash = await DailyDashTracker.generateDailyDash(activeProfileId);
        setDailyDashState(newDash);
      } catch (e) {
        console.error('[DailyDash] Failed to generate:', e);
        setDailyDashState(null);
      }
    };
    
    generateDashIfNeeded();
  }, [activeProfileId, existingDailyDash]);

  // Combine: use existing from DB or generated state
  const dailyDash = existingDailyDash ?? dailyDashState;

  // Configure game when Daily Dash is loaded
  useEffect(() => {
    if (dailyDash && isConfiguring && status === 'idle') {
      // If already completed today, redirect to dashboard
      if (dailyDash.completed) {
        router.push('/dashboard');
        return;
      }

      // Configure the game with Daily Dash settings
      const dashConfig = DailyDashTracker.getDashConfig(dailyDash);
      
      setConfig({
        operations: dashConfig.operations,
        selectedNumbers: dashConfig.selectedNumbers,
        numberRange: dashConfig.numberRange,
        mode: 'timed', // Daily Dash uses timed mode
        duration: 60, // 60 second challenge
        inputMode: 'numpad', // Default to numpad
        difficulty: 'medium',
      });

      // Load weak facts for question generation
      if (activeProfileId) {
        MasteryTracker.getWeakFacts(activeProfileId).then(facts => {
          weakFactsRef.current = facts;
        });
      }

      setIsConfiguring(false);
    }
  }, [dailyDash, isConfiguring, status, activeProfileId, setConfig, router]);

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

  // Low time warning
  useEffect(() => {
    if (status === 'playing' && config.mode === 'timed' && timeLeft <= 5 && timeLeft > 0) {
      play('TICK');
    }
  }, [timeLeft, status, play, config.mode]);

  // Initialize Game Session when status changes to playing
  useEffect(() => {
    if (status === 'playing' && questionsAnswered === 0) {
      EngagementManager.initialize();
      
      // Clear question history and multiplier tracking for fresh session
      clearQuestionHistory();
      clearMultiplierTracking();
      
      hasSavedRef.current = false;
      sessionIdRef.current = crypto.randomUUID();
      setUnlockedAchievements([]);
      
      const usesNumberRange = config.operations[0] === 'addition' || config.operations[0] === 'subtraction';
      
      setQuestion(generateQuestion({
        difficulty: config.difficulty,
        weakFacts: weakFactsRef.current,
        allowedOperations: config.operations,
        selectedNumbers: usesNumberRange ? [] : config.selectedNumbers,
        numberRange: usesNumberRange ? config.numberRange : undefined
      }));

      questionStartTimeRef.current = Date.now();
    }
  }, [status, config, setQuestion, questionsAnswered]);

  // Save Session on Finish & Mark Daily Dash Complete
  useEffect(() => {
    if (status === 'finished' && !hasSavedRef.current) {
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
      }).then(async ({ newAchievements, weeklyGoalJustCompleted }) => {
        if (newAchievements.length > 0) {
          setUnlockedAchievements(newAchievements);
          play('WIN');
        }
        
        // Mark Daily Dash as completed
        if (activeProfileId && activeProfileId !== 'guest') {
          await DailyDashTracker.completeDailyDash(
            activeProfileId,
            sessionIdRef.current,
            score
          );
          
          // Fetch weekly goal data
          const { WeeklyGoalTracker } = await import('@/lib/game-engine/weekly-goal-tracker');
          const goal = await WeeklyGoalTracker.getWeeklyGoal(activeProfileId);
          setWeeklyGoalData({ goal, justCompleted: weeklyGoalJustCompleted });
          if (weeklyGoalJustCompleted) {
            play('WIN');
          }
          
          // Fetch stopping cue data (this IS a Daily Dash session)
          const stoppingData = await getStoppingCueData(activeProfileId, true);
          setStoppingCueData({ cue: stoppingData.cue, sessionsToday: stoppingData.sessionsToday });
        }
      }).catch(console.error);
    }
  }, [status, score, questionsAnswered, questionsCorrect, activeProfileId, timeLeft, play, config]);

  // Handle Answer Submission
  const handleSubmit = () => {
    const timeTaken = Date.now() - questionStartTimeRef.current;
    const givenAnswer = parseInt(input, 10);
    const isCorrect = submitAnswer();
    
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

    const feedbackDelay = config.inputMode === 'voice' ? 200 : 500;
    const usesNumberRange = config.operations[0] === 'addition' || config.operations[0] === 'subtraction';

    if (isCorrect) {
      setFeedback('correct');
      play('CORRECT');
      
      setTimeout(() => {
        setFeedback(null);
        setSelectedAnswer(null);
        setQuestion(generateQuestion({
          difficulty: config.difficulty,
          weakFacts: weakFactsRef.current,
          allowedOperations: config.operations,
          selectedNumbers: usesNumberRange ? [] : config.selectedNumbers,
          numberRange: usesNumberRange ? config.numberRange : undefined
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
    setTimeout(() => handleSubmit(), 0);
  };

  // Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== 'playing') return;
      
      if (e.key >= '0' && e.key <= '9') {
        appendInput(e.key);
      } else if (e.key === 'Backspace') {
        clearInput();
      } else if (e.key === 'Enter') {
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, appendInput, clearInput, input]);

  const handleStartDailyDash = () => {
    startGame();
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const displayInfo = dailyDash 
    ? DailyDashTracker.getDashDisplayInfo(dailyDash)
    : null;

  // Render loading state
  if (isConfiguring || !dailyDash) {
    return (
      <div className={`${styles.pageWrapper} ${backgroundTheme}`}>
        <div className={styles.loadingContainer}>
          <RefreshCw size={48} className={styles.spinner} />
          <p>Preparing your Daily Dash...</p>
        </div>
      </div>
    );
  }

  // Render result screen
  if (status === 'finished') {
    return (
      <div className={`${styles.pageWrapper} ${backgroundTheme}`}>
        <ResultScreen
          score={score}
          correct={questionsCorrect}
          total={questionsAnswered}
          achievements={unlockedAchievements}
          isHighScore={isHighScore}
          weeklyGoal={weeklyGoalData?.goal}
          weeklyGoalJustCompleted={weeklyGoalData?.justCompleted}
          stoppingCue={stoppingCueData?.cue}
          isDailyDash={true}
          sessionsToday={stoppingCueData?.sessionsToday}
          onPlayAgain={handleBackToDashboard}
          onNewGame={handleBackToDashboard}
          onHome={handleBackToDashboard}
        />
      </div>
    );
  }

  // Render pre-game screen
  if (status === 'idle') {
    return (
      <div className={`${styles.pageWrapper} ${backgroundTheme}`}>
        <div className={styles.dailyDashSetup}>
          <Link href="/dashboard" className={styles.backLink}>
            <ChevronLeft size={20} />
            <span>Back</span>
          </Link>
          
          <motion.div 
            className={styles.dailyDashCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.dailyDashIcon}>
              <Zap size={48} />
            </div>
            
            <h1 className={styles.dailyDashTitle}>Today&apos;s Dash</h1>
            
            {displayInfo && (
              <>
                <h2 className={styles.dailyDashTopic}>
                  {displayInfo.emoji} {displayInfo.title}
                </h2>
                
                <div className={styles.dailyDashDetails}>
                  {displayInfo.details.map((detail, idx) => (
                    <span key={idx} className={styles.dailyDashDetail}>
                      {detail}
                    </span>
                  ))}
                </div>
              </>
            )}
            
            <p className={styles.dailyDashDescription}>
              60-second challenge • Earn your daily practice streak!
            </p>
            
            <motion.button
              className={styles.startDailyDashButton}
              onClick={handleStartDailyDash}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Dash
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Render active game
  return (
    <div className={`${styles.pageWrapper} ${backgroundTheme}`}>
      <GameCanvas>
        <div className={styles.header} role="status" aria-label="Game Status">
          <div className={styles.leftStats}>
            <div className={styles.dailyDashBadge}>
              <Zap size={16} />
              <span>Daily Dash</span>
            </div>
            <div className={styles.score} aria-label={`Score: ${score}`}>Score: {score}</div>
            <div className={styles.timer} role="timer" aria-label={`${timeLeft} seconds remaining`}>{timeLeft}s</div>
          </div>
          <ProfileChip size="sm" showSwitcher={false} />
        </div>
        
        <TimerBar timeLeft={timeLeft} totalTime={config.duration} />
        
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

export default function DailyDashPage() {
  return (
    <AuthGuard>
      <DailyDashContent />
    </AuthGuard>
  );
}
