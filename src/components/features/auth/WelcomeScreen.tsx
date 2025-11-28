'use client';

import { useProfileStore } from '@/lib/stores/useProfileStore';
import { db, Profile } from '@/lib/db';
import { motion } from 'motion/react';
import { Rocket, Key, User, Sparkles } from 'lucide-react';
import Image from 'next/image';
import styles from './WelcomeScreen.module.css';

export function WelcomeScreen() {
  const { setAuthStep, setActiveProfile, addDeviceProfile } = useProfileStore();

  const handleCreatePlayer = () => {
    setAuthStep('create-name');
  };

  const handleHaveCode = () => {
    setAuthStep('enter-code');
  };

  const handleGuestPlay = async () => {
    // Create a guest profile
    const guestProfile: Profile = {
      id: crypto.randomUUID(),
      playCode: null,
      displayName: 'Guest Player',
      ageBand: '6-8',
      avatarId: '🎮',
      isGuest: true,
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

    await db.profiles.add(guestProfile);
    addDeviceProfile(guestProfile);
    setActiveProfile(guestProfile);
  };

  return (
    <div className={styles.container}>
      {/* Logo */}
      <motion.div 
        className={styles.logoWrapper}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
      >
        <Image
          src="/logos/logo-3d.png"
          alt="Math Dash"
          width={200}
          height={200}
          className={styles.logo}
          priority
        />
      </motion.div>

      {/* Title */}
      <motion.div 
        className={styles.header}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <h1 className={styles.title}>Ready to Play?</h1>
        <p className={styles.subtitle}>
          Jump into math adventures and become a calculation champion!
        </p>
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        className={styles.actions}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <button 
          className={styles.primaryAction}
          onClick={handleCreatePlayer}
        >
          <div className={styles.actionIcon}>
            <Rocket size={28} strokeWidth={2.5} />
          </div>
          <div className={styles.actionContent}>
            <span className={styles.actionTitle}>Create Your Player</span>
            <span className={styles.actionDesc}>I&apos;m new here!</span>
          </div>
          <Sparkles size={20} className={styles.sparkle} />
        </button>

        <button 
          className={styles.secondaryAction}
          onClick={handleHaveCode}
        >
          <div className={styles.actionIcon}>
            <Key size={28} strokeWidth={2.5} />
          </div>
          <div className={styles.actionContent}>
            <span className={styles.actionTitle}>I Have a Code</span>
            <span className={styles.actionDesc}>I&apos;ve played before</span>
          </div>
        </button>
      </motion.div>

      {/* Divider */}
      <motion.div 
        className={styles.divider}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <span className={styles.dividerLine} />
        <span className={styles.dividerText}>or</span>
        <span className={styles.dividerLine} />
      </motion.div>

      {/* Guest Option */}
      <motion.button 
        className={styles.guestAction}
        onClick={handleGuestPlay}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <User size={18} />
        <span>Play as Guest</span>
      </motion.button>

      <motion.p 
        className={styles.guestNote}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        Guest progress stays on this device only
      </motion.p>
    </div>
  );
}
