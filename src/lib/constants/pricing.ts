/**
 * Regional Pricing Configuration for Math Dash
 * 
 * Tier 1 Markets: US, UK, EU, Australia, New Zealand
 * - These markets receive primary support with localized pricing
 * - All prices are one-time purchases (no subscription)
 */

export type CurrencyCode = 'USD' | 'GBP' | 'EUR' | 'AUD' | 'NZD';

export interface PricingTier {
  currency: CurrencyCode;
  symbol: string;
  /** Price in cents/pence (smallest currency unit) */
  amountCents: number;
  /** Formatted display price */
  displayPrice: string;
  /** Locale codes that map to this currency */
  locales: string[];
  /** Country codes that map to this currency */
  countries: string[];
}

export interface ProductPricing {
  core: PricingTier;
  teacher: PricingTier;
}

/**
 * Core Unlock (Home/Family License) - One-time purchase
 * Unlocks all topics, adaptive mode, unlimited profiles
 */
export const CORE_PRICING: Record<CurrencyCode, PricingTier> = {
  USD: {
    currency: 'USD',
    symbol: '$',
    amountCents: 699,
    displayPrice: '$6.99',
    locales: ['en-US'],
    countries: ['US'],
  },
  GBP: {
    currency: 'GBP',
    symbol: '£',
    amountCents: 599,
    displayPrice: '£5.99',
    locales: ['en-GB'],
    countries: ['GB', 'UK'],
  },
  EUR: {
    currency: 'EUR',
    symbol: '€',
    amountCents: 699,
    displayPrice: '€6.99',
    locales: ['de-DE', 'fr-FR', 'es-ES', 'it-IT', 'nl-NL', 'pt-PT', 'de', 'fr', 'es', 'it', 'nl', 'pt'],
    countries: ['DE', 'FR', 'ES', 'IT', 'NL', 'PT', 'AT', 'BE', 'IE', 'FI', 'GR', 'LU'],
  },
  AUD: {
    currency: 'AUD',
    symbol: 'A$',
    amountCents: 1099,
    displayPrice: 'A$10.99',
    locales: ['en-AU'],
    countries: ['AU'],
  },
  NZD: {
    currency: 'NZD',
    symbol: 'NZ$',
    amountCents: 1199,
    displayPrice: 'NZ$11.99',
    locales: ['en-NZ'],
    countries: ['NZ'],
  },
};

/**
 * Teacher/Small-School License - One-time purchase per teacher
 * Unlocks class codes, dashboards, multi-class management
 */
export const TEACHER_PRICING: Record<CurrencyCode, PricingTier> = {
  USD: {
    currency: 'USD',
    symbol: '$',
    amountCents: 1999,
    displayPrice: '$19.99',
    locales: ['en-US'],
    countries: ['US'],
  },
  GBP: {
    currency: 'GBP',
    symbol: '£',
    amountCents: 1799,
    displayPrice: '£17.99',
    locales: ['en-GB'],
    countries: ['GB', 'UK'],
  },
  EUR: {
    currency: 'EUR',
    symbol: '€',
    amountCents: 1999,
    displayPrice: '€19.99',
    locales: ['de-DE', 'fr-FR', 'es-ES', 'it-IT', 'nl-NL', 'pt-PT', 'de', 'fr', 'es', 'it', 'nl', 'pt'],
    countries: ['DE', 'FR', 'ES', 'IT', 'NL', 'PT', 'AT', 'BE', 'IE', 'FI', 'GR', 'LU'],
  },
  AUD: {
    currency: 'AUD',
    symbol: 'A$',
    amountCents: 2999,
    displayPrice: 'A$29.99',
    locales: ['en-AU'],
    countries: ['AU'],
  },
  NZD: {
    currency: 'NZD',
    symbol: 'NZ$',
    amountCents: 3299,
    displayPrice: 'NZ$32.99',
    locales: ['en-NZ'],
    countries: ['NZ'],
  },
};

/**
 * Default currency for fallback
 */
export const DEFAULT_CURRENCY: CurrencyCode = 'USD';

/**
 * Tier 1 supported currencies
 */
export const TIER_1_CURRENCIES: CurrencyCode[] = ['USD', 'GBP', 'EUR', 'AUD', 'NZD'];

/**
 * Detect currency from browser locale
 */
export function detectCurrencyFromLocale(locale?: string): CurrencyCode {
  const browserLocale = locale || (typeof navigator !== 'undefined' ? navigator.language : 'en-US');
  
  // Direct match first (e.g., en-NZ -> NZD)
  for (const [currency, tier] of Object.entries(CORE_PRICING)) {
    if (tier.locales.some(l => browserLocale.toLowerCase() === l.toLowerCase())) {
      return currency as CurrencyCode;
    }
  }
  
  // Check if browser locale starts with any of our locale patterns
  for (const [currency, tier] of Object.entries(CORE_PRICING)) {
    if (tier.locales.some(l => browserLocale.toLowerCase().startsWith(l.toLowerCase()))) {
      return currency as CurrencyCode;
    }
  }
  
  // Try to match by language prefix for EUR countries
  const langPrefix = browserLocale.split('-')[0];
  if (['de', 'fr', 'es', 'it', 'nl', 'pt'].includes(langPrefix)) {
    return 'EUR';
  }
  
  return DEFAULT_CURRENCY;
}

/**
 * Detect currency from country code (for IP-based detection)
 */
export function detectCurrencyFromCountry(countryCode?: string): CurrencyCode {
  if (!countryCode) return DEFAULT_CURRENCY;
  
  const upperCountry = countryCode.toUpperCase();
  
  for (const [currency, tier] of Object.entries(CORE_PRICING)) {
    if (tier.countries.includes(upperCountry)) {
      return currency as CurrencyCode;
    }
  }
  
  return DEFAULT_CURRENCY;
}

/**
 * Get pricing for a specific currency
 */
export function getCorePricing(currency: CurrencyCode = DEFAULT_CURRENCY): PricingTier {
  return CORE_PRICING[currency] || CORE_PRICING[DEFAULT_CURRENCY];
}

/**
 * Get teacher pricing for a specific currency
 */
export function getTeacherPricing(currency: CurrencyCode = DEFAULT_CURRENCY): PricingTier {
  return TEACHER_PRICING[currency] || TEACHER_PRICING[DEFAULT_CURRENCY];
}

/**
 * Format price for display with currency
 */
export function formatPrice(amountCents: number, currency: CurrencyCode): string {
  const tier = CORE_PRICING[currency];
  const amount = amountCents / 100;
  
  // Use Intl.NumberFormat for proper formatting
  try {
    return new Intl.NumberFormat(tier.locales[0] || 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch {
    return `${tier.symbol}${amount.toFixed(2)}`;
  }
}
