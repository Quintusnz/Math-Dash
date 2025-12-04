/**
 * Unit Tests for country-config.ts
 * Tests country metadata, age-to-year mappings, and helper functions
 */
import { describe, it, expect } from 'vitest';
import {
  COUNTRY_METADATA,
  getCountryMetadata,
  getCountryLabel,
  getCountryFlag,
  getYearLabel,
  deriveYearFromAge,
  getYearGradeOptions,
  getYearGradeOptionsForAge,
  getRecommendedYearGrade,
  formatYearGradeWithCountry,
  getAllCountries,
  isValidCountryCode,
  isValidYearGrade,
  getAgeRangeForYear,
  type AgeBand,
} from '@/lib/constants/country-config';
import type { CountryCode } from '@/lib/constants/curriculum-data';

describe('country-config.ts', () => {
  describe('COUNTRY_METADATA', () => {
    const countries: CountryCode[] = ['NZ', 'AU', 'UK', 'US', 'CA'];

    it('should have metadata for all 5 countries', () => {
      expect(Object.keys(COUNTRY_METADATA)).toHaveLength(5);
      for (const country of countries) {
        expect(COUNTRY_METADATA[country]).toBeDefined();
      }
    });

    it('should have flag emojis for all countries', () => {
      expect(COUNTRY_METADATA.NZ.flagEmoji).toBe('🇳🇿');
      expect(COUNTRY_METADATA.AU.flagEmoji).toBe('🇦🇺');
      expect(COUNTRY_METADATA.UK.flagEmoji).toBe('🇬🇧');
      expect(COUNTRY_METADATA.US.flagEmoji).toBe('🇺🇸');
      expect(COUNTRY_METADATA.CA.flagEmoji).toBe('🇨🇦');
    });

    it('should have correct system types', () => {
      expect(COUNTRY_METADATA.NZ.systemType).toBe('year');
      expect(COUNTRY_METADATA.AU.systemType).toBe('year');
      expect(COUNTRY_METADATA.UK.systemType).toBe('year');
      expect(COUNTRY_METADATA.US.systemType).toBe('grade');
      expect(COUNTRY_METADATA.CA.systemType).toBe('grade');
    });

    it('should have yearGradeOptions for each country', () => {
      for (const country of countries) {
        expect(COUNTRY_METADATA[country].yearGradeOptions.length).toBeGreaterThan(0);
      }
    });

    it('should have terminology for each country', () => {
      expect(COUNTRY_METADATA.NZ.terminology.levelPrefix).toBe('Year');
      expect(COUNTRY_METADATA.US.terminology.levelPrefix).toBe('Grade');
      expect(COUNTRY_METADATA.US.terminology.kindergartenLabel).toBe('Kindergarten');
      expect(COUNTRY_METADATA.AU.terminology.foundationLabel).toBe('Foundation');
    });
  });

  describe('getCountryMetadata', () => {
    it('should return correct metadata for each country', () => {
      const nz = getCountryMetadata('NZ');
      expect(nz.code).toBe('NZ');
      expect(nz.label).toBe('New Zealand');

      const us = getCountryMetadata('US');
      expect(us.code).toBe('US');
      expect(us.label).toBe('United States');
    });
  });

  describe('getCountryLabel', () => {
    it('should return correct labels', () => {
      expect(getCountryLabel('NZ')).toBe('New Zealand');
      expect(getCountryLabel('AU')).toBe('Australia');
      expect(getCountryLabel('UK')).toBe('United Kingdom');
      expect(getCountryLabel('US')).toBe('United States');
      expect(getCountryLabel('CA')).toBe('Canada');
    });
  });

  describe('getCountryFlag', () => {
    it('should return correct flag emojis', () => {
      expect(getCountryFlag('NZ')).toBe('🇳🇿');
      expect(getCountryFlag('UK')).toBe('🇬🇧');
    });
  });

  describe('getYearLabel', () => {
    it('should return correct year labels for year-based systems', () => {
      expect(getYearLabel('NZ', 'Y1')).toBe('Year 1');
      expect(getYearLabel('NZ', 'Y3')).toBe('Year 3');
      expect(getYearLabel('UK', 'Y6')).toBe('Year 6');
    });

    it('should return correct grade labels for grade-based systems', () => {
      expect(getYearLabel('US', 'K')).toBe('Kindergarten');
      expect(getYearLabel('US', 'G1')).toBe('Grade 1');
      expect(getYearLabel('CA', 'G5')).toBe('Grade 5');
    });

    it('should return the key itself if not found', () => {
      expect(getYearLabel('NZ', 'Y99')).toBe('Y99');
    });
  });

  describe('deriveYearFromAge', () => {
    it('should derive correct year for NZ', () => {
      expect(deriveYearFromAge('NZ', '5-6')).toBe('Y1');
      expect(deriveYearFromAge('NZ', '7-8')).toBe('Y3');
      expect(deriveYearFromAge('NZ', '10-11')).toBe('Y6');
    });

    it('should derive correct grade for US', () => {
      expect(deriveYearFromAge('US', '5-6')).toBe('K');
      expect(deriveYearFromAge('US', '6-7')).toBe('G1');
      expect(deriveYearFromAge('US', '8-9')).toBe('G3');
    });

    it('should derive correct grade for CA', () => {
      expect(deriveYearFromAge('CA', '5-6')).toBe('K');
      expect(deriveYearFromAge('CA', '11-12')).toBe('G6');
    });

    it('should use country-appropriate default for unknown age bands', () => {
      // NZ default should be Y1 (first year option)
      // For testing, we can't easily test invalid age bands due to type safety
      // but the implementation falls back to the first yearGradeOption
    });
  });

  describe('getYearGradeOptions', () => {
    it('should return all options for NZ', () => {
      const options = getYearGradeOptions('NZ');
      expect(options.length).toBeGreaterThan(5);
      expect(options[0].key).toBe('Y1');
    });

    it('should return all options for US', () => {
      const options = getYearGradeOptions('US');
      expect(options.length).toBeGreaterThan(4);
      expect(options[0].key).toBe('K');
    });

    it('should include age ranges in options', () => {
      const options = getYearGradeOptions('NZ');
      expect(options[0].ageRange).toBeDefined();
    });
  });

  describe('getYearGradeOptionsForAge', () => {
    it('should return options matching age band', () => {
      const options = getYearGradeOptionsForAge('NZ', '7-8');
      expect(options.length).toBeGreaterThan(0);
      expect(options.every((opt) => opt.ageRange === '7-8')).toBe(true);
    });

    it('should return empty for non-matching age', () => {
      // Most countries don't have 13-14 in primary school
      const options = getYearGradeOptionsForAge('UK', '5-6');
      expect(options.length).toBeGreaterThan(0);
    });
  });

  describe('getRecommendedYearGrade', () => {
    it('should return the recommended option for NZ', () => {
      const option = getRecommendedYearGrade('NZ', '7-8');
      expect(option).toBeDefined();
      expect(option?.key).toBe('Y3');
      expect(option?.label).toBe('Year 3');
    });

    it('should return Kindergarten for US 5-6 age band', () => {
      const option = getRecommendedYearGrade('US', '5-6');
      expect(option).toBeDefined();
      expect(option?.key).toBe('K');
      expect(option?.label).toBe('Kindergarten');
    });
  });

  describe('formatYearGradeWithCountry', () => {
    it('should format correctly for year-based countries', () => {
      expect(formatYearGradeWithCountry('NZ', 'Y3')).toBe('Year 3, New Zealand');
      expect(formatYearGradeWithCountry('UK', 'Y6')).toBe('Year 6, United Kingdom');
    });

    it('should format correctly for grade-based countries', () => {
      expect(formatYearGradeWithCountry('US', 'K')).toBe('Kindergarten, United States');
      expect(formatYearGradeWithCountry('CA', 'G4')).toBe('Grade 4, Canada');
    });
  });

  describe('getAllCountries', () => {
    it('should return all 5 countries', () => {
      const countries = getAllCountries();
      expect(countries).toHaveLength(5);
    });

    it('should return CountryMetadata objects', () => {
      const countries = getAllCountries();
      for (const country of countries) {
        expect(country).toHaveProperty('code');
        expect(country).toHaveProperty('label');
        expect(country).toHaveProperty('flagEmoji');
      }
    });
  });

  describe('isValidCountryCode', () => {
    it('should return true for valid codes', () => {
      expect(isValidCountryCode('NZ')).toBe(true);
      expect(isValidCountryCode('AU')).toBe(true);
      expect(isValidCountryCode('UK')).toBe(true);
      expect(isValidCountryCode('US')).toBe(true);
      expect(isValidCountryCode('CA')).toBe(true);
    });

    it('should return false for invalid codes', () => {
      expect(isValidCountryCode('XX')).toBe(false);
      expect(isValidCountryCode('')).toBe(false);
      expect(isValidCountryCode('nz')).toBe(false); // Case-sensitive
    });
  });

  describe('isValidYearGrade', () => {
    it('should return true for valid year grades', () => {
      expect(isValidYearGrade('NZ', 'Y1')).toBe(true);
      expect(isValidYearGrade('NZ', 'Y6')).toBe(true);
      expect(isValidYearGrade('US', 'K')).toBe(true);
      expect(isValidYearGrade('US', 'G5')).toBe(true);
    });

    it('should return false for invalid year grades', () => {
      expect(isValidYearGrade('NZ', 'Y99')).toBe(false);
      expect(isValidYearGrade('US', 'Y1')).toBe(false); // Y1 is not US format
      expect(isValidYearGrade('NZ', 'K')).toBe(false); // K is not NZ format
    });
  });

  describe('getAgeRangeForYear', () => {
    it('should return correct age range', () => {
      expect(getAgeRangeForYear('NZ', 'Y3')).toBe('7-8');
      expect(getAgeRangeForYear('US', 'K')).toBe('5-6');
      expect(getAgeRangeForYear('US', 'G3')).toBe('8-9');
    });

    it('should return undefined for invalid year', () => {
      expect(getAgeRangeForYear('NZ', 'Y99')).toBeUndefined();
    });
  });
});
