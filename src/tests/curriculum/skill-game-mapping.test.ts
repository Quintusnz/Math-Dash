/**
 * Unit Tests for skill-game-mapping.ts
 * Tests skill-to-game mappings and fact pattern matching
 */
import { describe, it, expect } from 'vitest';
import {
  SKILL_GAME_MAPPING,
  SKILL_GAME_MAP,
  getSkillGameConfig,
  getSkillsForOperation,
  getSkillsForTopic,
  getSkillsForTimesTableNumbers,
  doesFactMatchSkill,
  getExpectedFactCount,
  calculateSkillMasteryPercentage,
  type SkillGameConfig,
} from '@/lib/constants/skill-game-mapping';
import type { SkillId } from '@/lib/constants/curriculum-data';

describe('skill-game-mapping.ts', () => {
  describe('SKILL_GAME_MAPPING array', () => {
    it('should contain mappings for all 22 skills', () => {
      expect(SKILL_GAME_MAPPING).toHaveLength(22);
    });

    it('should have unique skill IDs', () => {
      const ids = SKILL_GAME_MAPPING.map((m) => m.skillId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have expectedFactCount for each skill', () => {
      for (const mapping of SKILL_GAME_MAPPING) {
        expect(mapping.expectedFactCount).toBeGreaterThan(0);
      }
    });

    it('should have factFilter or factPattern for each skill', () => {
      for (const mapping of SKILL_GAME_MAPPING) {
        const hasFilter = mapping.factFilter !== undefined;
        const hasPattern = mapping.factPattern !== undefined;
        expect(hasFilter || hasPattern).toBe(true);
      }
    });
  });

  describe('SKILL_GAME_MAP lookup', () => {
    it('should provide O(1) lookup for all skills', () => {
      const skillIds: SkillId[] = [
        'NB10', 'NB20', 'NB100', 'NB_DEC1',
        'ADD_SUB_20', 'ADD_SUB_100', 'ADD_SUB_1000',
        'TT_2_5_10', 'TT_CORE', 'TT_1_10_ALL', 'TT_1_12_ALL',
        'DIV_2_5_10', 'DIV_CORE', 'DIV_1_10_ALL', 'DIV_1_12_ALL',
        'DBL_10', 'DBL_20', 'DBL_100', 'DBL_3DIG', 'DBL_DEC',
        'SQ_1_10', 'SQ_1_12',
      ];

      for (const skillId of skillIds) {
        expect(SKILL_GAME_MAP[skillId]).toBeDefined();
        expect(SKILL_GAME_MAP[skillId].skillId).toBe(skillId);
      }
    });
  });

  describe('getSkillGameConfig', () => {
    it('should return config for valid skill ID', () => {
      const config = getSkillGameConfig('TT_CORE');
      expect(config).toBeDefined();
      expect(config?.skillId).toBe('TT_CORE');
      expect(config?.operations).toContain('multiplication');
    });

    it('should return undefined for unknown skill', () => {
      const config = getSkillGameConfig('UNKNOWN' as SkillId);
      expect(config).toBeUndefined();
    });
  });

  describe('getSkillsForOperation', () => {
    it('should return multiplication skills', () => {
      const skills = getSkillsForOperation('multiplication');
      expect(skills.length).toBeGreaterThan(0);
      
      const skillIds = skills.map((s) => s.skillId);
      expect(skillIds).toContain('TT_2_5_10');
      expect(skillIds).toContain('TT_CORE');
      expect(skillIds).toContain('TT_1_10_ALL');
    });

    it('should return division skills', () => {
      const skills = getSkillsForOperation('division');
      expect(skills.length).toBeGreaterThan(0);
      
      const skillIds = skills.map((s) => s.skillId);
      expect(skillIds).toContain('DIV_2_5_10');
      expect(skillIds).toContain('DIV_CORE');
    });

    it('should return addition skills', () => {
      const skills = getSkillsForOperation('addition');
      expect(skills.length).toBeGreaterThan(0);
    });
  });

  describe('getSkillsForTopic', () => {
    it('should return skills for number-bonds-10', () => {
      const skills = getSkillsForTopic('number-bonds-10');
      expect(skills.length).toBeGreaterThan(0);
      expect(skills[0].skillId).toBe('NB10');
    });

    it('should return skills for squares topic', () => {
      const skills = getSkillsForTopic('squares');
      expect(skills.length).toBe(2); // SQ_1_10, SQ_1_12
    });

    it('should return skills for doubles topic', () => {
      const skills = getSkillsForTopic('doubles');
      expect(skills.length).toBeGreaterThan(0);
    });
  });

  describe('getSkillsForTimesTableNumbers', () => {
    it('should find skills with number 5', () => {
      const skills = getSkillsForTimesTableNumbers([5]);
      expect(skills.length).toBeGreaterThan(0);
      
      const skillIds = skills.map((s) => s.skillId);
      expect(skillIds).toContain('TT_2_5_10');
      expect(skillIds).toContain('TT_CORE');
    });

    it('should find skills with number 12', () => {
      const skills = getSkillsForTimesTableNumbers([12]);
      expect(skills.length).toBeGreaterThan(0);
      
      const skillIds = skills.map((s) => s.skillId);
      expect(skillIds).toContain('TT_1_12_ALL');
      expect(skillIds).toContain('DIV_1_12_ALL');
    });
  });

  describe('doesFactMatchSkill - Number Bonds', () => {
    it('should match NB10 facts correctly', () => {
      expect(doesFactMatchSkill('3+7=10', 'NB10')).toBe(true);
      expect(doesFactMatchSkill('0+10=10', 'NB10')).toBe(true);
      expect(doesFactMatchSkill('5+5=10', 'NB10')).toBe(true);
      expect(doesFactMatchSkill('3+7=15', 'NB10')).toBe(false);
    });

    it('should match NB20 facts correctly', () => {
      expect(doesFactMatchSkill('12+8=20', 'NB20')).toBe(true);
      expect(doesFactMatchSkill('15+5=20', 'NB20')).toBe(true);
      expect(doesFactMatchSkill('10+5=15', 'NB20')).toBe(false);
    });

    it('should match NB100 facts correctly', () => {
      expect(doesFactMatchSkill('30+70=100', 'NB100')).toBe(true);
      expect(doesFactMatchSkill('45+55=100', 'NB100')).toBe(true);
      expect(doesFactMatchSkill('50+40=90', 'NB100')).toBe(false);
    });
  });

  describe('doesFactMatchSkill - Addition/Subtraction', () => {
    it('should match ADD_SUB_20 facts', () => {
      expect(doesFactMatchSkill('5+7=12', 'ADD_SUB_20')).toBe(true);
      expect(doesFactMatchSkill('15-8=7', 'ADD_SUB_20')).toBe(true);
      expect(doesFactMatchSkill('50+30=80', 'ADD_SUB_20')).toBe(false);
    });

    it('should match ADD_SUB_100 facts', () => {
      expect(doesFactMatchSkill('45+37=82', 'ADD_SUB_100')).toBe(true);
      expect(doesFactMatchSkill('82-19=63', 'ADD_SUB_100')).toBe(true);
    });
  });

  describe('doesFactMatchSkill - Multiplication', () => {
    it('should match TT_2_5_10 facts', () => {
      expect(doesFactMatchSkill('5×6=30', 'TT_2_5_10')).toBe(true);
      expect(doesFactMatchSkill('7x2=14', 'TT_2_5_10')).toBe(true);
      expect(doesFactMatchSkill('10×9=90', 'TT_2_5_10')).toBe(true);
      expect(doesFactMatchSkill('7×8=56', 'TT_2_5_10')).toBe(false);
    });

    it('should match TT_CORE facts (2, 3, 4, 5, 8, 10)', () => {
      expect(doesFactMatchSkill('3×7=21', 'TT_CORE')).toBe(true);
      expect(doesFactMatchSkill('4×6=24', 'TT_CORE')).toBe(true);
      expect(doesFactMatchSkill('8×9=72', 'TT_CORE')).toBe(true);
      expect(doesFactMatchSkill('5×5=25', 'TT_CORE')).toBe(true);
      expect(doesFactMatchSkill('7×9=63', 'TT_CORE')).toBe(false);
    });

    it('should match TT_1_10_ALL facts', () => {
      expect(doesFactMatchSkill('7×8=56', 'TT_1_10_ALL')).toBe(true);
      expect(doesFactMatchSkill('9×9=81', 'TT_1_10_ALL')).toBe(true);
      expect(doesFactMatchSkill('11×11=121', 'TT_1_10_ALL')).toBe(false);
    });

    it('should match TT_1_12_ALL facts', () => {
      expect(doesFactMatchSkill('11×12=132', 'TT_1_12_ALL')).toBe(true);
      expect(doesFactMatchSkill('12×12=144', 'TT_1_12_ALL')).toBe(true);
      expect(doesFactMatchSkill('13×13=169', 'TT_1_12_ALL')).toBe(false);
    });
  });

  describe('doesFactMatchSkill - Division', () => {
    it('should match DIV_2_5_10 facts', () => {
      expect(doesFactMatchSkill('20÷5=4', 'DIV_2_5_10')).toBe(true);
      expect(doesFactMatchSkill('18/2=9', 'DIV_2_5_10')).toBe(true);
      expect(doesFactMatchSkill('50÷10=5', 'DIV_2_5_10')).toBe(true);
      expect(doesFactMatchSkill('24÷3=8', 'DIV_2_5_10')).toBe(false);
    });

    it('should match DIV_CORE facts (2, 3, 4, 5, 8, 10)', () => {
      expect(doesFactMatchSkill('24÷3=8', 'DIV_CORE')).toBe(true);
      expect(doesFactMatchSkill('32÷4=8', 'DIV_CORE')).toBe(true);
      expect(doesFactMatchSkill('40÷8=5', 'DIV_CORE')).toBe(true);
      expect(doesFactMatchSkill('49÷7=7', 'DIV_CORE')).toBe(false);
    });

    it('should match DIV_1_10_ALL facts', () => {
      expect(doesFactMatchSkill('56÷7=8', 'DIV_1_10_ALL')).toBe(true);
      expect(doesFactMatchSkill('81÷9=9', 'DIV_1_10_ALL')).toBe(true);
    });
  });

  describe('doesFactMatchSkill - Doubles', () => {
    it('should match DBL_10 facts', () => {
      expect(doesFactMatchSkill('5+5=10', 'DBL_10')).toBe(true);
      expect(doesFactMatchSkill('8+8=16', 'DBL_10')).toBe(true);
      expect(doesFactMatchSkill('15+15=30', 'DBL_10')).toBe(false);
    });

    it('should match DBL_20 facts', () => {
      expect(doesFactMatchSkill('15+15=30', 'DBL_20')).toBe(true);
      expect(doesFactMatchSkill('12+12=24', 'DBL_20')).toBe(true);
      expect(doesFactMatchSkill('5+5=10', 'DBL_20')).toBe(false);
    });

    it('should match DBL_100 facts', () => {
      expect(doesFactMatchSkill('50+50=100', 'DBL_100')).toBe(true);
      expect(doesFactMatchSkill('25+25=50', 'DBL_100')).toBe(true);
    });
  });

  describe('doesFactMatchSkill - Squares', () => {
    it('should match SQ_1_10 facts', () => {
      expect(doesFactMatchSkill('5×5=25', 'SQ_1_10')).toBe(true);
      expect(doesFactMatchSkill('7x7=49', 'SQ_1_10')).toBe(true);
      expect(doesFactMatchSkill('10×10=100', 'SQ_1_10')).toBe(true);
      expect(doesFactMatchSkill('11×11=121', 'SQ_1_10')).toBe(false);
    });

    it('should match SQ_1_12 facts', () => {
      expect(doesFactMatchSkill('11×11=121', 'SQ_1_12')).toBe(true);
      expect(doesFactMatchSkill('12×12=144', 'SQ_1_12')).toBe(true);
    });
  });

  describe('getExpectedFactCount', () => {
    it('should return correct counts for number bonds', () => {
      expect(getExpectedFactCount('NB10')).toBe(11);
      expect(getExpectedFactCount('NB20')).toBe(21);
    });

    it('should return correct counts for times tables', () => {
      expect(getExpectedFactCount('TT_2_5_10')).toBe(36);
      expect(getExpectedFactCount('TT_CORE')).toBe(72); // Updated: 6 tables × 12 facts
      expect(getExpectedFactCount('TT_1_10_ALL')).toBe(100);
      expect(getExpectedFactCount('TT_1_12_ALL')).toBe(144);
    });

    it('should return 0 for unknown skill', () => {
      expect(getExpectedFactCount('UNKNOWN' as SkillId)).toBe(0);
    });
  });

  describe('calculateSkillMasteryPercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculateSkillMasteryPercentage('NB10', 5)).toBe(45); // 5/11 ≈ 45%
      expect(calculateSkillMasteryPercentage('NB10', 11)).toBe(100);
      expect(calculateSkillMasteryPercentage('TT_1_10_ALL', 50)).toBe(50);
    });

    it('should cap at 100%', () => {
      expect(calculateSkillMasteryPercentage('NB10', 20)).toBe(100);
    });

    it('should return 0 for unknown skill', () => {
      expect(calculateSkillMasteryPercentage('UNKNOWN' as SkillId, 10)).toBe(0);
    });
  });

  describe('TT_CORE and DIV_CORE alignment', () => {
    it('TT_CORE should include tables 2, 3, 4, 5, 8, 10', () => {
      const config = getSkillGameConfig('TT_CORE');
      expect(config?.selectedNumbers).toEqual([2, 3, 4, 5, 8, 10]);
    });

    it('DIV_CORE should include divisors 2, 3, 4, 5, 8, 10', () => {
      const config = getSkillGameConfig('DIV_CORE');
      expect(config?.selectedNumbers).toEqual([2, 3, 4, 5, 8, 10]);
    });

    it('TT_CORE and DIV_CORE should have matching numbers', () => {
      const ttCore = getSkillGameConfig('TT_CORE');
      const divCore = getSkillGameConfig('DIV_CORE');
      expect(ttCore?.selectedNumbers).toEqual(divCore?.selectedNumbers);
    });
  });
});
