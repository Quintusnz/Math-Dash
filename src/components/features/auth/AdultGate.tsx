'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useAdminStore } from '@/lib/stores/useAdminStore';
import styles from './AdultGate.module.css';

interface AdultGateProps {
  children: React.ReactNode;
}

export default function AdultGate({ children }: AdultGateProps) {
  const router = useRouter();
  const { isVerified, verify, checkExpiry } = useAdminStore();
  const [showGate, setShowGate] = useState(true);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  const [challenge, setChallenge] = useState<{ a: number; b: number } | null>(null);

  useEffect(() => {
    // Check if we have a valid session
    const isValid = checkExpiry();
    if (isValid) {
      setShowGate(false);
    } else {
      generateChallenge();
      setShowGate(true);
    }
  }, [checkExpiry]);

  const generateChallenge = () => {
    // Generate numbers between 11 and 19 for 'a' and 3 and 9 for 'b'
    // This ensures it's slightly beyond basic 1-10 tables but solvable
    const a = Math.floor(Math.random() * 9) + 11;
    const b = Math.floor(Math.random() * 7) + 3;
    setChallenge({ a, b });
    setAnswer('');
    setError(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge) return;

    const expected = challenge.a * challenge.b;
    if (parseInt(answer) === expected) {
      verify();
      setShowGate(false);
    } else {
      setError(true);
      setAnswer('');
      // Generate a new challenge on failure to prevent guessing
      setTimeout(generateChallenge, 500);
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  if (!showGate) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence>
      {showGate && (
        <div className={styles.overlay}>
          <motion.div 
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <h2 className={styles.title}>Grown-ups Only</h2>
            <p className={styles.description}>
              Please solve this problem to access the settings area.
            </p>

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
                <button 
                  type="button" 
                  onClick={handleCancel}
                  className={`${styles.button} ${styles.cancelButton}`}
                >
                  Go Back
                </button>
                <button 
                  type="submit"
                  className={`${styles.button} ${styles.submitButton}`}
                >
                  Continue
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
