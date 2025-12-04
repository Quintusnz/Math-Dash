'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfileStore } from '@/lib/stores/useProfileStore';
import { db, Profile } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, UserPlus, Check, LayoutDashboard } from 'lucide-react';
import styles from './ProfileChip.module.css';

interface ProfileChipProps {
  size?: 'sm' | 'md';
  showSwitcher?: boolean;
  showDashboardLink?: boolean;
}

export function ProfileChip({ size = 'md', showSwitcher = true, showDashboardLink = false }: ProfileChipProps) {
  const router = useRouter();
  const { activeProfile, setActiveProfile, setAuthStep, resetPendingProfile } = useProfileStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get all profiles on this device
  const profiles = useLiveQuery(() => db.profiles.toArray(), []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleProfileSelect = async (profile: Profile) => {
    // Fetch fresh profile data from database to ensure streak/stats are current
    const freshProfile = await db.profiles.get(profile.id);
    if (freshProfile) {
      setActiveProfile(freshProfile);
    } else {
      setActiveProfile(profile);
    }
    
    // Update device settings with last active profile
    await db.deviceSettings.put({
      id: 'default',
      lastActivePlayCode: profile.playCode,
      requireCodeToSwitch: false,
      updatedAt: new Date().toISOString(),
    });
    
    setIsOpen(false);
  };

  const handleAddNewPlayer = () => {
    setIsOpen(false);
    resetPendingProfile();
    setAuthStep('create-name');
  };

  if (!activeProfile) {
    return null;
  }

  const otherProfiles = profiles?.filter(p => p.id !== activeProfile.id) || [];
  const hasMultipleProfiles = otherProfiles.length > 0;

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button
        className={`${styles.chip} ${styles[size]} ${showSwitcher && hasMultipleProfiles ? styles.clickable : ''}`}
        onClick={() => showSwitcher && setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup={showSwitcher ? 'listbox' : undefined}
      >
        <span className={styles.avatar}>{activeProfile.avatarId}</span>
        <span className={styles.name}>{activeProfile.displayName}</span>
        {showSwitcher && (hasMultipleProfiles || true) && (
          <ChevronDown 
            size={size === 'sm' ? 14 : 16} 
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          />
        )}
      </button>

      <AnimatePresence>
        {isOpen && showSwitcher && (
          <motion.div
            className={styles.dropdown}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            role="listbox"
          >
            <div className={styles.dropdownHeader}>Switch Player</div>
            
            <div className={styles.profileList}>
              {/* Current profile */}
              <button
                className={`${styles.profileOption} ${styles.current}`}
                onClick={() => setIsOpen(false)}
                role="option"
                aria-selected="true"
              >
                <span className={styles.optionAvatar}>{activeProfile.avatarId}</span>
                <span className={styles.optionName}>{activeProfile.displayName}</span>
                <Check size={16} className={styles.checkIcon} />
              </button>

              {/* Other profiles */}
              {otherProfiles.map((profile) => (
                <button
                  key={profile.id}
                  className={styles.profileOption}
                  onClick={() => handleProfileSelect(profile)}
                  role="option"
                  aria-selected="false"
                >
                  <span className={styles.optionAvatar}>{profile.avatarId}</span>
                  <span className={styles.optionName}>{profile.displayName}</span>
                </button>
              ))}
            </div>

            {showDashboardLink && (
              <>
                <div className={styles.dropdownDivider} />
                <button
                  className={styles.dashboardButton}
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/dashboard');
                  }}
                >
                  <LayoutDashboard size={16} />
                  <span>{activeProfile.displayName}&apos;s Dashboard</span>
                </button>
              </>
            )}

            <div className={styles.dropdownDivider} />
            
            <button
              className={styles.addPlayerButton}
              onClick={handleAddNewPlayer}
            >
              <UserPlus size={16} />
              <span>Add New Player</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
