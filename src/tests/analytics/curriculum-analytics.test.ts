import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearAnalyticsQueue,
  getAnalyticsQueue,
  getCurriculumVariant,
  trackCurriculumProgressViewed,
  trackCurriculumProfileSet,
} from '@/lib/analytics/curriculum-analytics';

describe('curriculum analytics helpers', () => {
  const analyticsMock = { track: vi.fn() };

  beforeEach(() => {
    clearAnalyticsQueue();
    analyticsMock.track.mockClear();
    globalThis.window = {
      analytics: analyticsMock,
      localStorage: { getItem: vi.fn(() => null), setItem: vi.fn() },
    } as unknown as Window & typeof globalThis;
  });

  afterEach(() => {
    delete (globalThis as any).window;
  });

  it('returns deterministic variant values', () => {
    const first = getCurriculumVariant('profile-123');
    const second = getCurriculumVariant('profile-123');
    const other = getCurriculumVariant('another-profile');

    expect(first).toBe(second);
    expect(other).not.toBe(first);
  });

  it('tracks curriculum profile set events', () => {
    trackCurriculumProfileSet('profile-1', {
      country: 'NZ',
      yearGrade: 'Y3',
      source: 'profile_creator',
      actionStage: 'setup',
    });

    const queue = getAnalyticsQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].eventName).toBe('curriculum_profile_set');
    expect(analyticsMock.track).toHaveBeenCalledWith('curriculum_profile_set', expect.any(Object));
  });

  it('tracks progress view events', () => {
    trackCurriculumProgressViewed('profile-2', 'on-track');

    const queue = getAnalyticsQueue();
    expect(queue[0].eventName).toBe('curriculum_progress_viewed');
    expect(queue[0].properties).toHaveProperty('overallStatus', 'on-track');
  });
});
