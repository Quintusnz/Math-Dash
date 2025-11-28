'use client';

import { useCurrency } from '@/lib/hooks/useCurrency';
import { CurrencySelector } from '@/components/features/monetization/CurrencySelector';
import { LinkButton } from '@/components/ui/Button';
import { Check, X, Crown, Heart, Rocket, Star } from 'lucide-react';
import styles from './page.module.css';

interface Feature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

const FREE_FEATURES: Feature[] = [
  { text: 'Unlimited 60-second practice sessions', included: true },
  { text: 'All 4 operations (+ − × ÷)', included: true },
  { text: 'Offline-first play', included: true },
  { text: 'Up to 3 player profiles', included: true },
  { text: 'Basic progress tracking', included: true },
  { text: 'Grown-ups gate for settings', included: true },
  { text: 'Skill radar & deep analytics', included: false },
  { text: 'Cloud sync across devices', included: false },
  { text: 'All difficulty levels', included: false },
];

const PREMIUM_FEATURES: Feature[] = [
  { text: 'Everything in Free, plus:', included: true, highlight: true },
  { text: 'Skill radar & progress analytics', included: true },
  { text: 'Deep practice history', included: true },
  { text: 'Cloud sync across devices', included: true },
  { text: 'All difficulty levels unlocked', included: true },
  { text: 'Up to 6 player profiles', included: true },
  { text: 'Family progress dashboard', included: true },
  { text: 'Priority support', included: true },
  { text: 'All future updates included', included: true },
];

export function PricingPlans() {
  const { currency, corePricing, setCurrency, isReady } = useCurrency();

  return (
    <section className={styles.plansSection}>
      {/* Currency Selector */}
      <div className={styles.currencySelector}>
        <CurrencySelector 
          value={currency} 
          onChange={setCurrency} 
          disabled={!isReady}
        />
      </div>

      <div className={styles.plansGrid}>
        {/* Free Plan */}
        <div className={`${styles.planCard} ${styles.planSecondary}`}>
          <div className={styles.planHeader}>
            <div className={styles.planIconWrapper} data-color="secondary">
              <Heart size={24} />
            </div>
            <div>
              <h3 className={styles.planName}>Free</h3>
              <p className={styles.planTagline}>Everything you need to start</p>
            </div>
          </div>

          <div className={styles.planPricing}>
            <span className={styles.planPrice}>$0</span>
            <span className={styles.planCadence}>forever</span>
          </div>

          <ul className={styles.featureList}>
            {FREE_FEATURES.map((feature, i) => (
              <li
                key={i}
                className={`${styles.featureItem} ${feature.highlight ? styles.featureHighlight : ''} ${!feature.included ? styles.featureDisabled : ''}`}
              >
                {feature.included ? (
                  <Check size={16} className={styles.featureCheck} />
                ) : (
                  <X size={16} className={styles.featureX} />
                )}
                <span>{feature.text}</span>
              </li>
            ))}
          </ul>

          <LinkButton
            href="/play"
            size="lg"
            variant="secondary"
            className={styles.secondaryCta}
          >
            Play Free Now
          </LinkButton>
        </div>

        {/* Premium Plan */}
        <div className={`${styles.planCard} ${styles.planPrimary}`}>
          <div className={styles.planBadge}>
            <Star size={12} /> Best Value
          </div>

          <div className={styles.planHeader}>
            <div className={styles.planIconWrapper} data-color="primary">
              <Crown size={24} />
            </div>
            <div>
              <h3 className={styles.planName}>Premium</h3>
              <p className={styles.planTagline}>Unlock the full experience</p>
            </div>
          </div>

          <div className={styles.planPricing}>
            <span className={styles.planPrice}>
              {isReady ? corePricing.displayPrice : '$6.99'}
            </span>
            <span className={styles.planCadence}>one-time</span>
          </div>

          <ul className={styles.featureList}>
            {PREMIUM_FEATURES.map((feature, i) => (
              <li
                key={i}
                className={`${styles.featureItem} ${feature.highlight ? styles.featureHighlight : ''} ${!feature.included ? styles.featureDisabled : ''}`}
              >
                {feature.included ? (
                  <Check size={16} className={styles.featureCheck} />
                ) : (
                  <X size={16} className={styles.featureX} />
                )}
                <span>{feature.text}</span>
              </li>
            ))}
          </ul>

          <LinkButton
            href="/grown-ups?tab=premium"
            size="lg"
            variant="primary"
            className={styles.primaryCta}
          >
            <Rocket size={18} />
            Unlock Premium
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
