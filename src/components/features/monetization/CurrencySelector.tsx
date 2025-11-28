'use client';

import { CurrencyCode, TIER_1_CURRENCIES, CORE_PRICING } from '@/lib/constants/pricing';
import styles from './CurrencySelector.module.css';

interface CurrencySelectorProps {
  value: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
  disabled?: boolean;
}

const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  USD: '🇺🇸',
  GBP: '🇬🇧',
  EUR: '🇪🇺',
  AUD: '🇦🇺',
  NZD: '🇳🇿',
};

export function CurrencySelector({ value, onChange, disabled }: CurrencySelectorProps) {
  return (
    <div className={styles.container}>
      <label className={styles.label} htmlFor="currency-select">
        Currency:
      </label>
      <select
        id="currency-select"
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value as CurrencyCode)}
        disabled={disabled}
      >
        {TIER_1_CURRENCIES.map((currency) => (
          <option key={currency} value={currency}>
            {CURRENCY_LABELS[currency]} {currency} ({CORE_PRICING[currency].displayPrice})
          </option>
        ))}
      </select>
    </div>
  );
}
