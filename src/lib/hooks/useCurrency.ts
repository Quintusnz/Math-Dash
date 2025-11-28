'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CurrencyCode,
  DEFAULT_CURRENCY,
  detectCurrencyFromLocale,
  getCorePricing,
  getTeacherPricing,
  PricingTier,
} from '@/lib/constants/pricing';

const CURRENCY_STORAGE_KEY = 'math_dash_currency';

export interface UseCurrencyReturn {
  /** Current selected currency */
  currency: CurrencyCode;
  /** Core product pricing for current currency */
  corePricing: PricingTier;
  /** Teacher product pricing for current currency */
  teacherPricing: PricingTier;
  /** Change the currency (persists to localStorage) */
  setCurrency: (currency: CurrencyCode) => void;
  /** Whether currency has been initialized */
  isReady: boolean;
}

/**
 * Hook for managing currency selection and pricing display
 * 
 * - Auto-detects currency from browser locale on first visit
 * - Persists user's currency preference to localStorage
 * - Provides pricing information for the selected currency
 */
export function useCurrency(): UseCurrencyReturn {
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [isReady, setIsReady] = useState(false);

  // Initialize currency from localStorage or detect from locale
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY) as CurrencyCode | null;
    
    if (stored && ['USD', 'GBP', 'EUR', 'AUD', 'NZD'].includes(stored)) {
      setCurrencyState(stored);
    } else {
      // Auto-detect from browser locale
      const detected = detectCurrencyFromLocale();
      setCurrencyState(detected);
      localStorage.setItem(CURRENCY_STORAGE_KEY, detected);
    }
    
    setIsReady(true);
  }, []);

  const setCurrency = useCallback((newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
    }
  }, []);

  return {
    currency,
    corePricing: getCorePricing(currency),
    teacherPricing: getTeacherPricing(currency),
    setCurrency,
    isReady,
  };
}
