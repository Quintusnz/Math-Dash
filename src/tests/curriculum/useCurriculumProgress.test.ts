/**
 * Unit Tests for useCurriculumProgress hook
 * Tests the hook's loading, caching, auto-refresh, and error handling behavior
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import {
  useCurriculumProgress,
  clearCurriculumProgressCache,
  _testExports,
} from '@/lib/hooks/useCurriculumProgress';
import type { CurriculumProgress, RecommendedSkill, SkillProgress } from '@/lib/game-engine/curriculum-tracker';
import type { Profile } from '@/lib/db';

// Mock data
const mockSkillProgress: SkillProgress = {
  skillId: 'TT_CORE',
  label: 'Times Tables (1-10)',
  proficiency: 'developing',
  accuracy: 75,
  coverage: 50,
  totalAttempts: 20,
  totalCorrect: 15,
  avgResponseTime: 2500,
  masteredFactCount: 5,
  expectedFactCount: 100,
  isCore: true,
  isExtension: false,
  lastPracticedAt: '2025-12-01T10:00:00Z',
};

const mockCurriculumProgress: CurriculumProgress = {
  overallStatus: 'on-track',
  overallPercentage: 55,
  coreSkillProgress: [
    mockSkillProgress,
    { ...mockSkillProgress, skillId: 'ADD_20', label: 'Addition to 20', proficiency: 'proficient' },
  ],
  extensionSkillProgress: [
    { ...mockSkillProgress, skillId: 'TT_EXT', label: 'Times Tables (11-12)', isCore: false, isExtension: true, proficiency: 'not-started' },
  ],
  coreSkillCounts: { 'not-started': 0, developing: 1, proficient: 1, mastered: 0 },
  extensionSkillCounts: { 'not-started': 1, developing: 0, proficient: 0, mastered: 0 },
  country: 'NZ',
  yearGrade: 'Y4',
  countryLabel: 'New Zealand',
  yearGradeLabel: 'Year 4',
  calculatedAt: '2025-12-01T12:00:00Z',
};

const mockRecommendedFocus: RecommendedSkill[] = [
  {
    skillId: 'TT_CORE',
    label: 'Times Tables (1-10)',
    reason: 'in-progress',
    priority: 1,
    proficiency: 'developing',
    coverage: 50,
  },
];

const mockProfile: Profile = {
  id: 'test-profile',
  playCode: 'DASH-TEST',
  displayName: 'Test User',
  ageBand: '8-9',
  avatarId: 'avatar1',
  isGuest: false,
  classroomId: null,
  preferences: { theme: 'default', soundEnabled: true, hapticsEnabled: true },
  country: 'NZ',
  yearGrade: 'Y4',
  syncStatus: 'local',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

// Mock implementations
const mockGetCurriculumProgress = vi.fn().mockResolvedValue(mockCurriculumProgress);
const mockGetRecommendedFocus = vi.fn().mockResolvedValue(mockRecommendedFocus);
const mockProfileGet = vi.fn().mockResolvedValue(mockProfile);

// Track useLiveQuery callback so we can trigger updates
let useLiveQueryCallback: (() => Promise<Profile | undefined>) | null = null;

// Mock modules
vi.mock('@/lib/game-engine/curriculum-tracker', () => ({
  CurriculumTracker: {
    getCurriculumProgress: () => mockGetCurriculumProgress(),
    getRecommendedFocus: (_profileId: string, _max: number) => mockGetRecommendedFocus(),
  },
}));

vi.mock('@/lib/db', () => ({
  db: {
    profiles: {
      get: (id: string) => mockProfileGet(id),
    },
  },
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (callback: () => Promise<Profile | undefined>, deps: unknown[]) => {
    useLiveQueryCallback = callback;
    // Return mock profile synchronously
    return mockProfile;
  },
}));

// Mock game store
const mockGameStatus = { current: 'idle' as string };
vi.mock('@/lib/stores/useGameStore', () => ({
  useGameStore: (selector: (state: { status: string }) => string) => {
    return selector({ status: mockGameStatus.current });
  },
}));

describe('useCurriculumProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCurriculumProgressCache();
    mockGameStatus.current = 'idle';
    mockGetCurriculumProgress.mockResolvedValue(mockCurriculumProgress);
    mockGetRecommendedFocus.mockResolvedValue(mockRecommendedFocus);
    mockProfileGet.mockResolvedValue(mockProfile);
  });

  afterEach(() => {
    clearCurriculumProgressCache();
  });

  describe('hook signature and return values', () => {
    it('should accept profileId as parameter', async () => {
      const { result } = renderHook(() => useCurriculumProgress('test-profile'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(mockGetCurriculumProgress).toHaveBeenCalled();
    });

    it('should return all required properties', async () => {
      const { result } = renderHook(() => useCurriculumProgress('test-profile'));
      
      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe(null);
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Check all return properties exist
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('overallStatus');
      expect(result.current).toHaveProperty('skillProgress');
      expect(result.current).toHaveProperty('coreProgress');
      expect(result.current).toHaveProperty('extensionProgress');
      expect(result.current).toHaveProperty('recommendedFocus');
      expect(result.current).toHaveProperty('refresh');
      expect(result.current).toHaveProperty('curriculumInfo');
    });

    it('should return loading: boolean', async () => {
      const { result } = renderHook(() => useCurriculumProgress('test-profile'));
      
      expect(typeof result.current.loading).toBe('boolean');
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(typeof result.current.loading).toBe('boolean');
    });

    it('should return error: Error | null', async () => {
      const { result } = renderHook(() => useCurriculumProgress('test-profile'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.error).toBe(null);
    });

    it('should return overallStatus with correct type', async () => {
      const { result } = renderHook(() => useCurriculumProgress('test-profile'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(['ahead', 'on-track', 'behind', null]).toContain(result.current.overallStatus);
      expect(result.current.overallStatus).toBe('on-track');
    });

    it('should return skillProgress as array', async () => {
      const { result } = renderHook(() => useCurriculumProgress('test-profile'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(Array.isArray(result.current.skillProgress)).toBe(true);
      expect(result.current.skillProgress.length).toBeGreaterThan(0);
    });

    it('should return coreProgress with complete and total', async () => {
      const { result } = renderHook(() => useCurriculumProgress('test-profile'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.coreProgress).toHaveProperty('complete');
      expect(result.current.coreProgress).toHaveProperty('total');
      expect(typeof result.current.coreProgress.complete).toBe('number');
      expect(typeof result.current.coreProgress.total).toBe('number');
    });

    it('should return extensionProgress with complete and total', async () => {
      const { result } = renderHook(() => useCurriculumProgress('test-profile'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.extensionProgress).toHaveProperty('complete');
      expect(result.current.extensionProgress).toHaveProperty('total');
    });

    it('should return recommendedFocus as array', async () => {
      const { result } = renderHook(() => useCurriculumProgress('test-profile'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(Array.isArray(result.current.recommendedFocus)).toBe(true);
      expect(result.current.recommendedFocus).toEqual(mockRecommendedFocus);
    });

    it('should return refresh as function', async () => {
      const { result } = renderHook(() => useCurriculumProgress('test-profile'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(typeof result.current.refresh).toBe('function');
    });
  });

  describe('CurriculumTracker integration', () => {
    it('should use CurriculumTracker.getCurriculumProgress', async () => {
      const { result } = renderHook(() => useCurriculumProgress('test-profile'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(mockGetCurriculumProgress).toHaveBeenCalled();
    });

    it('should use CurriculumTracker.getRecommendedFocus', async () => {
      const { result } = renderHook(() => useCurriculumProgress('test-profile'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(mockGetRecommendedFocus).toHaveBeenCalled();
    });
  });

  describe('caching behavior (5 min TTL)', () => {
    it('should cache results and not call tracker on second render', async () => {
      const { result, rerender } = renderHook(() => useCurriculumProgress('test-profile'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(mockGetCurriculumProgress).toHaveBeenCalledTimes(1);
      
      // Rerender the hook
      rerender();
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      // Should still only be called once (cached)
      expect(mockGetCurriculumProgress).toHaveBeenCalledTimes(1);
    });

    it('should respect 5-minute cache TTL', async () => {
      const { result } = renderHook(() => useCurriculumProgress('test-profile'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(_testExports.CACHE_TTL_MS).toBe(5 * 60 * 1000); // 5 minutes
    });

    it('should invalidate cache after TTL expires', async () => {
      vi.useFakeTimers();
      
      const { result, unmount } = renderHook(() => useCurriculumProgress('test-profile'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(mockGetCurriculumProgress).toHaveBeenCalledTimes(1);
      
      // Advance time past cache TTL
      vi.advanceTimersByTime(6 * 60 * 1000); // 6 minutes
      
      unmount();
      
      // Render new hook instance after cache expired
      const { result: result2 } = renderHook(() => useCurriculumProgress('test-profile'));
      
      await waitFor(() => {
        expect(result2.current.loading).toBe(false);
      });
      
      // Should call again because cache expired
      expect(mockGetCurriculumProgress).toHaveBeenCalledTimes(2);
      
      vi.useRealTimers();
    });

    it('should bypass cache when refresh() is called', async () => {
      const { result } = renderHook(() => useCurriculumProgress('test-profile'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(mockGetCurriculumProgress).toHaveBeenCalledTimes(1);
      
      // Call refresh
      act(() => {
        result.current.refresh();
      });
      
      await waitFor(() => {
        expect(mockGetCurriculumProgress).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('auto-refresh on game session completion', () => {
    it('should refresh when game status changes from playing to finished', async () => {
      mockGameStatus.current = 'playing';
      
      const { result, rerender } = renderHook(() => useCurriculumProgress('test-profile'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(mockGetCurriculumProgress).toHaveBeenCalledTimes(1);
      
      // Simulate game finishing
      mockGameStatus.current = 'finished';
      rerender();
      
      await waitFor(() => {
        expect(mockGetCurriculumProgress).toHaveBeenCalledTimes(2);
      });
    });

    it('should not refresh when game status changes to something other than finished', async () => {
      mockGameStatus.current = 'playing';
      
      const { result, rerender } = renderHook(() => useCurriculumProgress('test-profile'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(mockGetCurriculumProgress).toHaveBeenCalledTimes(1);
      
      // Simulate game pausing (not finishing)
      mockGameStatus.current = 'paused';
      rerender();
      
      // Give it a moment
      await new Promise((r) => setTimeout(r, 50));
      
      // Should still only be called once
      expect(mockGetCurriculumProgress).toHaveBeenCalledTimes(1);
    });
  });

  describe('graceful handling of missing country/yearGrade', () => {
    it('should handle profile without country', async () => {
      mockGetCurriculumProgress.mockResolvedValue({
        ...mockCurriculumProgress,
        country: undefined,
        yearGrade: undefined,
        countryLabel: undefined,
        yearGradeLabel: undefined,
      });

      const { result } = renderHook(() => useCurriculumProgress('test-profile'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.error).toBe(null);
      expect(result.current.curriculumInfo).toBe(null);
    });

    it('should handle profile without yearGrade', async () => {
      mockGetCurriculumProgress.mockResolvedValue({
        ...mockCurriculumProgress,
        yearGrade: undefined,
        yearGradeLabel: undefined,
      });

      const { result } = renderHook(() => useCurriculumProgress('test-profile'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.error).toBe(null);
      // Should still have country info
      expect(result.current.curriculumInfo).not.toBe(null);
    });

    it('should return curriculumInfo when country and yearGrade are set', async () => {
      const { result } = renderHook(() => useCurriculumProgress('test-profile'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.curriculumInfo).toEqual({
        country: 'NZ',
        yearGrade: 'Y4',
        countryLabel: 'New Zealand',
        yearGradeLabel: 'Year 4',
      });
    });
  });

  describe('error handling', () => {
    it('should handle empty profileId gracefully', async () => {
      const { result } = renderHook(() => useCurriculumProgress(''));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.error).not.toBe(null);
      expect(result.current.error?.message).toBe('No profile ID provided');
    });

    it('should handle CurriculumTracker errors', async () => {
      const testError = new Error('Database connection failed');
      mockGetCurriculumProgress.mockRejectedValue(testError);

      const { result } = renderHook(() => useCurriculumProgress('test-profile'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.error).toBe(testError);
      expect(result.current.overallStatus).toBe(null);
    });

    it('should handle non-Error exceptions', async () => {
      mockGetCurriculumProgress.mockRejectedValue('string error');

      const { result } = renderHook(() => useCurriculumProgress('test-profile'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Failed to load curriculum progress');
    });
  });

  describe('progress calculations', () => {
    it('should calculate coreProgress.complete correctly', async () => {
      const { result } = renderHook(() => useCurriculumProgress('test-profile'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      // From mockCurriculumProgress: 1 proficient skill in core
      expect(result.current.coreProgress.complete).toBe(1);
      expect(result.current.coreProgress.total).toBe(2);
    });

    it('should calculate extensionProgress correctly', async () => {
      const { result } = renderHook(() => useCurriculumProgress('test-profile'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      // From mockCurriculumProgress: 0 proficient/mastered in extension
      expect(result.current.extensionProgress.complete).toBe(0);
      expect(result.current.extensionProgress.total).toBe(1);
    });

    it('should combine core and extension skills in skillProgress', async () => {
      const { result } = renderHook(() => useCurriculumProgress('test-profile'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      // 2 core + 1 extension = 3 total
      expect(result.current.skillProgress.length).toBe(3);
    });
  });

  describe('clearCurriculumProgressCache utility', () => {
    it('should clear cache for specific profileId', async () => {
      const { result } = renderHook(() => useCurriculumProgress('test-profile'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(_testExports.progressCache.has('test-profile')).toBe(true);
      
      clearCurriculumProgressCache('test-profile');
      
      expect(_testExports.progressCache.has('test-profile')).toBe(false);
    });

    it('should clear entire cache when no profileId provided', async () => {
      const { result } = renderHook(() => useCurriculumProgress('test-profile'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(_testExports.progressCache.size).toBeGreaterThan(0);
      
      clearCurriculumProgressCache();
      
      expect(_testExports.progressCache.size).toBe(0);
    });
  });
});
