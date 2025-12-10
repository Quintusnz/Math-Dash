import { describe, expect, it, afterEach, beforeEach } from 'vitest';
import { CurriculumTracker } from '../../src/lib/game-engine/curriculum-tracker';
import { db, type MasteryRecord, type Profile } from '../../src/lib/db';
import { SKILL_GAME_MAP } from '../../src/lib/constants/skill-game-mapping';
import type { SkillId } from '../../src/lib/constants/curriculum-data';

// Lightweight performance sanity checks for curriculum calculations.
// These stub Dexie tables to avoid IndexedDB overhead while still exercising
// the computation paths over large mastery datasets.

const skillId = Object.keys(SKILL_GAME_MAP)[0] as SkillId;

const makeMasteryRecords = (count: number): MasteryRecord[] =>
  Array.from({ length: count }, (_, idx) => ({
    id: idx,
    profileId: 'perf-profile',
    fact: `${(idx % 12) + 1}x${((idx + 3) % 12) + 1}`,
    operation: 'multiplication',
    attempts: 3 + (idx % 5),
    correct: 2 + (idx % 3),
    avgResponseTime: 1800,
    lastAttemptAt: new Date().toISOString(),
    status: idx % 7 === 0 ? 'mastered' : 'learning',
    weight: 1,
  }));

describe('CurriculumTracker performance', () => {
  const originalMastery = db.mastery;
  const originalProfiles = db.profiles;

  beforeEach(() => {
    const masteryRecords = makeMasteryRecords(1500);
    // Stub mastery and profiles tables to return large in-memory datasets quickly.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any).mastery = {
      where: () => ({
        equals: () => ({
          toArray: async () => masteryRecords,
        }),
      }),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any).profiles = {
      get: async (_id: string): Promise<Profile> => ({
        id: 'perf-profile',
        playCode: null,
        displayName: 'Perf Profile',
        ageBand: '7-9',
        avatarId: 'default',
        isGuest: true,
        classroomId: null,
        preferences: { theme: 'light', soundEnabled: true, hapticsEnabled: true },
        country: 'NZ',
        yearGrade: 'Y3',
        syncStatus: 'local',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    };
  });

  afterEach(() => {
    // Restore Dexie tables to avoid leaking mocks to other tests.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any).mastery = originalMastery;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any).profiles = originalProfiles;
  });

  it('calculates single-skill progress under 100ms with 1.5k mastery records', async () => {
    const start = performance.now();
    const result = await CurriculumTracker.getSkillProgress('perf-profile', skillId, 'NZ', 'Y3');
    const durationMs = performance.now() - start;

    expect(result).toBeTruthy();
    expect(durationMs).toBeLessThan(100);
  });

  it('calculates full curriculum progress under 500ms with 1.5k mastery records', async () => {
    const start = performance.now();
    const result = await CurriculumTracker.getCurriculumProgress('perf-profile');
    const durationMs = performance.now() - start;

    expect(result.coreSkillProgress.length + result.extensionSkillProgress.length).toBeGreaterThan(0);
    expect(durationMs).toBeLessThan(500);
  });
});
