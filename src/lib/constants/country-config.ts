/**
 * Math Dash - Country Configuration
 * 
 * This file contains country-specific configuration for:
 * - Age band to year/grade mappings
 * - Country metadata (flag, labels, terminology)
 * - Year/grade display labels
 * 
 * @see Docs/Cirriculum for the full research and specification
 */

import { type CountryCode } from './curriculum-data';

// ============================================================================
// Type Definitions
// ============================================================================

export type AgeBand = '5-6' | '6-7' | '7-8' | '8-9' | '9-10' | '10-11' | '11-12' | '12-13';

export interface YearGradeOption {
  key: string;      // e.g., 'Y3', 'G2', 'K'
  label: string;    // e.g., 'Year 3', 'Grade 2', 'Kindergarten'
  ageRange: string; // e.g., '7-8'
}

export interface CountryMetadata {
  code: CountryCode;
  label: string;
  flagEmoji: string;
  systemType: 'year' | 'grade';
  terminology: {
    levelPrefix: string;     // 'Year' or 'Grade'
    kindergartenLabel?: string; // For US: 'Kindergarten'
    foundationLabel?: string;   // For AU: 'Foundation'
  };
  yearGradeOptions: YearGradeOption[];
}

// ============================================================================
// Country Metadata
// ============================================================================

export const COUNTRY_METADATA: Record<CountryCode, CountryMetadata> = {
  NZ: {
    code: 'NZ',
    label: 'New Zealand',
    flagEmoji: '🇳🇿',
    systemType: 'year',
    terminology: {
      levelPrefix: 'Year',
    },
    yearGradeOptions: [
      { key: 'Y1', label: 'Year 1', ageRange: '5-6' },
      { key: 'Y2', label: 'Year 2', ageRange: '6-7' },
      { key: 'Y3', label: 'Year 3', ageRange: '7-8' },
      { key: 'Y4', label: 'Year 4', ageRange: '8-9' },
      { key: 'Y5', label: 'Year 5', ageRange: '9-10' },
      { key: 'Y6', label: 'Year 6', ageRange: '10-11' },
      { key: 'Y7', label: 'Year 7', ageRange: '11-12' },
      { key: 'Y8', label: 'Year 8', ageRange: '12-13' },
    ],
  },

  AU: {
    code: 'AU',
    label: 'Australia',
    flagEmoji: '🇦🇺',
    systemType: 'year',
    terminology: {
      levelPrefix: 'Year',
      foundationLabel: 'Foundation',
    },
    yearGradeOptions: [
      { key: 'F', label: 'Foundation', ageRange: '5-6' },
      { key: 'Y1', label: 'Year 1', ageRange: '6-7' },
      { key: 'Y2', label: 'Year 2', ageRange: '7-8' },
      { key: 'Y3', label: 'Year 3', ageRange: '8-9' },
      { key: 'Y4', label: 'Year 4', ageRange: '9-10' },
      { key: 'Y5', label: 'Year 5', ageRange: '10-11' },
      { key: 'Y6', label: 'Year 6', ageRange: '11-12' },
    ],
  },

  UK: {
    code: 'UK',
    label: 'United Kingdom',
    flagEmoji: '🇬🇧',
    systemType: 'year',
    terminology: {
      levelPrefix: 'Year',
    },
    yearGradeOptions: [
      { key: 'Y1', label: 'Year 1', ageRange: '5-6' },
      { key: 'Y2', label: 'Year 2', ageRange: '6-7' },
      { key: 'Y3', label: 'Year 3', ageRange: '7-8' },
      { key: 'Y4', label: 'Year 4', ageRange: '8-9' },
      { key: 'Y5', label: 'Year 5', ageRange: '9-10' },
      { key: 'Y6', label: 'Year 6', ageRange: '10-11' },
    ],
  },

  US: {
    code: 'US',
    label: 'United States',
    flagEmoji: '🇺🇸',
    systemType: 'grade',
    terminology: {
      levelPrefix: 'Grade',
      kindergartenLabel: 'Kindergarten',
    },
    yearGradeOptions: [
      { key: 'K', label: 'Kindergarten', ageRange: '5-6' },
      { key: 'G1', label: 'Grade 1', ageRange: '6-7' },
      { key: 'G2', label: 'Grade 2', ageRange: '7-8' },
      { key: 'G3', label: 'Grade 3', ageRange: '8-9' },
      { key: 'G4', label: 'Grade 4', ageRange: '9-10' },
      { key: 'G5', label: 'Grade 5', ageRange: '10-11' },
    ],
  },

  CA: {
    code: 'CA',
    label: 'Canada (Ontario)',
    flagEmoji: '🇨🇦',
    systemType: 'grade',
    terminology: {
      levelPrefix: 'Grade',
      kindergartenLabel: 'Kindergarten',
    },
    yearGradeOptions: [
      { key: 'K', label: 'Kindergarten', ageRange: '5-6' },
      { key: 'G1', label: 'Grade 1', ageRange: '6-7' },
      { key: 'G2', label: 'Grade 2', ageRange: '7-8' },
      { key: 'G3', label: 'Grade 3', ageRange: '8-9' },
      { key: 'G4', label: 'Grade 4', ageRange: '9-10' },
      { key: 'G5', label: 'Grade 5', ageRange: '10-11' },
      { key: 'G6', label: 'Grade 6', ageRange: '11-12' },
    ],
  },
};

// ============================================================================
// Age-to-Year Mapping
// ============================================================================

/**
 * Age band to year/grade key mapping per country.
 * Returns the most likely year/grade for a given age band.
 */
const AGE_TO_YEAR_MAP: Record<CountryCode, Record<AgeBand, string>> = {
  NZ: {
    '5-6': 'Y1',
    '6-7': 'Y2',
    '7-8': 'Y3',
    '8-9': 'Y4',
    '9-10': 'Y5',
    '10-11': 'Y6',
    '11-12': 'Y7',
    '12-13': 'Y8',
  },
  AU: {
    '5-6': 'F',
    '6-7': 'Y1',
    '7-8': 'Y2',
    '8-9': 'Y3',
    '9-10': 'Y4',
    '10-11': 'Y5',
    '11-12': 'Y6',
    '12-13': 'Y6', // Primary typically ends at Y6
  },
  UK: {
    '5-6': 'Y1',
    '6-7': 'Y2',
    '7-8': 'Y3',
    '8-9': 'Y4',
    '9-10': 'Y5',
    '10-11': 'Y6',
    '11-12': 'Y6', // UK primary ends at Y6
    '12-13': 'Y6',
  },
  US: {
    '5-6': 'K',
    '6-7': 'G1',
    '7-8': 'G2',
    '8-9': 'G3',
    '9-10': 'G4',
    '10-11': 'G5',
    '11-12': 'G5', // US elementary typically ends at G5
    '12-13': 'G5',
  },
  CA: {
    '5-6': 'K',
    '6-7': 'G1',
    '7-8': 'G2',
    '8-9': 'G3',
    '9-10': 'G4',
    '10-11': 'G5',
    '11-12': 'G6',
    '12-13': 'G6',
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get country metadata by code
 */
export function getCountryMetadata(country: CountryCode): CountryMetadata {
  return COUNTRY_METADATA[country];
}

/**
 * Get the country label (e.g., 'New Zealand')
 */
export function getCountryLabel(country: CountryCode): string {
  return COUNTRY_METADATA[country].label;
}

/**
 * Get the country flag emoji (e.g., '\u{1F1F3}\u{1F1FF}')
 */
export function getCountryFlag(country: CountryCode): string {
  return COUNTRY_METADATA[country].flagEmoji;
}

/**
 * Get the year/grade label for a country and year key
 * e.g., getYearLabel('NZ', 'Y3') => 'Year 3'
 */
export function getYearLabel(country: CountryCode, yearGrade: string): string {
  const option = COUNTRY_METADATA[country].yearGradeOptions.find(
    (opt) => opt.key === yearGrade
  );
  return option?.label ?? yearGrade;
}

/**
 * Get the default year/grade for a country (first option in the list)
 * Used as fallback when age band mapping is unavailable
 */
function getDefaultYearGrade(country: CountryCode): string {
  const options = COUNTRY_METADATA[country]?.yearGradeOptions;
  return options?.[0]?.key ?? 'Y1';
}

/**
 * Get the recommended year/grade for a given age band and country
 * e.g., deriveYearFromAge('NZ', '7-8') => 'Y3'
 * e.g., deriveYearFromAge('US', '5-6') => 'K'
 * 
 * Falls back to country-appropriate default if age band not found.
 */
export function deriveYearFromAge(country: CountryCode, ageBand: AgeBand): string {
  return AGE_TO_YEAR_MAP[country]?.[ageBand] ?? getDefaultYearGrade(country);
}

/**
 * Get all year/grade options for a country
 */
export function getYearGradeOptions(country: CountryCode): YearGradeOption[] {
  return COUNTRY_METADATA[country].yearGradeOptions;
}

/**
 * Get year/grade options that match a specific age band
 */
export function getYearGradeOptionsForAge(
  country: CountryCode,
  ageBand: AgeBand
): YearGradeOption[] {
  return COUNTRY_METADATA[country].yearGradeOptions.filter(
    (opt) => opt.ageRange === ageBand
  );
}

/**
 * Get the recommended year/grade option for a given age band
 * Returns the option object with key, label, and ageRange
 */
export function getRecommendedYearGrade(
  country: CountryCode,
  ageBand: AgeBand
): YearGradeOption | undefined {
  const key = deriveYearFromAge(country, ageBand);
  return COUNTRY_METADATA[country].yearGradeOptions.find((opt) => opt.key === key);
}

/**
 * Format a year/grade for display with country context
 * e.g., formatYearGradeWithCountry('NZ', 'Y3') => 'Year 3, New Zealand'
 */
export function formatYearGradeWithCountry(
  country: CountryCode,
  yearGrade: string
): string {
  const countryLabel = getCountryLabel(country);
  const yearLabel = getYearLabel(country, yearGrade);
  return `${yearLabel}, ${countryLabel}`;
}

/**
 * Get all supported countries as an array
 */
export function getAllCountries(): CountryMetadata[] {
  return Object.values(COUNTRY_METADATA);
}

/**
 * Check if a country code is valid
 */
export function isValidCountryCode(code: string): code is CountryCode {
  return code in COUNTRY_METADATA;
}

/**
 * Check if a year/grade key is valid for a country
 */
export function isValidYearGrade(country: CountryCode, yearGrade: string): boolean {
  return COUNTRY_METADATA[country].yearGradeOptions.some(
    (opt) => opt.key === yearGrade
  );
}

/**
 * Get the age range string for a year/grade
 * e.g., getAgeRangeForYear('NZ', 'Y3') => '7-8'
 */
export function getAgeRangeForYear(
  country: CountryCode,
  yearGrade: string
): string | undefined {
  const option = COUNTRY_METADATA[country].yearGradeOptions.find(
    (opt) => opt.key === yearGrade
  );
  return option?.ageRange;
}



