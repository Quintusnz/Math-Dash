import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getConfigSummary, LastGameConfig } from '@/lib/game-engine/quick-play';

describe('quick-play utilities', () => {
  describe('getConfigSummary', () => {
    const baseConfig: LastGameConfig = {
      operations: [],
      selectedNumbers: [],
      mode: 'timed',
      inputMode: 'numpad',
      difficulty: 'medium',
      duration: 60,
      questionCount: 20,
      playedAt: new Date().toISOString(),
    };

    it('should summarize multiplication with selected numbers', () => {
      const config: LastGameConfig = {
        ...baseConfig,
        operations: ['multiplication'],
        selectedNumbers: [5, 6, 7],
        mode: 'timed',
        duration: 60,
      };

      const summary = getConfigSummary(config);
      
      expect(summary).toBe('5, 6, 7× • 60s');
    });

    it('should summarize multiplication with many numbers (truncated)', () => {
      const config: LastGameConfig = {
        ...baseConfig,
        operations: ['multiplication'],
        selectedNumbers: [2, 3, 4, 5, 6],
        mode: 'timed',
        duration: 60,
      };

      const summary = getConfigSummary(config);
      
      expect(summary).toBe('2, 3, 4× +2 • 60s');
    });

    it('should summarize addition with number range', () => {
      const config: LastGameConfig = {
        ...baseConfig,
        operations: ['addition'],
        numberRange: {
          preset: 'builder',
          min: 0,
          max: 20,
          rangeType: 'operand',
          allowNegatives: false,
        },
        mode: 'timed',
        duration: 30,
      };

      const summary = getConfigSummary(config);
      
      expect(summary).toBe('+ (0-20) • 30s');
    });

    it('should summarize mixed operations', () => {
      const config: LastGameConfig = {
        ...baseConfig,
        operations: ['addition', 'subtraction'],
        numberRange: {
          preset: 'starter',
          min: 0,
          max: 10,
          rangeType: 'operand',
          allowNegatives: false,
        },
        mode: 'sprint',
        questionCount: 15,
      };

      const summary = getConfigSummary(config);
      
      expect(summary).toBe('+/− (0-10) • 15Q');
    });

    it('should summarize special topics', () => {
      const config: LastGameConfig = {
        ...baseConfig,
        selectedTopics: ['number-bonds-10', 'doubles'],
        mode: 'timed',
        duration: 45,
      };

      const summary = getConfigSummary(config);
      
      expect(summary).toBe('Make 10, Doubles • 45s');
    });

    it('should truncate many special topics', () => {
      const config: LastGameConfig = {
        ...baseConfig,
        selectedTopics: ['number-bonds-10', 'number-bonds-20', 'doubles', 'halves'],
        mode: 'practice',
      };

      const summary = getConfigSummary(config);
      
      expect(summary).toBe('Make 10, Make 20, +2 • Practice');
    });

    it('should show division symbol', () => {
      const config: LastGameConfig = {
        ...baseConfig,
        operations: ['division'],
        selectedNumbers: [2, 3],
        mode: 'timed',
        duration: 60,
      };

      const summary = getConfigSummary(config);
      
      expect(summary).toBe('2, 3÷ • 60s');
    });

    it('should show combined multiplication and division', () => {
      const config: LastGameConfig = {
        ...baseConfig,
        operations: ['multiplication', 'division'],
        selectedNumbers: [5],
        mode: 'sprint',
        questionCount: 10,
      };

      const summary = getConfigSummary(config);
      
      expect(summary).toBe('5×/÷ • 10Q');
    });
  });
});
