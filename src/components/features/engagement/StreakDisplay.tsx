"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flame, Trophy, Sparkles } from "lucide-react";
import styles from "./StreakDisplay.module.css";

interface StreakData {
  current: number;
  best: number;
  lastActiveDate: string; // YYYY-MM-DD
}

interface StreakDisplayProps {
  streak?: StreakData | null;
  compact?: boolean;
}

// Milestone thresholds for celebrations
const MILESTONES = [3, 7, 14, 21, 30, 50, 100];

function getMilestoneInfo(current: number): { isMilestone: boolean; nextMilestone: number } {
  const isMilestone = MILESTONES.includes(current);
  const nextMilestone = MILESTONES.find((m) => m > current) || current + 1;
  return { isMilestone, nextMilestone };
}

function getStreakMessage(current: number, isNewRecord: boolean): string {
  if (current === 0) return "Start your streak today!";
  if (isNewRecord && current > 1) return "New record! 🎉";
  if (current === 1) return "Day 1 – Great start!";
  if (current === 2) return "2 days going!";
  if (current === 3) return "Hat trick! 🔥";
  if (current === 7) return "Week warrior! 📅";
  if (current === 14) return "Two weeks strong! 💪";
  if (current === 30) return "Monthly master! 🏆";
  if (current >= 50) return "Unstoppable! 🚀";
  return `${current} day streak!`;
}

function getStreakEmoji(current: number): string {
  if (current === 0) return "💫";
  if (current < 3) return "🔥";
  if (current < 7) return "🔥";
  if (current < 14) return "⚡";
  if (current < 30) return "💪";
  return "🏆";
}

export function StreakDisplay({ streak, compact = false }: StreakDisplayProps) {
  const current = streak?.current ?? 0;
  const best = streak?.best ?? 0;
  const isNewRecord = current > 0 && current === best && current > 1;
  const { isMilestone, nextMilestone } = getMilestoneInfo(current);

  // Generate the week dots (last 7 days visual)
  const weekDots = useMemo(() => {
    // We'll show 7 dots representing a week's worth of practice
    // Filled dots = days in current streak (up to 7)
    const filledCount = Math.min(current, 7);
    return Array.from({ length: 7 }, (_, i) => ({
      filled: i < filledCount,
      index: i,
    }));
  }, [current]);

  if (compact) {
    return (
      <div className={styles.compactContainer}>
        <span className={styles.compactIcon}>{getStreakEmoji(current)}</span>
        <span className={styles.compactCount}>{current}</span>
      </div>
    );
  }

  return (
    <motion.div
      className={`${styles.container} ${isMilestone ? styles.milestone : ""} ${isNewRecord ? styles.record : ""}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <AnimatePresence mode="wait">
            {current > 0 ? (
              <motion.div
                key="flame"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className={`${styles.icon} ${current >= 7 ? styles.iconLarge : ""}`}
              >
                {isNewRecord ? (
                  <Trophy size={current >= 7 ? 28 : 24} />
                ) : (
                  <Flame size={current >= 7 ? 28 : 24} />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="sparkle"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className={styles.icon}
              >
                <Sparkles size={24} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={styles.textContent}>
          <motion.span
            key={current}
            className={styles.message}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {getStreakMessage(current, isNewRecord)}
          </motion.span>

          {current > 0 && best > 0 && !isNewRecord && (
            <span className={styles.bestStreak}>Best: {best} days</span>
          )}
        </div>
      </div>

      {/* Week dots visualization */}
      <div className={styles.weekDots}>
        {weekDots.map((dot, i) => (
          <motion.div
            key={i}
            className={`${styles.dot} ${dot.filled ? styles.dotFilled : styles.dotEmpty}`}
            initial={dot.filled ? { scale: 0 } : false}
            animate={dot.filled ? { scale: 1 } : {}}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 500, damping: 25 }}
          />
        ))}
      </div>

      {/* Progress to next milestone */}
      {current > 0 && current < 30 && (
        <div className={styles.progressHint}>
          <span className={styles.progressText}>
            {nextMilestone - current} more day{nextMilestone - current !== 1 ? "s" : ""} to {nextMilestone}!
          </span>
        </div>
      )}
    </motion.div>
  );
}
