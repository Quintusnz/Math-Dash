'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Play, Clock, ChevronRight } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useProfileStore } from '@/lib/stores/useProfileStore';
import { useGameStore } from '@/lib/stores/useGameStore';
import { getLastGameConfig, getConfigSummary, toGameConfig, LastGameConfig } from '@/lib/game-engine/quick-play';
import styles from './QuickPlay.module.css';

export interface QuickPlayProps {
  /** Optional class name for styling */
  className?: string;
}

/**
 * Quick Play card component that allows one-tap replay with last used settings.
 * Shows the previous game configuration and launches the game directly.
 */
export function QuickPlay({ className }: QuickPlayProps) {
  const router = useRouter();
  const { activeProfile } = useProfileStore();
  const { setConfig, startGame } = useGameStore();
  const [lastConfig, setLastConfig] = useState<LastGameConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch last game config when profile changes
  useEffect(() => {
    const fetchConfig = async () => {
      if (!activeProfile?.id) {
        setLastConfig(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const config = await getLastGameConfig(activeProfile.id);
        setLastConfig(config);
      } catch (error) {
        console.error('[QuickPlay] Error fetching config:', error);
        setLastConfig(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [activeProfile?.id]);

  const handleQuickPlay = () => {
    if (!lastConfig) return;

    // Set the game config
    const gameConfig = toGameConfig(lastConfig);
    setConfig(gameConfig);

    // Navigate to play page and start the game
    router.push('/play?quick=true');
  };

  // Format relative time (e.g., "2 hours ago", "yesterday")
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Don't render if still loading or no previous config
  if (isLoading) {
    return (
      <div className={`${styles.container} ${styles.loading} ${className || ''}`}>
        <div className={styles.loadingPulse} />
      </div>
    );
  }

  if (!lastConfig) {
    // No previous games - don't show quick play
    return null;
  }

  const configSummary = getConfigSummary(lastConfig);
  const relativeTime = getRelativeTime(lastConfig.playedAt);

  return (
    <button
      type="button"
      className={`${styles.container} ${className || ''}`}
      onClick={handleQuickPlay}
      aria-label={`Quick play: ${configSummary}`}
    >
      <div className={styles.iconContainer}>
        <Zap className={styles.icon} aria-hidden="true" />
      </div>

      <div className={styles.content}>
        <div className={styles.titleRow}>
          <span className={styles.title}>Quick Play</span>
          <ChevronRight className={styles.arrow} size={18} aria-hidden="true" />
        </div>
        <span className={styles.summary}>{configSummary}</span>
        <div className={styles.meta}>
          <Clock size={12} aria-hidden="true" />
          <span>Last played {relativeTime}</span>
          {lastConfig.lastScore !== undefined && (
            <>
              <span className={styles.dot}>•</span>
              <span>Score: {lastConfig.lastScore}</span>
            </>
          )}
        </div>
      </div>

      <div className={styles.playBadge}>
        <Play size={14} aria-hidden="true" />
      </div>
    </button>
  );
}
