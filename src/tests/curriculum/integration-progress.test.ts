/**
 * Integration-style tests for curriculum progress and recommendations with sample data.
 * These tests mock the DB but exercise CurriculumTracker end-to-end across countries/years.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CurriculumTracker,
  type CurriculumProgress,
} from '@/lib/game-engine/curriculum-tracker';
import type { MasteryRecord, Profile } from '@/lib/db';
import { SKILL_GAME_MAP, SKILL_GAME_MAPPING } from '@/lib/constants/skill-game-mapping';
import { SKILLS, type SkillId } from '@/lib/constants/curriculum-data';

// Shared mocks for db
const mockToArray = vi.fn().mockResolvedValue([] as MasteryRecord[]);
const mockProfileGet = vi.fn().mockResolvedValue(null as Profile | null);

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

function createProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'profile-id',
    playCode: 'CODE-123',
    displayName: 'Test User',
    ageBand: '7-8',
    avatarId: 'avatar1',
    isGuest: false,
    classroomId: null,
    preferences: { theme: 'default', soundEnabled: true, hapticsEnabled: true },
    syncStatus: 'local',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function mastery(
  profileId: string,
  skillId: SkillId,
  fact: string,
  overrides: Partial<MasteryRecord> = {}
): MasteryRecord {
  return {
    profileId,
    fact,
    operation: 'multiplication',
    attempts: 10,
    correct: 7,
    avgResponseTime: 2000,
    lastAttemptAt: new Date().toISOString(),
    status: 'learning',
    weight: 1,
    ...overrides,
  };
}

describe('CurriculumTracker integration - sample profiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToArray.mockResolvedValue([]);
    mockProfileGet.mockResolvedValue(null);
  });

  it('new player profile (no mastery) returns behind with not-started skills', async () => {
    mockProfileGet.mockResolvedValue(createProfile({ country: 'NZ', yearGrade: 'Y3' }));
    mockToArray.mockResolvedValue([]);

    const progress = await CurriculumTracker.getCurriculumProgress('p1');
    expect(progress.coreSkillProgress.length).toBeGreaterThan(0);
    expect(progress.coreSkillCounts['not-started']).toBeGreaterThan(0);
    expect(progress.overallStatus).toBe('behind');
  });

  it('developing player (low accuracy) has developing proficiency', async () => {
    const profile = createProfile({ country: 'NZ', yearGrade: 'Y1' }); // NB10 is core in Y1
    mockProfileGet.mockResolvedValue(profile);
    // A couple of facts for a core skill with low accuracy
    mockToArray.mockResolvedValue([
      mastery(profile.id, 'NB10', '3+7=10', { attempts: 6, correct: 3, operation: 'addition' }),
      mastery(profile.id, 'NB10', '4+6=10', { attempts: 6, correct: 3, operation: 'addition' }),
    ]);

    const progress = await CurriculumTracker.getCurriculumProgress(profile.id);
    expect(progress.coreSkillProgress.some((p) => p.proficiency === 'developing')).toBe(true);
  });

  it('proficient player (solid accuracy/coverage on a skill)', async () => {
    const profile = createProfile({ country: 'NZ', yearGrade: 'Y1' }); // NB10 core with small expected count
    mockProfileGet.mockResolvedValue(profile);
    // Ensure good accuracy + coverage + attempts for one core skill
    mockToArray.mockResolvedValue([
      mastery(profile.id, 'NB10', '0+10=10', { attempts: 12, correct: 10, operation: 'addition' }),
      mastery(profile.id, 'NB10', '1+9=10', { attempts: 12, correct: 10, operation: 'addition' }),
      mastery(profile.id, 'NB10', '2+8=10', { attempts: 12, correct: 10, operation: 'addition' }),
      mastery(profile.id, 'NB10', '3+7=10', { attempts: 12, correct: 10, operation: 'addition' }),
      mastery(profile.id, 'NB10', '4+6=10', { attempts: 12, correct: 10, operation: 'addition' }),
      mastery(profile.id, 'NB10', '5+5=10', { attempts: 12, correct: 10, operation: 'addition' }),
    ]);

    const progress = await CurriculumTracker.getCurriculumProgress(profile.id);
    expect(progress.coreSkillProgress.some((p) => p.proficiency === 'proficient')).toBe(true);
  });

  it('advanced player (all skills forced mastered) yields ahead status', async () => {
    const profile = createProfile({ country: 'NZ', yearGrade: 'Y1' });
    mockProfileGet.mockResolvedValue(profile);

    // Temporarily force low expected fact counts and permissive filters so a single record masters each skill.
    const originalConfigs = new Map<SkillId, { expectedFactCount: number; factFilter?: (fact: string) => boolean }>();
    SKILL_GAME_MAPPING.forEach((cfg) => {
      originalConfigs.set(cfg.skillId, {
        expectedFactCount: cfg.expectedFactCount,
        factFilter: cfg.factFilter,
      });
      cfg.expectedFactCount = 1;
      cfg.factFilter = () => true;
    });

    const records: MasteryRecord[] = SKILLS.map((s) =>
      mastery(profile.id, s.id, `${s.id}=fact`, {
        attempts: 25,
        correct: 24,
        avgResponseTime: 1000,
        status: 'mastered',
        weight: 0,
      })
    );
    mockToArray.mockResolvedValue(records);

    const progress = await CurriculumTracker.getCurriculumProgress(profile.id);
    expect(progress.overallStatus).toBe('ahead');

    // Restore original configs
    SKILL_GAME_MAPPING.forEach((cfg) => {
      const orig = originalConfigs.get(cfg.skillId);
      if (orig) {
        cfg.expectedFactCount = orig.expectedFactCount;
        cfg.factFilter = orig.factFilter;
      }
    });
  });
});

describe('CurriculumTracker integration - country/year coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToArray.mockResolvedValue([]);
  });

  const cases: Array<{ country: Profile['country']; year: Profile['yearGrade'] }> = [
    { country: 'NZ', year: 'Y3' },
    { country: 'NZ', year: 'Y4' },
    { country: 'UK', year: 'Y2' },
    { country: 'UK', year: 'Y3' },
    { country: 'US', year: 'G2' },
    { country: 'US', year: 'G3' },
  ];

  it.each(cases)('should load benchmarks for %s %s', async ({ country, year }) => {
    const profile = createProfile({ country, yearGrade: year });
    mockProfileGet.mockResolvedValue(profile);
    const progress = await CurriculumTracker.getCurriculumProgress(profile.id);
    expect(progress.country).toBe(country);
    expect(progress.yearGrade).toBe(year);
    expect(progress.countryLabel).toBeDefined();
    expect(progress.yearGradeLabel).toBeDefined();
    expect(progress.coreSkillProgress.length).toBeGreaterThan(0);
  });
});

describe('CurriculumTracker integration - edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToArray.mockResolvedValue([]);
  });

  it('profile without country returns null curriculum info', async () => {
    const profile = createProfile({ country: undefined, yearGrade: undefined });
    mockProfileGet.mockResolvedValue(profile);
    const progress = await CurriculumTracker.getCurriculumProgress(profile.id);
    expect(progress.country).toBeUndefined();
    expect(progress.yearGrade).toBeUndefined();
    expect(progress.countryLabel).toBeUndefined();
  });

  it('profile with invalid yearGrade still returns progress (all skills as core)', async () => {
    const profile = createProfile({ country: 'NZ', yearGrade: 'Y99' });
    mockProfileGet.mockResolvedValue(profile);
    const progress = await CurriculumTracker.getCurriculumProgress(profile.id);
    expect(progress.coreSkillProgress.length).toBeGreaterThan(0);
  });
});
