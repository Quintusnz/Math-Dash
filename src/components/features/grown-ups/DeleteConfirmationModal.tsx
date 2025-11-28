'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import styles from './DeleteConfirmationModal.module.css';

interface Profile {
  id: string;
  displayName: string;
  avatarId: string;
  ageBand: string;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  profile: Profile | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

type Step = 'warning' | 'confirm-name' | 'deleting' | 'success';

/**
 * Multi-step profile deletion confirmation modal.
 * Step 1: Warning about data loss
 * Step 2: Type profile name to confirm
 * Step 3: Success message
 */
export function DeleteConfirmationModal({
  isOpen,
  profile,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  const [step, setStep] = useState<Step>('warning');
  const [nameInput, setNameInput] = useState('');
  const [error, setError] = useState(false);

  // Reset state when modal opens/closes or profile changes
  useEffect(() => {
    if (isOpen) {
      setStep('warning');
      setNameInput('');
      setError(false);
    }
  }, [isOpen, profile?.id]);

  const handleProceedToConfirm = () => {
    setStep('confirm-name');
  };

  const handleConfirmDeletion = async () => {
    if (!profile) return;

    // Check if name matches (case-insensitive)
    if (nameInput.trim().toLowerCase() !== profile.displayName.toLowerCase()) {
      setError(true);
      return;
    }

    setStep('deleting');
    setError(false);

    try {
      await onConfirm();
      setStep('success');
    } catch (err) {
      console.error('Failed to delete profile:', err);
      setStep('warning'); // Go back on error
    }
  };

  const handleClose = () => {
    onCancel();
  };

  const handleSuccessClose = () => {
    onCancel();
  };

  if (!isOpen || !profile) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && step !== 'deleting' && handleClose()}>
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            {/* Close button - hidden during deletion */}
            {step !== 'deleting' && (
              <button className={styles.closeButton} onClick={handleClose} aria-label="Close">
                <X size={20} />
              </button>
            )}

            {/* Step 1: Warning */}
            {step === 'warning' && (
              <div className={styles.content}>
                <div className={styles.iconDanger}>
                  <AlertTriangle size={32} />
                </div>

                <h2 id="delete-modal-title" className={styles.title}>
                  Delete Profile?
                </h2>

                <div className={styles.profilePreview}>
                  <span className={styles.profileAvatar}>{profile.avatarId}</span>
                  <span className={styles.profileName}>{profile.displayName}</span>
                </div>

                <div className={styles.warningBox}>
                  <h3 className={styles.warningTitle}>⚠️ This action cannot be undone</h3>
                  <ul className={styles.warningList}>
                    <li>All game progress will be permanently deleted</li>
                    <li>All session history will be removed</li>
                    <li>All achievements and streaks will be lost</li>
                    <li>The play code will no longer work</li>
                  </ul>
                </div>

                <div className={styles.actions}>
                  <Button variant="secondary" onClick={handleClose}>
                    Keep Profile
                  </Button>
                  <Button variant="danger" onClick={handleProceedToConfirm}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Type name to confirm */}
            {step === 'confirm-name' && (
              <div className={styles.content}>
                <div className={styles.iconDanger}>
                  <Trash2 size={32} />
                </div>

                <h2 id="delete-modal-title" className={styles.title}>
                  Confirm Deletion
                </h2>

                <p className={styles.description}>
                  To confirm, please type <strong>{profile.displayName}</strong> below:
                </p>

                <form onSubmit={(e) => { e.preventDefault(); handleConfirmDeletion(); }}>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => {
                        setNameInput(e.target.value);
                        setError(false);
                      }}
                      className={`${styles.input} ${error ? styles.inputError : ''}`}
                      placeholder={`Type "${profile.displayName}" to confirm`}
                      autoFocus
                      autoComplete="off"
                    />
                    {error && (
                      <p className={styles.errorText}>
                        Name doesn&apos;t match. Please try again.
                      </p>
                    )}
                  </div>

                  <div className={styles.actions}>
                    <Button variant="secondary" type="button" onClick={() => setStep('warning')}>
                      Go Back
                    </Button>
                    <Button
                      variant="danger"
                      type="submit"
                      disabled={!nameInput.trim()}
                    >
                      Delete Forever
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: Deleting */}
            {step === 'deleting' && (
              <div className={styles.content}>
                <div className={styles.spinner} />
                <h2 className={styles.title}>Deleting Profile...</h2>
                <p className={styles.description}>
                  Please wait while we remove all data for {profile.displayName}.
                </p>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 'success' && (
              <div className={styles.content}>
                <div className={styles.iconSuccess}>
                  <CheckCircle size={32} />
                </div>

                <h2 className={styles.title}>Profile Deleted</h2>

                <p className={styles.description}>
                  <strong>{profile.displayName}</strong>&apos;s profile and all associated data has been permanently removed.
                </p>

                <div className={styles.actions}>
                  <Button onClick={handleSuccessClose}>
                    Done
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
