/**
 * Unit Tests for CurriculumTracker class
 * Tests skill progress calculation, curriculum progress, and recommendations
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CurriculumTracker,
  type ProficiencyLevel,
  type SkillProgress,
  type CurriculumProgress,
  type RecommendedSkill,
} from '@/lib/game-engine/curriculum-tracker';
import type { MasteryRecord, Profile } from '@/lib/db';
import {
  SKILLS,
  isCoreSkill,
  isExtensionSkill,
  type SkillId,
  type CountryCode,
} from '@/lib/constants/curriculum-data';
import {
  doesFactMatchSkill,
  filterRecordsForSkill,
} from '@/lib/constants/skill-game-mapping';

// Create mock functions that will be shared
const mockToArray = vi.fn().mockResolvedValue([]);
const mockProfileGet = vi.fn().mockResolvedValue(null);

// Mock the database module
vi.mock('@/lib/db', () => ({
  db: {
    mastery: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: () => mockToArray(),
        }),
      }),
    },
    profiles: {
      get: () => mockProfileGet(),
    },
  },
}));

// Helper to create mock mastery records
function createMasteryRecord(
  profileId: string,
  fact: string,
  operation: 'addition' | 'subtraction' | 'multiplication' | 'division',
  overrides: Partial<MasteryRecord> = {}
): MasteryRecord {
  return {
    profileId,
    fact,
    operation,
    attempts: 10,
    correct: 8,
    avgResponseTime: 2000,
    lastAttemptAt: new Date().toISOString(),
    status: 'learning',
    weight: 1,
    ...overrides,
  };
}

// Helper to create mock profile
function createMockProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'test-profile-id',
    playCode: 'DASH-TEST',
    displayName: 'Test User',
    ageBand: '7-8',
    avatarId: 'avatar1',
    isGuest: false,
    classroomId: null,
    preferences: {
      theme: 'default',
      soundEnabled: true,
      hapticsEnabled: true,
    },
    syncStatus: 'local',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function mockSkillProgressScenario(
  country: CountryCode,
  yearGrade: string,
  options: { coreMasterRatio: number; extensionMastered: number }
) {
  const coreSkills = SKILLS.filter((skill) =>
    isCoreSkill(country, yearGrade, skill.id)
  ).map((skill) => skill.id);
  const extensionSkills = SKILLS.filter((skill) =>
    isExtensionSkill(country, yearGrade, skill.id)
  ).map((skill) => skill.id);

  const coreMasterCount = Math.min(
    coreSkills.length,
    Math.ceil(coreSkills.length * options.coreMasterRatio)
  );
  const extensionMasterCount = Math.min(
    extensionSkills.length,
    options.extensionMastered
  );

  const coreMasterSet = new Set(coreSkills.slice(0, coreMasterCount));
  const extensionMasterSet = new Set(
    extensionSkills.slice(0, extensionMasterCount)
  );

  return vi.spyOn(CurriculumTracker, 'getSkillProgress').mockImplementation(
    async (_profileId, skillId) => {
      const core = isCoreSkill(country, yearGrade, skillId);
      const extension = isExtensionSkill(country, yearGrade, skillId);
      const mastered =
        (core && coreMasterSet.has(skillId)) ||
        (extension && extensionMasterSet.has(skillId));

      const base: SkillProgress = {
        skillId,
        label: skillId,
        proficiency: mastered ? 'mastered' : 'not-started',
        accuracy: mastered ? 95 : 0,
        coverage: mastered ? 100 : 0,
        totalAttempts: mastered ? 20 : 0,
        totalCorrect: mastered ? 20 : 0,
        avgResponseTime: mastered ? 1800 : 0,
        masteredFactCount: mastered ? 10 : 0,
        expectedFactCount: 10,
        isCore: core,
        isExtension: extension,
        lastPracticedAt: mastered ? new Date().toISOString() : undefined,
      };

      return base;
    }
  );
}

describe('CurriculumTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock return values
    mockToArray.mockResolvedValue([]);
    mockProfileGet.mockResolvedValue(null);
  });

  describe('getSkillProgress', () => {
    it('should return not-started for skill with no mastery records', async () => {
      mockToArray.mockResolvedValue([]);

      const progress = await CurriculumTracker.getSkillProgress(
        'test-profile',
        'NB10'
      );

      expect(progress.proficiency).toBe('not-started');
      expect(progress.accuracy).toBe(0);
      expect(progress.coverage).toBe(0);
      expect(progress.totalAttempts).toBe(0);
    });

    it('should calculate developing proficiency for low accuracy', async () => {
    const records: MasteryRecord[] = [
      createMasteryRecord('test-profile', '3+7=10', 'addition', {
        attempts: 10,
        correct: 5,
        status: 'learning',
      }),
      createMasteryRecord('test-profile', '4+6=10', 'addition', {
        attempts: 10,
        correct: 6,
        status: 'learning',
      }),
      createMasteryRecord('test-profile', '5+5=10', 'addition', {
        attempts: 10,
        correct: 6,
        status: 'learning',
      }),
      createMasteryRecord('test-profile', '6+4=10', 'addition', {
        attempts: 10,
        correct: 7,
        status: 'learning',
      }),
    ];

      mockToArray.mockResolvedValue(records);

      const progress = await CurriculumTracker.getSkillProgress(
        'test-profile',
        'NB10'
      );

      expect(progress.proficiency).toBe('developing');
      expect(progress.accuracy).toBe(60);
      expect(progress.totalAttempts).toBe(40);
    });

    it('should return correct skill metadata', async () => {
      mockToArray.mockResolvedValue([]);

      const progress = await CurriculumTracker.getSkillProgress(
        'test-profile',
        'TT_CORE'
      );

      expect(progress.skillId).toBe('TT_CORE');
      expect(progress.label).toBe('Core times tables: 2, 3, 4, 5, 8 and 10');
      expect(progress.expectedFactCount).toBe(72);
    });

    it('should identify core skills for country/year', async () => {
      mockToArray.mockResolvedValue([]);

      const progress = await CurriculumTracker.getSkillProgress(
        'test-profile',
        'TT_CORE',
        'NZ',
        'Y3'
      );

      expect(progress.isCore).toBe(true);
      expect(progress.isExtension).toBe(false);
    });

    it('should identify extension skills for country/year', async () => {
      mockToArray.mockResolvedValue([]);

      const progress = await CurriculumTracker.getSkillProgress(
        'test-profile',
        'TT_1_10_ALL',
        'NZ',
        'Y3'
      );

      expect(progress.isCore).toBe(false);
      expect(progress.isExtension).toBe(true);
    });

    it('should throw for unknown skill ID', async () => {
      await expect(
        CurriculumTracker.getSkillProgress('test-profile', 'UNKNOWN' as SkillId)
      ).rejects.toThrow('Unknown skill: UNKNOWN');
    });

    it('should calculate coverage percentage correctly', async () => {
      // NB10 expects 11 facts
      const records: MasteryRecord[] = [
        createMasteryRecord('test-profile', '3+7=10', 'addition'),
        createMasteryRecord('test-profile', '4+6=10', 'addition'),
        createMasteryRecord('test-profile', '5+5=10', 'addition'),
      ];

      mockToArray.mockResolvedValue(records);

      const progress = await CurriculumTracker.getSkillProgress(
        'test-profile',
        'NB10'
      );

      // 3 out of 11 expected facts = 27%
      expect(progress.coverage).toBe(27);
      expect(progress.masteredFactCount).toBe(0); // All are 'learning'
    });

    it('should count mastered facts correctly', async () => {
      const records: MasteryRecord[] = [
        createMasteryRecord('test-profile', '3+7=10', 'addition', { status: 'mastered' }),
        createMasteryRecord('test-profile', '4+6=10', 'addition', { status: 'mastered' }),
        createMasteryRecord('test-profile', '5+5=10', 'addition', { status: 'learning' }),
      ];

      mockToArray.mockResolvedValue(records);

      const progress = await CurriculumTracker.getSkillProgress(
        'test-profile',
        'NB10'
      );

      expect(progress.masteredFactCount).toBe(2);
    });

    it('should calculate weighted average response time', async () => {
      const records: MasteryRecord[] = [
        createMasteryRecord('test-profile', '3+7=10', 'addition', {
          attempts: 10,
          avgResponseTime: 2000,
        }),
        createMasteryRecord('test-profile', '4+6=10', 'addition', {
          attempts: 20,
          avgResponseTime: 1000,
        }),
      ];

      mockToArray.mockResolvedValue(records);

      const progress = await CurriculumTracker.getSkillProgress(
        'test-profile',
        'NB10'
      );

      // Weighted avg: (2000*10 + 1000*20) / 30 = 40000/30 = 1333
      expect(progress.avgResponseTime).toBe(1333);
    });
  });

  describe('getCurriculumProgress', () => {
    it('should return progress with country and year from profile', async () => {
      const profile = createMockProfile({
        country: 'NZ',
        yearGrade: 'Y3',
      });

      mockProfileGet.mockResolvedValue(profile);
      mockToArray.mockResolvedValue([]);

      const progress = await CurriculumTracker.getCurriculumProgress('test-profile');

      expect(progress.country).toBe('NZ');
      expect(progress.yearGrade).toBe('Y3');
    });

    it('should include countryLabel and yearGradeLabel', async () => {
      const profile = createMockProfile({
        country: 'NZ',
        yearGrade: 'Y3',
      });

      mockProfileGet.mockResolvedValue(profile);
      mockToArray.mockResolvedValue([]);

      const progress = await CurriculumTracker.getCurriculumProgress('test-profile');

      expect(progress.countryLabel).toBe('New Zealand');
      expect(progress.yearGradeLabel).toBe('Year 3');
    });

    it('should include correct labels for US profile', async () => {
      const profile = createMockProfile({
        country: 'US',
        yearGrade: 'G2',
      });

      mockProfileGet.mockResolvedValue(profile);
      mockToArray.mockResolvedValue([]);

      const progress = await CurriculumTracker.getCurriculumProgress('test-profile');

      expect(progress.countryLabel).toBe('United States');
      expect(progress.yearGradeLabel).toBe('Grade 2');
    });

    it('should derive yearGrade from ageBand if not set', async () => {
      const profile = createMockProfile({
        country: 'NZ',
        yearGrade: undefined,
        ageBand: '7-8',
      });

      mockProfileGet.mockResolvedValue(profile);
      mockToArray.mockResolvedValue([]);

      const progress = await CurriculumTracker.getCurriculumProgress('test-profile');

      expect(progress.yearGrade).toBe('Y3'); // Derived from 7-8 age band
    });

    it('prefers the stored yearGrade over the derived suggestion when they differ', async () => {
      const profile = createMockProfile({
        country: 'NZ',
        yearGrade: 'Y2',
        ageBand: '7-8',
      });

      mockProfileGet.mockResolvedValue(profile);
      mockToArray.mockResolvedValue([]);

      const progress = await CurriculumTracker.getCurriculumProgress('test-profile');

      expect(progress.yearGrade).toBe('Y2');
      expect(progress.yearGrade).not.toBe('Y3');
      expect(progress.yearGradeLabel).toBe('Year 2');
    });

    it('should separate core and extension skills', async () => {
      const profile = createMockProfile({
        country: 'NZ',
        yearGrade: 'Y3',
      });

      mockProfileGet.mockResolvedValue(profile);
      mockToArray.mockResolvedValue([]);

      const progress = await CurriculumTracker.getCurriculumProgress('test-profile');

      expect(progress.coreSkillProgress.length).toBeGreaterThan(0);
      expect(progress.coreSkillProgress.every((p) => p.isCore)).toBe(true);
      expect(progress.extensionSkillProgress.every((p) => p.isExtension)).toBe(true);
    });

    it('should count skills by proficiency level', async () => {
      const profile = createMockProfile({
        country: 'NZ',
        yearGrade: 'Y3',
      });

      mockProfileGet.mockResolvedValue(profile);
      mockToArray.mockResolvedValue([]);

      const progress = await CurriculumTracker.getCurriculumProgress('test-profile');

      // All skills should be not-started with no mastery data
      expect(progress.coreSkillCounts['not-started']).toBeGreaterThan(0);
      expect(progress.coreSkillCounts.developing).toBe(0);
      expect(progress.coreSkillCounts.proficient).toBe(0);
      expect(progress.coreSkillCounts.mastered).toBe(0);
    });

    it('should calculate overall percentage', async () => {
      const profile = createMockProfile({
        country: 'NZ',
        yearGrade: 'Y3',
      });

      mockProfileGet.mockResolvedValue(profile);
      mockToArray.mockResolvedValue([]);

      const progress = await CurriculumTracker.getCurriculumProgress('test-profile');

      // With no mastery, all skills are not-started = 0%
      expect(progress.overallPercentage).toBe(0);
    });

    it('should return behind status for no progress', async () => {
      const profile = createMockProfile({
        country: 'NZ',
        yearGrade: 'Y3',
      });

      mockProfileGet.mockResolvedValue(profile);
      mockToArray.mockResolvedValue([]);

      const progress = await CurriculumTracker.getCurriculumProgress('test-profile');

      expect(progress.overallStatus).toBe('behind');
    });

    it('should return on-track when at least half of core skills are mastered', async () => {
      const profile = createMockProfile({
        country: 'NZ',
        yearGrade: 'Y3',
      });

      mockProfileGet.mockResolvedValue(profile);
      const spy = mockSkillProgressScenario('NZ', 'Y3', {
        coreMasterRatio: 0.5,
        extensionMastered: 0,
      });

      const progress = await CurriculumTracker.getCurriculumProgress('test-profile');

      expect(progress.overallStatus).toBe('on-track');
      spy.mockRestore();
    });

    it('should return ahead when 80% of core and some extension skills are mastered', async () => {
      const profile = createMockProfile({
        country: 'NZ',
        yearGrade: 'Y5',
      });

      mockProfileGet.mockResolvedValue(profile);
      const spy = mockSkillProgressScenario('NZ', 'Y5', {
        coreMasterRatio: 0.85,
        extensionMastered: 1,
      });

      const progress = await CurriculumTracker.getCurriculumProgress('test-profile');

      expect(progress.overallStatus).toBe('ahead');
      spy.mockRestore();
    });

    it('should include calculatedAt timestamp', async () => {
      const profile = createMockProfile();
      mockProfileGet.mockResolvedValue(profile);
      mockToArray.mockResolvedValue([]);

      const before = new Date().toISOString();
      const progress = await CurriculumTracker.getCurriculumProgress('test-profile');
      const after = new Date().toISOString();

      expect(progress.calculatedAt).toBeDefined();
      expect(progress.calculatedAt >= before).toBe(true);
      expect(progress.calculatedAt <= after).toBe(true);
    });
  });

  describe('getRecommendedFocus', () => {
    it('should return up to maxRecommendations skills', async () => {
      const profile = createMockProfile({
        country: 'NZ',
        yearGrade: 'Y3',
      });

      mockProfileGet.mockResolvedValue(profile);
      mockToArray.mockResolvedValue([]);

      const recommendations = await CurriculumTracker.getRecommendedFocus(
        'test-profile',
        3
      );

      expect(recommendations.length).toBeLessThanOrEqual(3);
    });

    it('should prioritize in-progress skills first', async () => {
      const profile = createMockProfile({
        country: 'NZ',
        yearGrade: 'Y1',
      });

      // Create some progress on NB10
      const records: MasteryRecord[] = [
        createMasteryRecord('test-profile', '3+7=10', 'addition', {
          attempts: 5,
          correct: 3,
          status: 'learning',
        }),
      ];

      mockProfileGet.mockResolvedValue(profile);
      mockToArray.mockResolvedValue(records);

      const recommendations = await CurriculumTracker.getRecommendedFocus(
        'test-profile',
        5
      );

      // Should have recommendations
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should return skills with priority and reason', async () => {
      const profile = createMockProfile({
        country: 'NZ',
        yearGrade: 'Y1',
      });

      mockProfileGet.mockResolvedValue(profile);
      mockToArray.mockResolvedValue([]);

      const recommendations = await CurriculumTracker.getRecommendedFocus(
        'test-profile',
        3
      );

      for (const rec of recommendations) {
        expect(rec.skillId).toBeDefined();
        expect(rec.label).toBeDefined();
        expect(rec.reason).toBeDefined();
        expect(rec.priority).toBeGreaterThan(0);
        expect(rec.proficiency).toBeDefined();
        expect(rec.action).toBeDefined();
        expect(rec.action.config).toBeDefined();
      }
    });

    it('should include next-skill reason for not-started skills', async () => {
      const profile = createMockProfile({
        country: 'NZ',
        yearGrade: 'Y1',
      });

      mockProfileGet.mockResolvedValue(profile);
      mockToArray.mockResolvedValue([]);

      const recommendations = await CurriculumTracker.getRecommendedFocus(
        'test-profile',
        5
      );

      // With no progress, all recommendations should be "next-skill"
      const nextSkillRecs = recommendations.filter((r) => r.reason === 'next-skill');
      expect(nextSkillRecs.length).toBeGreaterThan(0);
    });
  });

  describe('getBenchmarkSkills', () => {
    it('should return core and extension skills for valid benchmark', () => {
      const result = CurriculumTracker.getBenchmarkSkills('NZ', 'Y3');

      expect(result).toBeDefined();
      expect(result?.coreSkills).toContain('TT_CORE');
      expect(result?.coreSkills).toContain('ADD_SUB_1000');
      expect(result?.extensionSkills).toContain('TT_1_10_ALL');
    });

    it('should return undefined for invalid year', () => {
      const result = CurriculumTracker.getBenchmarkSkills('NZ', 'Y99');
      expect(result).toBeUndefined();
    });

    it('should return US Kindergarten skills', () => {
      const result = CurriculumTracker.getBenchmarkSkills('US', 'K');

      expect(result).toBeDefined();
      expect(result?.coreSkills).toContain('NB10');
      expect(result?.coreSkills).toContain('ADD_SUB_20');
    });
  });
});

describe('CurriculumTracker - Proficiency Calculation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToArray.mockResolvedValue([]);
    mockProfileGet.mockResolvedValue(null);
  });

  it('should return mastered for high accuracy, coverage, and speed', async () => {
    // Create mastery records that would qualify for "mastered"
    const records: MasteryRecord[] = [];
    for (let i = 0; i <= 10; i++) {
      records.push(
        createMasteryRecord('test-profile', `${i}+${10-i}=10`, 'addition', {
          attempts: 25,
          correct: 23, // 92% accuracy
          avgResponseTime: 1500, // Fast
          status: 'mastered',
        })
      );
    }

    mockToArray.mockResolvedValue(records);

    const progress = await CurriculumTracker.getSkillProgress(
      'test-profile',
      'NB10'
    );

    // With 11 records, 100% coverage, high accuracy, fast time, should be mastered
    expect(progress.coverage).toBe(100);
    expect(progress.accuracy).toBeGreaterThan(85);
    expect(progress.masteredFactCount).toBe(11);
    expect(progress.proficiency).toBe('mastered');
  });

  it('should return proficient for good accuracy and coverage', async () => {
    const records: MasteryRecord[] = [];
    for (let i = 0; i <= 6; i++) {
      records.push(
        createMasteryRecord('test-profile', `${i}+${10-i}=10`, 'addition', {
          attempts: 15,
          correct: 12, // 80% accuracy
          avgResponseTime: 2500,
          status: 'learning',
        })
      );
    }

    mockToArray.mockResolvedValue(records);

    const progress = await CurriculumTracker.getSkillProgress(
      'test-profile',
      'NB10'
    );

    // 7/11 = 64% coverage, 80% accuracy = proficient
    expect(progress.proficiency).toBe('proficient');
  });

  it('should downgrade to proficient when responses are too slow for mastery', async () => {
    const records: MasteryRecord[] = [];
    for (let i = 0; i <= 10; i++) {
      records.push(
        createMasteryRecord('test-profile', `${i}+${10 - i}=10`, 'addition', {
          attempts: 25,
          correct: 23,
          avgResponseTime: 4000, // slower than mastery threshold
          status: 'mastered',
        })
      );
    }

    mockToArray.mockResolvedValue(records);

    const progress = await CurriculumTracker.getSkillProgress(
      'test-profile',
      'NB10'
    );

    expect(progress.coverage).toBe(100);
    expect(progress.accuracy).toBeGreaterThan(90);
    expect(progress.proficiency).toBe('proficient');
  });

  it('should stay developing when coverage is below the proficient threshold', async () => {
    const records: MasteryRecord[] = [];
    for (let i = 0; i < 5; i++) {
      records.push(
        createMasteryRecord('test-profile', `${i}+${10 - i}=10`, 'addition', {
          attempts: 12,
          correct: 11,
          avgResponseTime: 1800,
          status: 'learning',
        })
      );
    }

    mockToArray.mockResolvedValue(records);

    const progress = await CurriculumTracker.getSkillProgress(
      'test-profile',
      'NB10'
    );

    // Coverage is < 60% but above the not-started threshold, so still developing
    expect(progress.coverage).toBeLessThan(60);
    expect(progress.coverage).toBeGreaterThan(30);
    expect(progress.proficiency).toBe('developing');
  });

  it('should remain not-started when coverage is below 30 even with attempts', async () => {
    const records: MasteryRecord[] = [];
    for (let i = 0; i < 2; i++) {
      records.push(
        createMasteryRecord('test-profile', `${i}+${10 - i}=10`, 'addition', {
          attempts: 10,
          correct: 9,
          avgResponseTime: 2000,
          status: 'learning',
        })
      );
    }

    mockToArray.mockResolvedValue(records);

    const progress = await CurriculumTracker.getSkillProgress(
      'test-profile',
      'NB10'
    );

    expect(progress.coverage).toBeLessThan(30);
    expect(progress.proficiency).toBe('not-started');
  });
});

describe('CurriculumTracker - Status Calculation (behind/on-track/ahead)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToArray.mockResolvedValue([]);
    mockProfileGet.mockResolvedValue(null);
  });

  it('should return "behind" when all core skills are not-started', async () => {
    const profile = createMockProfile({
      country: 'NZ',
      yearGrade: 'Y1',
    });

    mockProfileGet.mockResolvedValue(profile);
    mockToArray.mockResolvedValue([]);

    const progress = await CurriculumTracker.getCurriculumProgress('test-profile');

    expect(progress.overallStatus).toBe('behind');
  });

  it('should return "behind" when >50% of core skills are developing', async () => {
    const profile = createMockProfile({
      country: 'NZ',
      yearGrade: 'Y1',
    });

    // Create a few records with low accuracy - will result in 'developing' status
    const records: MasteryRecord[] = [
      createMasteryRecord('test-profile', '3+7=10', 'addition', {
        attempts: 5,
        correct: 2, // 40% accuracy - developing
        status: 'learning',
      }),
    ];

    mockProfileGet.mockResolvedValue(profile);
    mockToArray.mockResolvedValue(records);

    const progress = await CurriculumTracker.getCurriculumProgress('test-profile');

    // Most skills will still be not-started, so behind
    expect(progress.overallStatus).toBe('behind');
  });

  it('should return valid CurriculumStatus type', async () => {
    const profile = createMockProfile({
      country: 'NZ',
      yearGrade: 'Y3',
    });

    mockProfileGet.mockResolvedValue(profile);
    mockToArray.mockResolvedValue([]);

    const progress = await CurriculumTracker.getCurriculumProgress('test-profile');

    expect(['behind', 'on-track', 'ahead']).toContain(progress.overallStatus);
  });
});

describe('Skill matching helpers', () => {
  it('matches number bond skills correctly', () => {
    expect(doesFactMatchSkill('3+7=10', 'NB10')).toBe(true);
    expect(doesFactMatchSkill('3+8=11', 'NB10')).toBe(false);
    expect(doesFactMatchSkill('15+5=20', 'NB20')).toBe(true);
    expect(doesFactMatchSkill('15+4=19', 'NB20')).toBe(false);
    expect(doesFactMatchSkill('0.4+0.6=1.0', 'NB_DEC1')).toBe(true);
    expect(doesFactMatchSkill('0.4+0.4=0.8', 'NB_DEC1')).toBe(false);
  });

  it('matches addition/subtraction ranges', () => {
    expect(doesFactMatchSkill('12+5=17', 'ADD_SUB_20')).toBe(true);
    expect(doesFactMatchSkill('32+5=37', 'ADD_SUB_20')).toBe(false);
    expect(doesFactMatchSkill('250-75=175', 'ADD_SUB_1000')).toBe(true);
    expect(doesFactMatchSkill('250-75=175', 'ADD_SUB_20')).toBe(false);
  });

  it('matches times tables selections', () => {
    expect(doesFactMatchSkill('2x6=12', 'TT_2_5_10')).toBe(true);
    expect(doesFactMatchSkill('7x6=42', 'TT_2_5_10')).toBe(false);
    expect(doesFactMatchSkill('9x11=99', 'TT_1_12_ALL')).toBe(true);
  });

  it('matches division skill filters', () => {
    expect(doesFactMatchSkill('30/5=6', 'DIV_2_5_10')).toBe(true);
    expect(doesFactMatchSkill('30/7=4', 'DIV_2_5_10')).toBe(false);
    expect(doesFactMatchSkill('96/12=8', 'DIV_1_12_ALL')).toBe(true);
  });

  it('matches doubles and halves skills', () => {
    expect(doesFactMatchSkill('12+12=24', 'DBL_20')).toBe(true);
    expect(doesFactMatchSkill('12+13=25', 'DBL_20')).toBe(false);
    expect(doesFactMatchSkill('250+250=500', 'DBL_3DIG')).toBe(true);
  });

  it('matches square number skills', () => {
    expect(doesFactMatchSkill('7x7=49', 'SQ_1_10')).toBe(true);
    expect(doesFactMatchSkill('13x13=169', 'SQ_1_10')).toBe(false);
    expect(doesFactMatchSkill('12x12=144', 'SQ_1_12')).toBe(true);
  });

  it('filterRecordsForSkill returns only number bond records for the matching skill', () => {
    const records: MasteryRecord[] = [
      createMasteryRecord('p1', '3+7=10', 'addition'),
      createMasteryRecord('p1', '15+5=20', 'addition'),
      createMasteryRecord('p1', '50+50=100', 'addition'),
    ];

    const nb10 = filterRecordsForSkill(records, 'NB10');
    const nb20 = filterRecordsForSkill(records, 'NB20');

    expect(nb10).toHaveLength(1);
    expect(nb10[0].fact).toBe('3+7=10');

    expect(nb20).toHaveLength(1);
    expect(nb20[0].fact).toBe('15+5=20');
  });

  it('filterRecordsForSkill enforces operation/number range constraints', () => {
    const records: MasteryRecord[] = [
      createMasteryRecord('p1', '12+5=17', 'addition'),
      createMasteryRecord('p1', '60+25=85', 'addition'),
      createMasteryRecord('p1', '250+75=325', 'addition'),
    ];

    const add20 = filterRecordsForSkill(records, 'ADD_SUB_20');
    const add100 = filterRecordsForSkill(records, 'ADD_SUB_100');
    const add1000 = filterRecordsForSkill(records, 'ADD_SUB_1000');

    expect(add20.map((r) => r.fact)).toEqual(['12+5=17']);
    expect(add100.map((r) => r.fact)).toEqual(['60+25=85']);
    expect(add1000.map((r) => r.fact)).toEqual(['250+75=325']);
  });

  it('filterRecordsForSkill assigns overlapping facts to the most specific skill', () => {
    const records: MasteryRecord[] = [
      createMasteryRecord('p1', '2x5=10', 'multiplication'),
      createMasteryRecord('p1', '3x4=12', 'multiplication'),
      createMasteryRecord('p1', '7x6=42', 'multiplication'),
    ];

    const ttSmall = filterRecordsForSkill(records, 'TT_2_5_10');
    const ttCore = filterRecordsForSkill(records, 'TT_CORE');
    const ttAll = filterRecordsForSkill(records, 'TT_1_10_ALL');

    expect(ttSmall.map((r) => r.fact)).toEqual(['2x5=10']);
    expect(ttCore.map((r) => r.fact)).toEqual(['3x4=12']);
    expect(ttAll.map((r) => r.fact)).toEqual(['7x6=42']);
  });
});
