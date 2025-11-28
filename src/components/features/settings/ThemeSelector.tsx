'use client';

import styles from './ThemeSelector.module.css';
import { Sun, Moon, Monitor } from 'lucide-react';

export type Theme = 'light' | 'dark' | 'auto';

interface ThemeSelectorProps {
  value: Theme;
  onChange: (theme: Theme) => void;
}

const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun size={20} /> },
  { value: 'dark', label: 'Dark', icon: <Moon size={20} /> },
  { value: 'auto', label: 'Auto', icon: <Monitor size={20} /> },
];

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>Theme</span>
        <span className={styles.description}>Choose your preferred appearance</span>
      </div>
      <div className={styles.options} role="radiogroup" aria-label="Theme selection">
        {themes.map((theme) => (
          <button
            key={theme.value}
            role="radio"
            aria-checked={value === theme.value}
            onClick={() => onChange(theme.value)}
            className={`${styles.option} ${value === theme.value ? styles.selected : ''}`}
          >
            <span className={styles.optionIcon}>{theme.icon}</span>
            <span className={styles.optionLabel}>{theme.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
