'use client';

import { useId } from 'react';
import styles from './SettingsToggle.module.css';

interface SettingsToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: React.ReactNode;
}

export function SettingsToggle({
  label,
  description,
  checked,
  onChange,
  icon,
}: SettingsToggleProps) {
  const id = useId();

  return (
    <div className={styles.container}>
      <div className={styles.labelContainer}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <div className={styles.textContainer}>
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
          {description && (
            <span className={styles.description}>{description}</span>
          )}
        </div>
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`${styles.toggle} ${checked ? styles.checked : ''}`}
      >
        <span className={styles.thumb} />
      </button>
    </div>
  );
}
