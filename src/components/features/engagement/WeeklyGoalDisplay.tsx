"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Target, Sparkles, Star, Check } from "lucide-react";
import { WeeklyGoal } from "@/lib/db";
import styles from "./WeeklyGoalDisplay.module.css";

interface WeeklyGoalDisplayProps {
  weeklyGoal?: WeeklyGoal | null;
  compact?: boolean;
  onGoalComplete?: () => void;
}

function getGoalMessage(current: number, target: number, isComplete: boolean): string {
  if (isComplete) return "Goal achieved! 🎉";
  if (current === 0) return `Practice ${target} days this week!`;
  
  const remaining = target - current;
  if (remaining === 1) return "1 more day to hit your goal!";
  if (remaining > 0) return `${remaining} more days to hit your goal!`;
  
  return "Goal achieved! 🎉";
}

function getDayLabel(index: number): string {
  const labels = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"];
  return labels[index] || `Day ${index + 1}`;
}

export function WeeklyGoalDisplay({ 
  weeklyGoal, 
  compact = false,
  onGoalComplete 
}: WeeklyGoalDisplayProps) {
  const target = weeklyGoal?.targetDays ?? 3;
  const current = weeklyGoal?.currentDays ?? 0;
  const isComplete = current >= target;
  const [hasTriggeredCelebration, setHasTriggeredCelebration] = useState(false);

  // Trigger celebration callback when goal is first completed
  useEffect(() => {
    if (isComplete && !hasTriggeredCelebration && onGoalComplete) {
      setHasTriggeredCelebration(true);
      onGoalComplete();
    }
  }, [isComplete, hasTriggeredCelebration, onGoalComplete]);

  // Reset celebration trigger when week resets
  useEffect(() => {
    if (!isComplete) {
      setHasTriggeredCelebration(false);
    }
  }, [weeklyGoal?.weekStart, isComplete]);

  // Generate orbs for goal visualization
  const orbs = useMemo(() => {
    return Array.from({ length: target }, (_, i) => ({
      filled: i < current,
      index: i,
      isLatest: i === current - 1, // Most recently earned
    }));
  }, [target, current]);

  if (compact) {
    return (
      <div className={`${styles.compactContainer} ${isComplete ? styles.compactComplete : ""}`}>
        <span className={styles.compactIcon}>
          {isComplete ? "🏆" : "🎯"}
        </span>
        <span className={styles.compactCount}>
          {current}/{target}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      className={`${styles.container} ${isComplete ? styles.complete : ""}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className={styles.header}>
        <div className={`${styles.iconWrapper} ${isComplete ? styles.iconComplete : ""}`}>
          <AnimatePresence mode="wait">
            {isComplete ? (
              <motion.div
                key="star"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={styles.icon}
              >
                <Star size={24} />
              </motion.div>
            ) : (
              <motion.div
                key="target"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className={styles.icon}
              >
                <Target size={24} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={styles.textContent}>
          <span className={styles.title}>Weekly Goal</span>
          <motion.span
            key={`${current}-${target}`}
            className={styles.message}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {getGoalMessage(current, target, isComplete)}
          </motion.span>
        </div>
      </div>

      {/* Goal orbs visualization */}
      <div className={styles.orbsContainer}>
        {orbs.map((orb, i) => (
          <div key={i} className={styles.orbWrapper}>
            <motion.div
              className={`${styles.orb} ${orb.filled ? styles.orbFilled : styles.orbEmpty} ${orb.isLatest ? styles.orbLatest : ""}`}
              initial={orb.filled ? { scale: 0 } : false}
              animate={orb.filled ? { scale: 1 } : {}}
              transition={{ 
                delay: i * 0.1, 
                type: "spring", 
                stiffness: 500, 
                damping: 25 
              }}
            >
              {orb.filled && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 + 0.15 }}
                >
                  <Check size={16} strokeWidth={3} />
                </motion.div>
              )}
            </motion.div>
            <span className={styles.orbLabel}>{getDayLabel(i)}</span>
          </div>
        ))}
      </div>

      {/* Celebration sparkles when complete */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            className={styles.sparkles}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Sparkles size={16} className={styles.sparkle1} />
            <Sparkles size={14} className={styles.sparkle2} />
            <Sparkles size={12} className={styles.sparkle3} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
