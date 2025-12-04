'use client';

import { useState, useMemo, useCallback, useRef, KeyboardEvent } from 'react';
import { type CountryCode } from '@/lib/constants/curriculum-data';
import { 
  COUNTRY_METADATA, 
  deriveYearFromAge,
  type AgeBand,
  type YearGradeOption 
} from '@/lib/constants/country-config';
import styles from './YearGradeSelector.module.css';

export interface YearGradeSelectorProps {
  /** The country to show year/grade options for */
  country: CountryCode;
  /** Currently selected year/grade key (controlled mode) */
  value?: string | null;
  /** Callback when selection changes */
  onChange?: (yearGrade: string) => void;
  /** Profile's age band for auto-selection and recommendation */
  ageBand?: string | null;
  /** Default value for uncontrolled mode */
  defaultValue?: string | null;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Whether to auto-select based on ageBand when first rendered */
  autoSelect?: boolean;
  /** Accessible label for the group */
  'aria-label'?: string;
}

/**
 * Formats age range for display
 * e.g., '7-8' => '7-8 years'
 */
function formatAgeHint(ageRange: string): string {
  return `${ageRange} years`;
}

/**
 * YearGradeSelector - A year/grade selection component that adapts to the selected country.
 * 
 * Displays country-appropriate year/grade levels (Year 1, Grade 1, Kindergarten, etc.)
 * with age range hints. Highlights the recommended option based on profile's age band.
 */
export function YearGradeSelector({
  country,
  value,
  onChange,
  ageBand,
  defaultValue = null,
  disabled = false,
  className,
  autoSelect = true,
  'aria-label': ariaLabel = 'Select your year or grade level',
}: YearGradeSelectorProps) {
  // Get year/grade options for the selected country (memoized)
  const countryMeta = COUNTRY_METADATA[country];
  const options: YearGradeOption[] = useMemo(
    () => countryMeta?.yearGradeOptions ?? [],
    [countryMeta]
  );
  
  // Calculate recommended year/grade based on age band
  const recommendedKey = ageBand 
    ? deriveYearFromAge(country, ageBand as AgeBand) 
    : null;

  // Compute initial value: auto-select recommended if appropriate
  const computeInitialValue = useCallback((): string | null => {
    if (autoSelect && !defaultValue && recommendedKey) {
      return recommendedKey;
    }
    return defaultValue;
  }, [autoSelect, defaultValue, recommendedKey]);

  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState<string | null>(computeInitialValue);

  // Determine if we're in controlled mode
  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalValue;

  // Refs for keyboard navigation
  const containerRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleSelect = useCallback((key: string) => {
    if (disabled) return;
    
    if (!isControlled) {
      setInternalValue(key);
    }
    onChange?.(key);
  }, [disabled, isControlled, onChange]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    const currentIndex = optionRefs.current.findIndex(
      (opt) => opt === document.activeElement
    );

    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        nextIndex = (currentIndex + 1) % options.length;
        event.preventDefault();
        break;
      case 'ArrowUp':
        nextIndex = (currentIndex - 1 + options.length) % options.length;
        event.preventDefault();
        break;
      case 'Home':
        nextIndex = 0;
        event.preventDefault();
        break;
      case 'End':
        nextIndex = options.length - 1;
        event.preventDefault();
        break;
      case 'Enter':
      case ' ':
        if (currentIndex >= 0) {
          handleSelect(options[currentIndex].key);
        }
        event.preventDefault();
        break;
      default:
        return;
    }

    optionRefs.current[nextIndex]?.focus();
  }, [disabled, options, handleSelect]);

  if (!countryMeta || options.length === 0) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <p className={styles.noOptions}>
          No year/grade options available for this country.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className || ''}`}
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.optionsList}>
        {options.map((option, index) => {
          const isSelected = selectedValue === option.key;
          const isRecommended = recommendedKey === option.key;

          return (
            <button
              key={option.key}
              ref={(el) => { optionRefs.current[index] = el; }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => handleSelect(option.key)}
              className={`
                ${styles.optionButton}
                ${isSelected ? styles.selected : ''}
                ${isRecommended && !isSelected ? styles.recommended : ''}
                ${disabled ? styles.disabled : ''}
              `.trim().replace(/\s+/g, ' ')}
              tabIndex={isSelected || (selectedValue === null && index === 0) ? 0 : -1}
            >
              <span className={styles.radioIndicator}>
                <span className={styles.radioInner} />
              </span>
              <span className={styles.optionContent}>
                <span className={styles.optionLabel}>
                  {option.label}
                </span>
                <span className={styles.ageHint}>
                  {formatAgeHint(option.ageRange)}
                </span>
              </span>
              {isRecommended && (
                <span className={styles.recommendedBadge} aria-label="Recommended based on age">
                  Recommended
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default YearGradeSelector;
