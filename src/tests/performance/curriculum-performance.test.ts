import { describe, expect, it, beforeEach, vi } from 'vitest';
import { performance } from 'perf_hooks';
import { CurriculumTracker } from '@/lib/game-engine/curriculum-tracker';
import type { MasteryRecord, Profile } from '@/lib/db';

const mockRecords: MasteryRecord[] = [];
const MASTER_SKILLS = ['NB10', 'ADD_SUB_20', 'TT_CORE', 'DIV_CORE', 'DBL_20', 'SQ_1_10'];

for (let i = 0; i < 1200; i++) {
  const skill = MASTER_SKILLS[i % MASTER_SKILLS.length];
  mockRecords.push({
    profileId: 'perf-profile',
    fact: `${i}+${i + 1}=${i * 2 + 1}`,
    operation: 'addition',
    attempts: 5 + (i % 5),
    correct: 3 + (i % 3),
    avgResponseTime: 1000 + (i % 500),
    lastAttemptAt: new Date().toISOString(),
    status: i % 3 === 0 ? 'mastered' : 'learning',
    weight: 1,
  });
}

const mockToArray = vi.fn();
const mockProfileGet = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    mastery: {
      where: () => ({
        equals: () => ({
          toArray: () => mockToArray(),
        }),
      }),
    },
    profiles: {
      get: () => mockProfileGet(),
    },
  },
}));

function createMockProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'perf-profile',
    playCode: 'DASH-PERF',
    displayName: 'Perf User',
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

describe('Curriculum performance (large dataset)', () => {
  beforeEach(() => {
    mockToArray.mockResolvedValue(mockRecords);
    mockProfileGet.mockResolvedValue(
      createMockProfile({
        country: 'NZ',
        yearGrade: 'Y3',
      }),
    );
  });

  it('runs curriculum progress calculation under target latency', async () => {
    const start = performance.now();
    await CurriculumTracker.getCurriculumProgress('perf-profile');
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(500);
  });

  it('maintains stable throughput when repeated', async () => {
    const firstStart = performance.now();
    await CurriculumTracker.getCurriculumProgress('perf-profile');
    const firstDuration = performance.now() - firstStart;
    const secondStart = performance.now();
    await CurriculumTracker.getCurriculumProgress('perf-profile');
    const secondDuration = performance.now() - secondStart;
    expect(secondDuration).toBeLessThan(500);
    expect(secondDuration).toBeLessThan(firstDuration + 100);
  });
});
