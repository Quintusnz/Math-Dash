'use client';

import { useCurrency } from '@/lib/hooks/useCurrency';

interface LocalizedPriceProps {
  /** What to show while loading */
  fallback?: string;
  /** Custom class name */
  className?: string;
}

/**
 * Client component that displays the localized price based on user's detected currency
 */
export function LocalizedPrice({ fallback = '$6.99', className }: LocalizedPriceProps) {
  const { corePricing, isReady } = useCurrency();
  
  if (!isReady) {
    return <span className={className}>{fallback}</span>;
  }
  
  return <span className={className}>{corePricing.displayPrice}</span>;
}

/**
 * Client component that displays the localized teacher price
 */
export function LocalizedTeacherPrice({ fallback = '$19.99', className }: LocalizedPriceProps) {
  const { teacherPricing, isReady } = useCurrency();
  
  if (!isReady) {
    return <span className={className}>{fallback}</span>;
  }
  
  return <span className={className}>{teacherPricing.displayPrice}</span>;
}
