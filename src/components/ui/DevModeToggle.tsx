'use client';

import { useState, useEffect } from 'react';
import { usePremiumAccess } from '@/lib/hooks/usePremiumAccess';
import { Crown, CrownIcon, Bug, X } from 'lucide-react';
import styles from './DevModeToggle.module.css';

/**
 * A floating dev mode toggle that appears only in development.
 * Allows quick switching between Premium and Free tier for testing.
 */
export function DevModeToggle() {
  const { isPremium, actualPremium, isDevOverride, setDevOverride } = usePremiumAccess();
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check if we're in dev mode after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only show in development - check both ways for reliability
  const isDev = process.env.NODE_ENV === 'development' || 
                (typeof window !== 'undefined' && window.location.hostname === 'localhost');

  if (!mounted || !isDev) return null;

  const handleToggle = (value: boolean | null) => {
    setDevOverride(value);
    setIsExpanded(false);
  };

  return (
    <div className={styles.container}>
      {isExpanded ? (
        <div className={styles.panel}>
          <div className={styles.header}>
            <Bug size={16} />
            <span>Dev Mode</span>
            <button className={styles.closeBtn} onClick={() => setIsExpanded(false)}>
              <X size={14} />
            </button>
          </div>
          
          <div className={styles.status}>
            <span className={styles.statusLabel}>Current:</span>
            <span className={isPremium ? styles.premium : styles.free}>
              {isPremium ? '👑 Premium' : '🔒 Free'}
            </span>
            {isDevOverride && <span className={styles.overrideBadge}>Override</span>}
          </div>

          <div className={styles.options}>
            <button
              className={`${styles.option} ${isDevOverride && isPremium ? styles.active : ''}`}
              onClick={() => handleToggle(true)}
            >
              <Crown size={16} />
              Force Premium
            </button>
            <button
              className={`${styles.option} ${isDevOverride && !isPremium ? styles.active : ''}`}
              onClick={() => handleToggle(false)}
            >
              🔒 Force Free
            </button>
            <button
              className={`${styles.option} ${!isDevOverride ? styles.active : ''}`}
              onClick={() => handleToggle(null)}
            >
              📊 Use Database
              {actualPremium !== undefined && (
                <span className={styles.dbValue}>
                  ({actualPremium ? 'Premium' : 'Free'})
                </span>
              )}
            </button>
          </div>
        </div>
      ) : (
        <button 
          className={`${styles.fab} ${isDevOverride ? styles.fabOverride : ''}`}
          onClick={() => setIsExpanded(true)}
          title="Dev Mode Toggle"
        >
          <Bug size={18} />
          {isDevOverride && (
            <span className={styles.fabBadge}>
              {isPremium ? '👑' : '🔒'}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
