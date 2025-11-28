'use client';

import { Volume2, Vibrate, Info, ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useUserStore } from '@/lib/stores/useUserStore';
import {
  SettingsToggle,
  SettingsSection,
  ThemeSelector,
  type Theme,
} from '@/components/features/settings';
import styles from './page.module.css';

export default function SettingsPage() {
  const {
    soundEnabled,
    hapticsEnabled,
    theme,
    setSoundEnabled,
    setHapticsEnabled,
    setTheme,
  } = useUserStore();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backButton} aria-label="Go back home">
          <ArrowLeft size={20} />
        </Link>
        <h1 className={styles.title}>Settings</h1>
      </header>

      <div className={styles.sections}>
        <SettingsSection title="Sound & Feedback">
          <SettingsToggle
            label="Sound Effects"
            description="Play sounds for correct/wrong answers and game events"
            checked={soundEnabled}
            onChange={setSoundEnabled}
            icon={<Volume2 size={20} />}
          />
          <SettingsToggle
            label="Haptic Feedback"
            description="Vibration feedback on touch interactions (Android only)"
            checked={hapticsEnabled}
            onChange={setHapticsEnabled}
            icon={<Vibrate size={20} />}
          />
        </SettingsSection>

        <SettingsSection title="Appearance">
          <ThemeSelector
            value={theme as Theme}
            onChange={setTheme}
          />
        </SettingsSection>

        <SettingsSection title="About">
          <div className={styles.aboutItem}>
            <div className={styles.aboutIcon}>
              <Info size={20} />
            </div>
            <div className={styles.aboutContent}>
              <span className={styles.aboutLabel}>Version</span>
              <span className={styles.aboutValue}>0.1.0</span>
            </div>
          </div>
          <a
            href="https://mathdash.app/help"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.aboutLink}
          >
            <div className={styles.aboutIcon}>
              <ExternalLink size={20} />
            </div>
            <div className={styles.aboutContent}>
              <span className={styles.aboutLabel}>Help & Support</span>
              <span className={styles.aboutValue}>Get help with Math Dash</span>
            </div>
          </a>
        </SettingsSection>
      </div>
    </div>
  );
}

