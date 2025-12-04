import { motion } from "motion/react";
import { HistoryList } from "./HistoryList";
import styles from './ResultScreen.module.css';
import { Achievement, WeeklyGoal } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProfileChip } from "@/components/features/profiles/ProfileChip";
import { WeeklyGoalDisplay } from "@/components/features/engagement";
import { RotateCcw, Settings, LayoutDashboard, Coffee, Sparkles } from "lucide-react";
import { StoppingCue } from "@/lib/game-engine/stopping-cues";

interface ResultScreenProps {
  score: number;
  correct: number;
  total: number;
  achievements?: Achievement[];
  isHighScore?: boolean;
  weeklyGoal?: WeeklyGoal;
  weeklyGoalJustCompleted?: boolean;
  // Stopping cues (healthy habit loop)
  stoppingCue?: StoppingCue;
  isDailyDash?: boolean;
  sessionsToday?: number;
  onPlayAgain: () => void;
  onNewGame: () => void;
  onHome: () => void;
}

export function ResultScreen({ 
  score, 
  correct, 
  total, 
  achievements, 
  isHighScore, 
  weeklyGoal,
  weeklyGoalJustCompleted,
  stoppingCue,
  isDailyDash,
  sessionsToday = 1,
  onPlayAgain, 
  onNewGame, 
  onHome 
}: ResultScreenProps) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  // Default stopping cue if none provided
  const cue = stoppingCue || {
    headline: "Time's Up!",
    subtext: "Here's how you did in the last 60 seconds.",
    playAgainLabel: "Play Again",
    showBreakBadge: false,
  };

  return (
    <div className={styles.screen}>
      <div className={styles.topBar}>
        <ProfileChip size="md" showDashboardLink />
      </div>
      {isHighScore && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={styles.mascotContainer}
        >
          <motion.img 
            src="/mascots/dashy-sprint.png" 
            alt="Dashy Mascot" 
            className={styles.mascot}
            animate={{ y: [0, -30, 0] }}
            transition={{ 
              y: { repeat: Infinity, duration: 0.6, ease: "easeInOut" }
            }}
          />
          <div className={styles.highScoreLabel}>New High Score!</div>
        </motion.div>
      )}
      <Card className={styles.card} elevated>
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.24 }}
        >
          {/* Stopping Cue Header - Healthy Habit Loop */}
          <div className={styles.header}>
            <span className={styles.eyebrow}>Session complete</span>
            <h1 className={styles.title}>{cue.headline}</h1>
            <p className={styles.subtitle}>{cue.subtext}</p>
          </div>

          {/* Break Earned Badge */}
          {cue.showBreakBadge && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className={styles.breakBadge}
            >
              <Coffee size={18} />
              <span>Break Earned!</span>
            </motion.div>
          )}

          {/* Daily Dash Complete indicator */}
          {isDailyDash && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className={styles.dailyDashBadge}
            >
              <Sparkles size={18} />
              <span>Daily Dash Complete</span>
            </motion.div>
          )}

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
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.3 }}
              className={styles.achievementsContainer}
            >
              <h3 className={styles.achievementsTitle}>Achievements unlocked</h3>
              <div className={styles.achievementsList}>
                {achievements.map(a => (
                  <div key={a.id} className={styles.achievementItem}>
                    <span className={styles.achievementIcon} role="img" aria-label={a.title}>{a.icon}</span>
                    <span className={styles.achievementTitle}>{a.title}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Weekly Goal Progress */}
          {weeklyGoal && (
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.3 }}
              className={styles.weeklyGoalContainer}
            >
              <h3 className={styles.weeklyGoalTitle}>
                {weeklyGoalJustCompleted ? '🎉 Weekly Goal Achieved!' : 'Weekly Goal Progress'}
              </h3>
              <WeeklyGoalDisplay weeklyGoal={weeklyGoal} />
            </motion.div>
          )}

          {/* Actions - Dashboard is primary, Play Again is secondary */}
          <div className={styles.actions}>
            <Button onClick={onHome} size="lg">
              <LayoutDashboard size={18} />
              My Dashboard
            </Button>
            <Button variant="secondary" onClick={onPlayAgain} size="lg">
              <RotateCcw size={18} />
              {cue.playAgainLabel}
            </Button>
            <Button variant="ghost" onClick={onNewGame} size="lg">
              <Settings size={18} />
              New Game
            </Button>
          </div>

          {/* Footer text - stopping cue */}
          {cue.footerText && (
            <motion.p 
              className={styles.footerText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              {cue.footerText}
            </motion.p>
          )}
        </motion.div>
      </Card>

      <HistoryList />
    </div>
  );
}
