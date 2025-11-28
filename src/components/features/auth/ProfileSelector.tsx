'use client';

import { useEffect, useState } from 'react';
import { useProfileStore } from '@/lib/stores/useProfileStore';
import { db, Profile } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion } from 'motion/react';
import { Plus, Key, User, Sparkles } from 'lucide-react';
import styles from './ProfileSelector.module.css';

export function ProfileSelector() {
  const { 
    setAuthStep, 
    setActiveProfile, 
    requireCodeToSwitch,
    deviceProfiles 
  } = useProfileStore();

  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);

  // Get all profiles from DB
  const profiles = useLiveQuery(() => db.profiles.toArray(), []);

  const handleProfileSelect = (profile: Profile) => {
    if (requireCodeToSwitch && !profile.isGuest && profile.playCode) {
      setSelectedProfile(profile);
      setShowCodeInput(true);
      setCodeInput('');
      setCodeError(null);
    } else {
      // Direct login without code
      activateProfile(profile);
    }
  };

  const handleCodeSubmit = () => {
    if (!selectedProfile) return;

    const normalizedInput = `DASH-${codeInput.toUpperCase()}`;
    
    if (normalizedInput === selectedProfile.playCode) {
      activateProfile(selectedProfile);
    } else {
      setCodeError('That code doesn\'t match. Try again!');
    }
  };

  const activateProfile = async (profile: Profile) => {
    // Update last active
    await db.deviceSettings.put({
      id: 'default',
      lastActivePlayCode: profile.playCode,
      requireCodeToSwitch: requireCodeToSwitch,
      updatedAt: new Date().toISOString(),
    });

    setActiveProfile(profile);
  };

  const handleAddPlayer = () => {
    setAuthStep('create-name');
  };

  const handleUseCode = () => {
    setAuthStep('enter-code');
  };

  const handleGuestPlay = async () => {
    // Check for existing guest or create new
    const existingGuest = profiles?.find(p => p.isGuest);
    
    if (existingGuest) {
      activateProfile(existingGuest);
    } else {
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
      setActiveProfile(guestProfile);
    }
  };

  const handleCancelCode = () => {
    setShowCodeInput(false);
    setSelectedProfile(null);
    setCodeInput('');
    setCodeError(null);
  };

  if (!profiles) {
    return (
      <div className={styles.loading}>
        <Sparkles className={styles.loadingIcon} size={24} />
        <span>Loading profiles...</span>
      </div>
    );
  }

  // Code verification modal
  if (showCodeInput && selectedProfile) {
    return (
      <div className={styles.container}>
        <div className={styles.codeVerify}>
          <div className={styles.selectedAvatar}>{selectedProfile.avatarId}</div>
          <h2 className={styles.title}>Hi, {selectedProfile.displayName}!</h2>
          <p className={styles.subtitle}>Enter your code to continue</p>
          
          <div className={styles.codeInputWrapper}>
            <span className={styles.codePrefix}>DASH-</span>
            <input
              type="text"
              value={codeInput}
              onChange={(e) => {
                setCodeInput(e.target.value.toUpperCase().slice(0, 4));
                setCodeError(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleCodeSubmit()}
              className={styles.codeInput}
              placeholder="XXXX"
              maxLength={4}
              autoFocus
            />
          </div>

          {codeError && (
            <p className={styles.error}>{codeError}</p>
          )}

          <div className={styles.codeActions}>
            <button 
              className={styles.cancelButton}
              onClick={handleCancelCode}
            >
              Cancel
            </button>
            <button 
              className={styles.verifyButton}
              onClick={handleCodeSubmit}
              disabled={codeInput.length !== 4}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Who&apos;s Playing Today?</h1>
        <p className={styles.subtitle}>Select your player to continue</p>
      </div>

      {/* Profile Grid */}
      <div className={styles.profileGrid}>
        {profiles.map((profile, index) => (
          <motion.button
            key={profile.id}
            className={`${styles.profileCard} ${profile.isGuest ? styles.guestCard : ''}`}
            onClick={() => handleProfileSelect(profile)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className={styles.profileAvatar}>{profile.avatarId}</span>
            <span className={styles.profileName}>{profile.displayName}</span>
            {profile.isGuest && (
              <span className={styles.guestBadge}>Guest</span>
            )}
          </motion.button>
        ))}

        {/* Add Player Button */}
        <motion.button
          className={`${styles.profileCard} ${styles.addCard}`}
          onClick={handleAddPlayer}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: profiles.length * 0.05 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className={styles.addIcon}>
            <Plus size={32} strokeWidth={2.5} />
          </div>
          <span className={styles.profileName}>Add Player</span>
        </motion.button>
      </div>

      {/* Secondary Actions */}
      <div className={styles.secondaryActions}>
        <button className={styles.secondaryButton} onClick={handleUseCode}>
          <Key size={18} />
          <span>Use a Different Code</span>
        </button>
        
        {!profiles.some(p => p.isGuest) && (
          <button className={styles.secondaryButton} onClick={handleGuestPlay}>
            <User size={18} />
            <span>Play as Guest</span>
          </button>
        )}
      </div>
    </div>
  );
}
