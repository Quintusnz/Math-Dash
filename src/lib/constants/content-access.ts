/**
 * Content Access Configuration
 * 
 * Defines which content is available in free vs premium tiers.
 * 
 * FREE TIER includes:
 * - Multiplication: 1×, 2×, 3×, 4× tables
 * - Division: ÷1, ÷2, ÷3, ÷4
 * - Addition: Starter zone only (0-10)
 * - Subtraction: Starter zone only (0-10)
 * 
 * PREMIUM (Core Unlock $6.99) includes:
 * - All times tables (5-12)
 * - All division (÷5 through ÷12)
 * - All addition zones (up to 100)
 * - All subtraction zones (up to 100)
 */

import type { RangePreset, Operation } from '@/lib/stores/useGameStore';

// Which times tables / divisors are free (1-4 are foundational)
export const FREE_NUMBERS: number[] = [1, 2, 3, 4];

// All available numbers (1-12)
export const ALL_NUMBERS: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// Premium numbers (everything not in FREE_NUMBERS)
export const PREMIUM_NUMBERS: number[] = ALL_NUMBERS.filter(n => !FREE_NUMBERS.includes(n));

// Which range presets are free for addition/subtraction
export const FREE_RANGE_PRESETS: RangePreset[] = ['starter']; // Only 0-10

// All range presets
export const ALL_RANGE_PRESETS: RangePreset[] = ['starter', 'builder', 'challenge', 'pro', 'custom'];

// Premium range presets
export const PREMIUM_RANGE_PRESETS: RangePreset[] = ['builder', 'challenge', 'pro', 'custom'];

/**
 * Check if a specific number (times table / divisor) is locked for free users
 */
export function isNumberLocked(num: number, isPremium: boolean): boolean {
  if (isPremium) return false;
  return PREMIUM_NUMBERS.includes(num);
}

/**
 * Check if a range preset is locked for free users
 */
export function isRangePresetLocked(preset: RangePreset, isPremium: boolean): boolean {
  if (isPremium) return false;
  return PREMIUM_RANGE_PRESETS.includes(preset);
}

/**
 * Get all available numbers for an operation based on premium status
 */
export function getAvailableNumbers(isPremium: boolean): number[] {
  return isPremium ? ALL_NUMBERS : FREE_NUMBERS;
}

/**
 * Get all available range presets based on premium status
 */
export function getAvailableRangePresets(isPremium: boolean): RangePreset[] {
  return isPremium ? ALL_RANGE_PRESETS : FREE_RANGE_PRESETS;
}

/**
 * Check if any selected numbers are locked
 */
export function hasLockedNumbers(selectedNumbers: number[], isPremium: boolean): boolean {
  if (isPremium) return false;
  return selectedNumbers.some(num => PREMIUM_NUMBERS.includes(num));
}

/**
 * Filter out locked numbers from selection
 */
export function filterLockedNumbers(selectedNumbers: number[], isPremium: boolean): number[] {
  if (isPremium) return selectedNumbers;
  return selectedNumbers.filter(num => FREE_NUMBERS.includes(num));
}

/**
 * Content descriptions for upgrade prompts
 */
export const PREMIUM_CONTENT_DESCRIPTIONS = {
  multiplication: 'Unlock all times tables (×1 through ×12)',
  division: 'Unlock all division facts (÷1 through ÷12)', 
  addition: 'Unlock higher number zones (up to 100)',
  subtraction: 'Unlock higher number zones (up to 100)',
  general: 'Get access to all math content with Premium'
} as const;

/**
 * Get description for what premium unlocks for a specific operation
 */
export function getPremiumDescription(operation: Operation): string {
  return PREMIUM_CONTENT_DESCRIPTIONS[operation] || PREMIUM_CONTENT_DESCRIPTIONS.general;
}
