'use client';

import { useState } from 'react';
import { EmailCaptureForm, EmailCaptureData } from './EmailCaptureForm';
import { AdultGateModal } from '@/components/features/auth';
import { useCurrency } from '@/lib/hooks/useCurrency';
import { CurrencySelector } from './CurrencySelector';
import styles from './UpgradeCard.module.css';

export function UpgradeCard() {
  const [loading, setLoading] = useState(false);
  const [emailData, setEmailData] = useState<EmailCaptureData | null>(null);
  const [showAdultGate, setShowAdultGate] = useState(false);
  const { currency, corePricing, setCurrency, isReady } = useCurrency();

  const handleEmailCapture = (data: EmailCaptureData) => {
    setEmailData(data);
  };

  const handleUpgradeClick = () => {
    if (!emailData) {
      alert('Please enter your email to continue');
      return;
    }
    // Show adult verification before proceeding to checkout
    setShowAdultGate(true);
  };

  const handleAdultVerified = async () => {
    setShowAdultGate(false);
    // Proceed to checkout after verification
    await proceedToCheckout();
  };

  const handleAdultGateCancel = () => {
    setShowAdultGate(false);
  };

  const proceedToCheckout = async () => {
    if (!emailData) {
      alert('Please enter your email to continue');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailData.email,
          marketingOptIn: emailData.marketingOptIn,
          currency,
        }),
      });

      const { url } = await response.json();
      
      if (url) {
        // Store email data in sessionStorage for retrieval after redirect
        sessionStorage.setItem('pendingPurchaseEmail', JSON.stringify(emailData));
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
      <span className={styles.badge}>✨ Premium</span>
      <h2 className={styles.title}>Unlock Math Dash Premium</h2>
      <p className={styles.description}>
        Full access to all topics, smart practice modes, and detailed progress tracking for your whole family.
      </p>
      
      <div className={styles.features}>
        <div className={styles.feature}>
          <span className={styles.check}>✓</span>
          <span>All Addition & Subtraction Facts</span>
        </div>
        <div className={styles.feature}>
          <span className={styles.check}>✓</span>
          <span>Multiplication & Division to 12×</span>
        </div>
        <div className={styles.feature}>
          <span className={styles.check}>✓</span>
          <span>Doubles, Halves & Squares</span>
        </div>
        <div className={styles.feature}>
          <span className={styles.check}>✓</span>
          <span>Adaptive Smart Mode</span>
        </div>
        <div className={styles.feature}>
          <span className={styles.check}>✓</span>
          <span>Unlimited Player Profiles</span>
        </div>
        <div className={styles.feature}>
          <span className={styles.check}>✓</span>
          <span>Detailed Progress Reports</span>
        </div>
      </div>

      <div className={styles.divider} />

      <CurrencySelector 
        value={currency} 
        onChange={setCurrency} 
        disabled={loading || !isReady} 
      />

      <EmailCaptureForm onSubmit={handleEmailCapture} isLoading={loading} />

      <button 
        onClick={handleUpgradeClick} 
        disabled={loading || !emailData || !isReady}
        className={styles.button}
      >
        {loading ? 'Processing...' : `Upgrade for ${corePricing.displayPrice}`}
      </button>
      
      <p className={styles.disclaimer}>
        One-time purchase · No subscription · Instant access
      </p>

      <AdultGateModal
        isOpen={showAdultGate}
        onVerified={handleAdultVerified}
        onCancel={handleAdultGateCancel}
        title="Parent Verification"
        description="To protect children, please verify you are a parent or guardian by solving this math problem."
      />
    </div>
  );
}
