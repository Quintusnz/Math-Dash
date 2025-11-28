/**
 * Premium Access Hook
 * 
 * Provides access to premium status with dev mode override for testing.
 * 
 * DEV MODE:
 * - In development, you can override premium status via localStorage
 * - Set localStorage.setItem('dev_premium_override', 'true') to force premium
 * - Set localStorage.setItem('dev_premium_override', 'false') to force free tier
 * - Remove the key to use actual database value
 * 
 * You can also toggle this from the browser console:
 *   window.__devSetPremium(true)   // Force premium
 *   window.__devSetPremium(false)  // Force free tier
 *   window.__devSetPremium(null)   // Use actual value
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useEffect, useState, useCallback } from 'react';

const DEV_OVERRIDE_KEY = 'dev_premium_override';

// Extend window type for dev helper
declare global {
  interface Window {
    __devSetPremium: (value: boolean | null) => void;
    __devGetPremiumStatus: () => { override: string | null; actual: boolean | undefined; effective: boolean };
  }
}

export interface PremiumStatus {
  /** Whether user has premium access (considering dev override) */
  isPremium: boolean;
  /** The actual database value (ignoring dev override) */
  actualPremium: boolean | undefined;
  /** Whether dev override is currently active */
  isDevOverride: boolean;
  /** Current dev override value (null if not set) */
  devOverrideValue: boolean | null;
  /** Loading state */
  isLoading: boolean;
  /** Set dev override (dev mode only) */
  setDevOverride: (value: boolean | null) => void;
}

export function usePremiumAccess(): PremiumStatus {
  const settings = useLiveQuery(() => db.globalSettings.get('default'));
  const [devOverride, setDevOverrideState] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  // Read dev override from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(DEV_OVERRIDE_KEY);
    if (stored === 'true') {
      setDevOverrideState(true);
    } else if (stored === 'false') {
      setDevOverrideState(false);
    } else {
      setDevOverrideState(null);
    }
  }, []);

  // Set up global dev helper functions
  const setDevOverride = useCallback((value: boolean | null) => {
    if (value === null) {
      localStorage.removeItem(DEV_OVERRIDE_KEY);
      setDevOverrideState(null);
      console.log('🔧 Dev premium override cleared - using actual database value');
    } else {
      localStorage.setItem(DEV_OVERRIDE_KEY, String(value));
      setDevOverrideState(value);
      console.log(`🔧 Dev premium override set to: ${value ? 'PREMIUM' : 'FREE TIER'}`);
    }
  }, []);

  // Expose global helpers for console access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__devSetPremium = setDevOverride;
      window.__devGetPremiumStatus = () => ({
        override: localStorage.getItem(DEV_OVERRIDE_KEY),
        actual: settings?.isPremium,
        effective: devOverride !== null ? devOverride : (settings?.isPremium ?? false)
      });
    }
  }, [setDevOverride, settings?.isPremium, devOverride]);

  // Determine effective premium status
  const actualPremium = settings?.isPremium;
  const isDevOverride = devOverride !== null;
  const isPremium = devOverride !== null ? devOverride : (actualPremium ?? false);

  return {
    isPremium,
    actualPremium,
    isDevOverride,
    devOverrideValue: devOverride,
    isLoading: !mounted || settings === undefined,
    setDevOverride
  };
}

/**
 * Simple hook that just returns boolean premium status
 * Use this when you don't need the full status object
 */
export function useIsPremium(): boolean {
  const { isPremium } = usePremiumAccess();
  return isPremium;
}
