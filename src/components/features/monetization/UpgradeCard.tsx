'use client';

import { useState } from 'react';
import styles from './UpgradeCard.module.css';

export function UpgradeCard() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
      });

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        console.error('No checkout URL returned');
        setLoading(false);
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Unlock Math Dash Premium</h2>
      <p className={styles.description}>
        Get unlimited access to all topics, advanced tracking, and adaptive practice modes for your whole family.
      </p>
      
      <div className={styles.features}>
        <div className={styles.feature}>
          <span className={styles.check}>✓</span> Addition & Subtraction Facts (Make 10/20)
        </div>
        <div className={styles.feature}>
          <span className={styles.check}>✓</span> Multiplication Facts to 12× + Division Facts
        </div>
        <div className={styles.feature}>
          <span className={styles.check}>✓</span> Doubles & Halves + Square Numbers
        </div>
        <div className={styles.feature}>
          <span className={styles.check}>✓</span> Adaptive "Smart Mode"
        </div>
        <div className={styles.feature}>
          <span className={styles.check}>✓</span> Unlimited Profiles
        </div>
        <div className={styles.feature}>
          <span className={styles.check}>✓</span> Detailed Progress Reports
        </div>
      </div>

      <button 
        onClick={handleCheckout} 
        disabled={loading}
        className={styles.button}
      >
        {loading ? 'Loading...' : 'Upgrade for $7.99'}
      </button>
      
      <p className={styles.disclaimer}>
        One-time purchase. No subscription.
      </p>
    </div>
  );
}
