'use client';

import { useState, useCallback } from 'react';
import styles from './EmailCaptureForm.module.css';

export interface EmailCaptureData {
  email: string;
  marketingOptIn: boolean;
}

interface EmailCaptureFormProps {
  onSubmit: (data: EmailCaptureData) => void;
  isLoading?: boolean;
}

export function EmailCaptureForm({ onSubmit, isLoading = false }: EmailCaptureFormProps) {
  const [email, setEmail] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    onSubmit({ email: email.trim(), marketingOptIn });
  }, [email, marketingOptIn, validateEmail, onSubmit]);

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.fieldGroup}>
        <label htmlFor="parentEmail" className={styles.label}>
          Parent/Guardian Email
        </label>
        <input
          id="parentEmail"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (e.target.value.trim() && validateEmail(e.target.value)) {
              onSubmit({ email: e.target.value.trim(), marketingOptIn });
            }
          }}
          onBlur={() => {
            if (email.trim() && validateEmail(email)) {
              onSubmit({ email: email.trim(), marketingOptIn });
            }
          }}
          placeholder="you@email.com"
          className={styles.input}
          disabled={isLoading}
          autoComplete="email"
          required
        />
        {error && <span className={styles.error}>{error}</span>}
      </div>

      <label className={styles.checkboxGroup}>
        <input
          type="checkbox"
          checked={marketingOptIn}
          onChange={(e) => {
            setMarketingOptIn(e.target.checked);
            if (email.trim() && validateEmail(email)) {
              onSubmit({ email: email.trim(), marketingOptIn: e.target.checked });
            }
          }}
          className={styles.checkbox}
          disabled={isLoading}
        />
        <span className={styles.checkboxLabel}>
          Send me tips and updates about Math Dash (you can unsubscribe anytime)
        </span>
      </label>

      <p className={styles.helpText}>
        We'll send your receipt and weekly progress reports to this email.
      </p>

      <button 
        type="submit" 
        disabled={isLoading || !email.trim()}
        className={styles.submitButton}
        style={{ display: 'none' }}
      >
        Continue to Checkout
      </button>
    </form>
  );
}
