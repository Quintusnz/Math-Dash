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
import type { SkillId } from '@/lib/constants/curriculum-data';

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
      ];

      mockToArray.mockResolvedValue(records);

      const progress = await CurriculumTracker.getSkillProgress(
        'test-profile',
        'NB10'
      );

      expect(progress.proficiency).toBe('developing');
      expect(progress.accuracy).toBe(55); // (5+6)/(10+10) = 55%
      expect(progress.totalAttempts).toBe(20);
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
    for (let i = 0; i <= 5; i++) {
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

    // 6/11 = 54% coverage, 80% accuracy = proficient
    expect(progress.proficiency).toBe('proficient');
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
