/**
 * Unit Tests for curriculum-data.ts
 * Tests skill definitions, country benchmarks, and helper functions
 */
import { describe, it, expect } from 'vitest';
import {
  SKILLS,
  COUNTRY_BENCHMARKS,
  CURRICULUM_DATA,
  getSkillById,
  getSkillsByDomain,
  getSkillsBySubdomain,
  getBenchmark,
  getYearGradeKeys,
  isCoreSkill,
  isExtensionSkill,
  getAllSkillsForBenchmark,
  type SkillId,
  type CountryCode,
  type SkillDomain,
  type SkillSubdomain,
} from '@/lib/constants/curriculum-data';

describe('curriculum-data.ts', () => {
  describe('SKILLS array', () => {
    it('should contain 22 skills', () => {
      expect(SKILLS).toHaveLength(22);
    });

    it('should have unique skill IDs', () => {
      const ids = SKILLS.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all required properties on each skill', () => {
      for (const skill of SKILLS) {
        expect(skill).toHaveProperty('id');
        expect(skill).toHaveProperty('label');
        expect(skill).toHaveProperty('domain');
        expect(skill).toHaveProperty('subdomain');
        expect(skill).toHaveProperty('description');
        expect(skill).toHaveProperty('numberRange');
        expect(skill).toHaveProperty('gameModes');
        expect(skill.gameModes.length).toBeGreaterThan(0);
      }
    });

    it('should categorize skills into correct domains', () => {
      const numberFactsSkills = SKILLS.filter((s) => s.domain === 'number_facts');
      const operationsSkills = SKILLS.filter((s) => s.domain === 'operations');
      const propertiesSkills = SKILLS.filter((s) => s.domain === 'number_properties');

      // Number facts: NB10, NB20, NB100, NB_DEC1, DBL_10-DBL_DEC = 9 skills
      expect(numberFactsSkills.length).toBeGreaterThan(0);
      // Operations: ADD_SUB_*, TT_*, DIV_* = 11 skills
      expect(operationsSkills.length).toBeGreaterThan(0);
      // Number properties: SQ_1_10, SQ_1_12 = 2 skills
      expect(propertiesSkills.length).toBe(2);
    });
  });

  describe('COUNTRY_BENCHMARKS', () => {
    const countries: CountryCode[] = ['NZ', 'AU', 'UK', 'US', 'CA'];

    it('should have configuration for all 5 countries', () => {
      expect(Object.keys(COUNTRY_BENCHMARKS)).toHaveLength(5);
      for (const country of countries) {
        expect(COUNTRY_BENCHMARKS[country]).toBeDefined();
      }
    });

    it('should have valid system types', () => {
      expect(COUNTRY_BENCHMARKS.NZ.systemType).toBe('year');
      expect(COUNTRY_BENCHMARKS.AU.systemType).toBe('year');
      expect(COUNTRY_BENCHMARKS.UK.systemType).toBe('year');
      expect(COUNTRY_BENCHMARKS.US.systemType).toBe('grade');
      expect(COUNTRY_BENCHMARKS.CA.systemType).toBe('grade');
    });

    it('should have year levels for each country', () => {
      for (const country of countries) {
        const years = Object.keys(COUNTRY_BENCHMARKS[country].years);
        expect(years.length).toBeGreaterThan(0);
      }
    });

    it('should have valid skill references in benchmarks', () => {
      const validSkillIds = new Set(SKILLS.map((s) => s.id));

      for (const country of countries) {
        for (const [yearKey, benchmark] of Object.entries(COUNTRY_BENCHMARKS[country].years)) {
          for (const skillId of benchmark.coreSkills) {
            expect(validSkillIds.has(skillId)).toBe(true);
          }
          for (const skillId of benchmark.extensionSkills) {
            expect(validSkillIds.has(skillId)).toBe(true);
          }
        }
      }
    });

    it('NZ should have Y1-Y6 year levels', () => {
      const nzYears = Object.keys(COUNTRY_BENCHMARKS.NZ.years);
      expect(nzYears).toContain('Y1');
      expect(nzYears).toContain('Y6');
    });

    it('US should have K-G5 grade levels', () => {
      const usGrades = Object.keys(COUNTRY_BENCHMARKS.US.years);
      expect(usGrades).toContain('K');
      expect(usGrades).toContain('G5');
    });
  });

  describe('CURRICULUM_DATA export', () => {
    it('should have version number', () => {
      expect(CURRICULUM_DATA.version).toBe(1);
    });

    it('should include skills and countries', () => {
      expect(CURRICULUM_DATA.skills).toBe(SKILLS);
      expect(CURRICULUM_DATA.countries).toBe(COUNTRY_BENCHMARKS);
    });
  });

  describe('getSkillById', () => {
    it('should return skill when found', () => {
      const skill = getSkillById('NB10');
      expect(skill).toBeDefined();
      expect(skill?.id).toBe('NB10');
      expect(skill?.label).toBe('Number bonds to 10');
    });

    it('should return undefined for unknown skill ID', () => {
      const skill = getSkillById('UNKNOWN' as SkillId);
      expect(skill).toBeUndefined();
    });

    it('should find all skill types', () => {
      expect(getSkillById('TT_CORE')).toBeDefined();
      expect(getSkillById('DIV_1_12_ALL')).toBeDefined();
      expect(getSkillById('SQ_1_12')).toBeDefined();
    });
  });

  describe('getSkillsByDomain', () => {
    it('should return all skills in number_facts domain', () => {
      const skills = getSkillsByDomain('number_facts');
      expect(skills.length).toBeGreaterThan(0);
      expect(skills.every((s) => s.domain === 'number_facts')).toBe(true);
    });

    it('should return all skills in operations domain', () => {
      const skills = getSkillsByDomain('operations');
      expect(skills.length).toBeGreaterThan(0);
      expect(skills.every((s) => s.domain === 'operations')).toBe(true);
    });

    it('should return all skills in number_properties domain', () => {
      const skills = getSkillsByDomain('number_properties');
      expect(skills).toHaveLength(2); // SQ_1_10, SQ_1_12
      expect(skills.every((s) => s.domain === 'number_properties')).toBe(true);
    });
  });

  describe('getSkillsBySubdomain', () => {
    it('should return number_bonds skills', () => {
      const skills = getSkillsBySubdomain('number_bonds');
      expect(skills).toHaveLength(4); // NB10, NB20, NB100, NB_DEC1
    });

    it('should return multiplication skills', () => {
      const skills = getSkillsBySubdomain('multiplication');
      expect(skills).toHaveLength(4); // TT_2_5_10, TT_CORE, TT_1_10_ALL, TT_1_12_ALL
    });

    it('should return division skills', () => {
      const skills = getSkillsBySubdomain('division');
      expect(skills).toHaveLength(4); // DIV_2_5_10, DIV_CORE, DIV_1_10_ALL, DIV_1_12_ALL
    });

    it('should return doubles_halves skills', () => {
      const skills = getSkillsBySubdomain('doubles_halves');
      expect(skills).toHaveLength(5); // DBL_10, DBL_20, DBL_100, DBL_3DIG, DBL_DEC
    });
  });

  describe('getBenchmark', () => {
    it('should return benchmark for valid country and year', () => {
      const benchmark = getBenchmark('NZ', 'Y3');
      expect(benchmark).toBeDefined();
      expect(benchmark?.label).toBe('Year 3');
      expect(benchmark?.ageRange).toBe('7-8');
      expect(benchmark?.coreSkills.length).toBeGreaterThan(0);
    });

    it('should return undefined for invalid year', () => {
      const benchmark = getBenchmark('NZ', 'Y99');
      expect(benchmark).toBeUndefined();
    });

    it('should return US Kindergarten benchmark', () => {
      const benchmark = getBenchmark('US', 'K');
      expect(benchmark).toBeDefined();
      expect(benchmark?.label).toBe('Kindergarten');
    });
  });

  describe('getYearGradeKeys', () => {
    it('should return all year keys for NZ', () => {
      const keys = getYearGradeKeys('NZ');
      expect(keys).toContain('Y1');
      expect(keys).toContain('Y2');
      expect(keys).toContain('Y6');
    });

    it('should return grade keys for US', () => {
      const keys = getYearGradeKeys('US');
      expect(keys).toContain('K');
      expect(keys).toContain('G1');
      expect(keys).toContain('G5');
    });
  });

  describe('isCoreSkill', () => {
    it('should return true for core skills in NZ Y3', () => {
      // NZ Y3 core: ADD_SUB_1000, NB100, DBL_100, TT_2_5_10, TT_CORE, DIV_2_5_10, DIV_CORE
      expect(isCoreSkill('NZ', 'Y3', 'ADD_SUB_1000')).toBe(true);
      expect(isCoreSkill('NZ', 'Y3', 'TT_CORE')).toBe(true);
    });

    it('should return false for non-core skills', () => {
      expect(isCoreSkill('NZ', 'Y3', 'TT_1_12_ALL')).toBe(false);
      expect(isCoreSkill('NZ', 'Y1', 'TT_CORE')).toBe(false);
    });

    it('should return false for invalid year', () => {
      expect(isCoreSkill('NZ', 'Y99', 'NB10')).toBe(false);
    });
  });

  describe('isExtensionSkill', () => {
    it('should return true for extension skills', () => {
      // NZ Y3 extension: TT_1_10_ALL, DIV_1_10_ALL, DBL_3DIG
      expect(isExtensionSkill('NZ', 'Y3', 'TT_1_10_ALL')).toBe(true);
      expect(isExtensionSkill('NZ', 'Y3', 'DIV_1_10_ALL')).toBe(true);
    });

    it('should return false for core skills', () => {
      expect(isExtensionSkill('NZ', 'Y3', 'ADD_SUB_1000')).toBe(false);
    });
  });

  describe('getAllSkillsForBenchmark', () => {
    it('should return both core and extension skills', () => {
      const allSkills = getAllSkillsForBenchmark('NZ', 'Y3');
      expect(allSkills.length).toBeGreaterThan(0);

      const benchmark = getBenchmark('NZ', 'Y3');
      expect(allSkills.length).toBe(
        (benchmark?.coreSkills.length ?? 0) + (benchmark?.extensionSkills.length ?? 0)
      );
    });

    it('should return empty array for invalid year', () => {
      const allSkills = getAllSkillsForBenchmark('NZ', 'Y99');
      expect(allSkills).toHaveLength(0);
    });
  });
});
