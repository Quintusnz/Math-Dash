'use client';

import { useState, useCallback, useRef, KeyboardEvent } from 'react';
import { type CountryCode } from '@/lib/constants/curriculum-data';
import { COUNTRY_METADATA } from '@/lib/constants/country-config';
import styles from './CountrySelector.module.css';

export interface CountrySelectorProps {
  /** Currently selected country (controlled mode) */
  value?: CountryCode | 'skip' | null;
  /** Callback when selection changes */
  onChange?: (country: CountryCode | 'skip') => void;
  /** Default value for uncontrolled mode */
  defaultValue?: CountryCode | 'skip' | null;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Accessible label for the group */
  'aria-label'?: string;
}

interface CountryOption {
  code: CountryCode | 'skip';
  label: string;
  flag: string;
}

const COUNTRY_OPTIONS: CountryOption[] = [
  { code: 'NZ', label: COUNTRY_METADATA.NZ.label, flag: COUNTRY_METADATA.NZ.flagEmoji },
  { code: 'AU', label: COUNTRY_METADATA.AU.label, flag: COUNTRY_METADATA.AU.flagEmoji },
  { code: 'UK', label: COUNTRY_METADATA.UK.label, flag: COUNTRY_METADATA.UK.flagEmoji },
  { code: 'US', label: COUNTRY_METADATA.US.label, flag: COUNTRY_METADATA.US.flagEmoji },
  { code: 'CA', label: COUNTRY_METADATA.CA.label, flag: COUNTRY_METADATA.CA.flagEmoji },
  { code: 'skip', label: "I'm not sure", flag: '🌍' },
];

/**
 * CountrySelector - A reusable country selection component for curriculum alignment.
 * 
 * Displays countries in a 2x3 grid with flag emojis. Supports both controlled
 * and uncontrolled modes, keyboard navigation, and accessibility.
 */
export function CountrySelector({
  value,
  onChange,
  defaultValue = null,
  disabled = false,
  className,
  'aria-label': ariaLabel = 'Select your country',
}: CountrySelectorProps) {
  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState<CountryCode | 'skip' | null>(defaultValue);
  
  // Determine if we're in controlled mode
  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalValue;
  
  // Refs for keyboard navigation
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleSelect = useCallback((code: CountryCode | 'skip') => {
    if (disabled) return;
    
    if (!isControlled) {
      setInternalValue(code);
    }
    onChange?.(code);
  }, [disabled, isControlled, onChange]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    const currentIndex = buttonRefs.current.findIndex(
      (btn) => btn === document.activeElement
    );

    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % COUNTRY_OPTIONS.length;
        event.preventDefault();
        break;
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + COUNTRY_OPTIONS.length) % COUNTRY_OPTIONS.length;
        event.preventDefault();
        break;
      case 'ArrowDown':
        // Move down in the 2-column grid
        nextIndex = currentIndex + 2;
        if (nextIndex >= COUNTRY_OPTIONS.length) {
          nextIndex = currentIndex % 2; // Wrap to top of same column
        }
        event.preventDefault();
        break;
      case 'ArrowUp':
        // Move up in the 2-column grid
        nextIndex = currentIndex - 2;
        if (nextIndex < 0) {
          // Wrap to bottom of same column
          nextIndex = COUNTRY_OPTIONS.length - (2 - (currentIndex % 2));
          if (nextIndex >= COUNTRY_OPTIONS.length) {
            nextIndex = COUNTRY_OPTIONS.length - 1;
          }
        }
        event.preventDefault();
        break;
      case 'Enter':
      case ' ':
        if (currentIndex >= 0) {
          handleSelect(COUNTRY_OPTIONS[currentIndex].code);
        }
        event.preventDefault();
        break;
      default:
        return;
    }

    buttonRefs.current[nextIndex]?.focus();
  }, [disabled, handleSelect]);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className || ''}`}
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.grid}>
        {COUNTRY_OPTIONS.map((option, index) => {
          const isSelected = selectedValue === option.code;
          const isSkipOption = option.code === 'skip';
          
          return (
            <button
              key={option.code}
              ref={(el) => { buttonRefs.current[index] = el; }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => handleSelect(option.code)}
              className={`
                ${styles.countryButton}
                ${isSelected ? styles.selected : ''}
                ${isSkipOption ? styles.skipOption : ''}
                ${disabled ? styles.disabled : ''}
              `.trim().replace(/\s+/g, ' ')}
              tabIndex={isSelected || (selectedValue === null && index === 0) ? 0 : -1}
            >
              <span className={styles.flag} aria-hidden="true">
                {option.flag}
              </span>
              <span className={styles.label}>
                {option.label}
              </span>
              {isSelected && (
                <span className={styles.checkmark} aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CountrySelector;
