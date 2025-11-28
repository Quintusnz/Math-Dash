'use client';

import { useState, useEffect } from 'react';
import { useProfileStore } from '@/lib/stores/useProfileStore';
import { db, Profile } from '@/lib/db';
import { generatePlayCode } from '@/lib/auth/play-code';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { PlayCodeDisplay } from './PlayCodeDisplay';
import styles from './CreatePlayerFlow.module.css';

const AVATARS = [
  { id: '🦊', label: 'Fox' },
  { id: '🐱', label: 'Cat' },
  { id: '🐶', label: 'Dog' },
  { id: '🐰', label: 'Bunny' },
  { id: '🐼', label: 'Panda' },
  { id: '🐨', label: 'Koala' },
  { id: '🦁', label: 'Lion' },
  { id: '🐯', label: 'Tiger' },
  { id: '🦄', label: 'Unicorn' },
  { id: '🐲', label: 'Dragon' },
  { id: '🦋', label: 'Butterfly' },
  { id: '🚀', label: 'Rocket' },
];

const AGE_BANDS = [
  { id: '4-5', label: '4-5 Years', emoji: '🌱' },
  { id: '6-8', label: '6-8 Years', emoji: '🌿' },
  { id: '9-12', label: '9-12 Years', emoji: '🌳' },
];

export function CreatePlayerFlow() {
  const {
    authStep,
    setAuthStep,
    pendingProfile,
    setPendingName,
    setPendingAvatar,
    setPendingAgeBand,
    resetPendingProfile,
    setActiveProfile,
    addDeviceProfile,
  } = useProfileStore();

  const [isCreating, setIsCreating] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  // Validation
  const isNameValid = pendingProfile.displayName.trim().length >= 2;

  const handleNameSubmit = () => {
    if (!isNameValid) {
      setNameError('Please enter at least 2 characters');
      return;
    }
    setNameError(null);
    setAuthStep('create-avatar');
  };

  const handleAvatarSelect = (avatarId: string) => {
    setPendingAvatar(avatarId);
  };

  const handleAvatarContinue = () => {
    setAuthStep('create-age');
  };

  const handleAgeSelect = async (ageBand: string) => {
    console.log('handleAgeSelect called with:', ageBand);
    setPendingAgeBand(ageBand);
    setIsCreating(true);
    setCreateError(null);

    try {
      // Generate play code
      console.log('Generating play code...');
      const playCode = await generatePlayCode();
      console.log('Play code generated:', playCode);
      
      // Create profile
      const newProfile: Profile = {
        id: crypto.randomUUID(),
        playCode,
        displayName: pendingProfile.displayName.trim(),
        avatarId: pendingProfile.avatarId,
        ageBand,
        isGuest: false,
        classroomId: null,
        preferences: {
          theme: 'default',
          soundEnabled: true,
          hapticsEnabled: true,
        },
        syncStatus: 'local',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      console.log('Profile object created:', newProfile);

      // Save to database
      console.log('Saving to database...');
      await db.profiles.add(newProfile);
      console.log('Profile saved to database');
      
      // Update device settings (non-critical)
      try {
        await db.deviceSettings.put({
          id: 'default',
          lastActivePlayCode: playCode,
          requireCodeToSwitch: false,
          updatedAt: new Date().toISOString(),
        });
        console.log('Device settings updated');
      } catch (settingsError) {
        console.warn('Failed to update device settings:', settingsError);
      }

      // Update store and navigate
      console.log('Updating store...');
      addDeviceProfile(newProfile);
      console.log('Setting created code:', playCode);
      setCreatedCode(playCode);
      console.log('Setting isCreating to false');
      setIsCreating(false);
      console.log('Setting auth step to create-code');
      setAuthStep('create-code');
      console.log('handleAgeSelect completed successfully');
    } catch (error) {
      console.error('Failed to create profile:', error);
      setCreateError('Something went wrong. Please try again.');
      setIsCreating(false);
    }
  };

  const handleStartPlaying = async () => {
    if (createdCode) {
      const profile = await db.profiles.where('playCode').equals(createdCode).first();
      if (profile) {
        setActiveProfile(profile);
        resetPendingProfile();
      }
    }
  };

  const handleBack = () => {
    switch (authStep) {
      case 'create-avatar':
        setAuthStep('create-name');
        break;
      case 'create-age':
        setAuthStep('create-avatar');
        break;
      case 'create-code':
        // Can't go back from code screen
        break;
      default:
        // If there are existing profiles, go back to playing (they were adding a new player)
        // Otherwise, go to welcome screen
        if (useProfileStore.getState().deviceProfiles.length > 0) {
          setAuthStep('playing');
        } else {
          setAuthStep('welcome');
        }
    }
  };

  const getStepNumber = () => {
    switch (authStep) {
      case 'create-name': return 1;
      case 'create-avatar': return 2;
      case 'create-age': return 3;
      case 'create-code': return 4;
      default: return 1;
    }
  };

  return (
    <div className={styles.container}>
      {/* Progress */}
      {authStep !== 'create-code' && (
        <div className={styles.progress}>
          <button 
            className={styles.backButton}
            onClick={handleBack}
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className={styles.progressDots}>
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`${styles.dot} ${getStepNumber() >= step ? styles.dotActive : ''}`}
              />
            ))}
          </div>
          <div className={styles.stepLabel}>Step {getStepNumber()} of 3</div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Name */}
        {authStep === 'create-name' && (
          <motion.div
            key="name"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={styles.step}
          >
            <div className={styles.stepHeader}>
              <span className={styles.stepEmoji}>✏️</span>
              <h2 className={styles.stepTitle}>What should we call you?</h2>
              <p className={styles.stepDesc}>Pick a fun name for your player!</p>
            </div>

            <div className={styles.inputWrapper}>
              <input
                type="text"
                value={pendingProfile.displayName}
                onChange={(e) => {
                  setPendingName(e.target.value);
                  setNameError(null);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                placeholder="Your awesome name"
                className={styles.input}
                maxLength={20}
                autoFocus
              />
              {nameError && (
                <span className={styles.error}>{nameError}</span>
              )}
              <span className={styles.charCount}>
                {pendingProfile.displayName.length}/20
              </span>
            </div>

            <button
              className={styles.continueButton}
              onClick={handleNameSubmit}
              disabled={!isNameValid}
            >
              Continue
              <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {/* Step 2: Avatar */}
        {authStep === 'create-avatar' && (
          <motion.div
            key="avatar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={styles.step}
          >
            <div className={styles.stepHeader}>
              <span className={styles.stepEmoji}>🎭</span>
              <h2 className={styles.stepTitle}>Choose your avatar!</h2>
              <p className={styles.stepDesc}>Pick a character that represents you</p>
            </div>

            <div className={styles.avatarGrid}>
              {AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => handleAvatarSelect(avatar.id)}
                  className={`${styles.avatarButton} ${
                    pendingProfile.avatarId === avatar.id ? styles.avatarSelected : ''
                  }`}
                  aria-label={avatar.label}
                >
                  <span className={styles.avatarEmoji}>{avatar.id}</span>
                  {pendingProfile.avatarId === avatar.id && (
                    <motion.div
                      className={styles.avatarCheck}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Check size={14} strokeWidth={3} />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            <button
              className={styles.continueButton}
              onClick={handleAvatarContinue}
            >
              Continue
              <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {/* Step 3: Age */}
        {authStep === 'create-age' && (
          <motion.div
            key="age"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={styles.step}
          >
            <div className={styles.stepHeader}>
              <span className={styles.stepEmoji}>🎂</span>
              <h2 className={styles.stepTitle}>How old are you?</h2>
              <p className={styles.stepDesc}>This helps us pick the right challenges</p>
            </div>

            <div className={styles.ageOptions}>
              {AGE_BANDS.map((age) => (
                <button
                  key={age.id}
                  onClick={() => handleAgeSelect(age.id)}
                  className={styles.ageButton}
                  disabled={isCreating}
                >
                  <span className={styles.ageEmoji}>{age.emoji}</span>
                  <span className={styles.ageLabel}>{age.label}</span>
                </button>
              ))}
            </div>

            {isCreating && (
              <div className={styles.creating}>
                <Sparkles className={styles.creatingIcon} size={20} />
                <span>Creating your player...</span>
              </div>
            )}

            {createError && (
              <div className={styles.errorMessage}>
                <span>⚠️ {createError}</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 4: Code Display */}
        {authStep === 'create-code' && createdCode && (
          <motion.div
            key="code"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={styles.step}
          >
            <div className={styles.stepHeader}>
              <span className={styles.stepEmoji}>🎉</span>
              <h2 className={styles.stepTitle}>You&apos;re all set!</h2>
              <p className={styles.stepDesc}>
                Here&apos;s your special Play Code. Keep it safe!
              </p>
            </div>

            <PlayCodeDisplay 
              code={createdCode} 
              playerName={pendingProfile.displayName}
              avatarId={pendingProfile.avatarId}
            />

            <button
              className={styles.startButton}
              onClick={handleStartPlaying}
            >
              <Sparkles size={20} />
              Start Playing!
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
