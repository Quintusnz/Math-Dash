'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdminStore } from '@/lib/stores/useAdminStore';
import styles from './AdultGate.module.css';
import { Button } from '@/components/ui/Button';

interface AdultGateModalProps {
  isOpen: boolean;
  onVerified: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
}

/**
 * A modal variant of AdultGate that can be triggered on demand.
 * Useful for protecting specific actions like purchases.
 * Shares the same styling and verification logic as the page-level AdultGate.
 */
export function AdultGateModal({
  isOpen,
  onVerified,
  onCancel,
  title = 'Verify Adult',
  description = 'Please solve this math problem to continue.',
}: AdultGateModalProps) {
  const { verify, checkExpiry } = useAdminStore();
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  const [challenge, setChallenge] = useState<{ a: number; b: number } | null>(null);

  const generateChallenge = useCallback(() => {
    // Generate a 2-digit × 1-digit multiplication problem
    const a = Math.floor(Math.random() * 9) + 11; // 11-19
    const b = Math.floor(Math.random() * 7) + 3;  // 3-9
    setChallenge({ a, b });
    setAnswer('');
    setError(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Check if already verified (e.g., from accessing grown-ups area)
      const isValid = checkExpiry();
      if (isValid) {
        onVerified();
      } else {
        generateChallenge();
      }
    }
  }, [isOpen, checkExpiry, onVerified, generateChallenge]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge) return;

    const expected = challenge.a * challenge.b;
    if (parseInt(answer) === expected) {
      verify();
      onVerified();
    } else {
      setError(true);
      setAnswer('');
      setTimeout(generateChallenge, 500);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay}>
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.description}>{description}</p>

            {challenge && (
              <div className={styles.challenge}>
                {challenge.a} × {challenge.b} = ?
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <input
                  type="number"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className={styles.input}
                  placeholder="Enter answer"
                  autoFocus
                />
                {error && <p className={styles.error}>Incorrect. Try again.</p>}
              </div>

              <div className={styles.actions}>
                <Button
                  type="button"
                  onClick={onCancel}
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Continue
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
