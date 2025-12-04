'use client';

import { useState, useEffect } from 'react';
import { Pause, Play, Home, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import styles from './PauseModal.module.css';

export interface PauseModalProps {
  /**
   * Whether the modal is currently visible
   */
  isOpen: boolean;
  /**
   * Called when user clicks "Resume" button
   */
  onResume: () => void;
  /**
   * Called when user clicks "End Session" link
   */
  onEndSession: () => void;
  /**
   * Timestamp when the pause started (for elapsed time display)
   */
  pauseStartedAt?: number | null;
  /**
   * Total number of pauses this session (optional, for display)
   */
  pauseCount?: number;
}

/**
 * Modal displayed when the game is paused due to focus loss.
 * Features a large Resume button and a smaller End Session option.
 */
export function PauseModal({
  isOpen,
  onResume,
  onEndSession,
  pauseStartedAt,
  pauseCount = 0,
}: PauseModalProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Track elapsed time while paused
  useEffect(() => {
    if (!isOpen || !pauseStartedAt) {
      setElapsedSeconds(0);
      return;
    }

    // Update elapsed time every second
    const updateElapsed = () => {
      setElapsedSeconds(Math.floor((Date.now() - pauseStartedAt) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [isOpen, pauseStartedAt]);

  // Format elapsed time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pause-modal-title"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <div className={styles.iconContainer}>
              <Pause className={styles.pauseIcon} aria-hidden="true" />
            </div>

            <h2 id="pause-modal-title" className={styles.title}>
              Game Paused
            </h2>

            <p className={styles.message}>
              Looks like you stepped away
            </p>

            {elapsedSeconds > 0 && (
              <div className={styles.elapsedTime} aria-live="polite">
                <Clock size={16} aria-hidden="true" />
                <span>Paused for {formatTime(elapsedSeconds)}</span>
              </div>
            )}

            <button
              type="button"
              className={styles.resumeButton}
              onClick={onResume}
              autoFocus
            >
              <Play size={24} aria-hidden="true" />
              Resume
            </button>

            <button
              type="button"
              className={styles.endSessionButton}
              onClick={onEndSession}
            >
              <Home size={16} aria-hidden="true" />
              End Session
            </button>

            {pauseCount > 1 && (
              <p className={styles.pauseHint}>
                Paused {pauseCount} times this session
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
