"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, CheckCircle, RefreshCw, ChevronRight, Sparkles } from "lucide-react";
import { DailyDash } from "@/lib/db";
import { DailyDashTracker } from "@/lib/game-engine/daily-dash-tracker";
import styles from "./DailyDashCard.module.css";

interface DailyDashCardProps {
  dailyDash?: DailyDash | null;
  loading?: boolean;
  onStart: () => void;
}

export function DailyDashCard({ 
  dailyDash, 
  loading = false,
  onStart 
}: DailyDashCardProps) {
  const isCompleted = dailyDash?.completed ?? false;
  
  // Get display info for the daily dash
  const displayInfo = dailyDash 
    ? DailyDashTracker.getDashDisplayInfo(dailyDash)
    : null;

  const handleStart = useCallback(() => {
    if (!isCompleted && !loading) {
      onStart();
    }
  }, [isCompleted, loading, onStart]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingIcon}>
            <RefreshCw size={24} className={styles.spinner} />
          </div>
          <span className={styles.loadingText}>Preparing your Daily Dash...</span>
        </div>
      </div>
    );
  }

  if (!dailyDash) {
    // Show error/empty state instead of nothing
    return (
      <div className={`${styles.container} ${styles.active}`}>
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.iconWrapper}>
              <div className={styles.icon}>
                <Zap size={28} />
              </div>
            </div>
            <div className={styles.titleArea}>
              <span className={styles.label}>Today&apos;s Dash</span>
              <h3 className={styles.title}>🎯 Ready to Practice!</h3>
            </div>
          </div>
          <p className={styles.subtitle}>
            Start your daily math challenge
          </p>
          <div className={styles.actionArea}>
            <motion.button
              className={styles.startButton}
              onClick={onStart}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Start Dash</span>
              <ChevronRight size={20} />
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`${styles.container} ${isCompleted ? styles.completed : styles.active}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Background gradient decoration */}
      <div className={styles.backgroundDecoration} />
      
      <div className={styles.content}>
        {/* Header row */}
        <div className={styles.header}>
          <div className={`${styles.iconWrapper} ${isCompleted ? styles.iconCompleted : ""}`}>
            <AnimatePresence mode="wait">
              {isCompleted ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={styles.icon}
                >
                  <CheckCircle size={28} />
                </motion.div>
              ) : (
                <motion.div
                  key="zap"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className={styles.icon}
                >
                  <Zap size={28} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={styles.titleArea}>
            <span className={styles.label}>Today&apos;s Dash</span>
            <h3 className={styles.title}>
              {displayInfo?.emoji} {displayInfo?.title}
            </h3>
          </div>
        </div>

        {/* Details */}
        {displayInfo && displayInfo.details.length > 0 && (
          <div className={styles.details}>
            {displayInfo.details.map((detail, idx) => (
              <span key={idx} className={styles.detailItem}>
                {detail}
              </span>
            ))}
          </div>
        )}

        {/* Subtitle / status */}
        <p className={styles.subtitle}>
          {displayInfo?.subtitle}
        </p>

        {/* Action area */}
        <div className={styles.actionArea}>
          {isCompleted ? (
            <div className={styles.completedMessage}>
              <Sparkles size={18} className={styles.sparkleIcon} />
              <span>Come back tomorrow!</span>
            </div>
          ) : (
            <motion.button
              className={styles.startButton}
              onClick={handleStart}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Start Dash</span>
              <ChevronRight size={20} />
            </motion.button>
          )}
        </div>
      </div>

      {/* Celebration sparkles when completed */}
      <AnimatePresence>
        {isCompleted && (
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
