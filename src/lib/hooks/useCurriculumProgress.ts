/**
 * Curriculum Progress Hook
 * 
 * Provides curriculum progress data to components using CurriculumTracker.
 * 
 * Features:
 * - 5-minute caching to avoid excessive recalculation
 * - Auto-refresh when game sessions complete
 * - Graceful handling of missing country/yearGrade
 * - Recommended focus skills for practice
 * 
 * @see src/lib/game-engine/curriculum-tracker.ts for underlying logic
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Profile } from '@/lib/db';
import {
  CurriculumTracker,
  type SkillProgress,
  type CurriculumStatus,
  type RecommendedSkill,
} from '@/lib/game-engine/curriculum-tracker';
import { useGameStore } from '@/lib/stores/useGameStore';

// ============================================================================
// Types
// ============================================================================

export type OverallStatus = CurriculumStatus | null;

export interface CurriculumProgressData {
  /** Whether data is currently being loaded */
  loading: boolean;
  /** Any error that occurred during loading */
  error: Error | null;
  /** Overall curriculum status: 'ahead' | 'on-track' | 'behind' | null */
  overallStatus: OverallStatus;
  /** Progress for all skills */
  skillProgress: SkillProgress[];
  /** Core curriculum completion stats */
  coreProgress: { complete: number; total: number };
  /** Extension curriculum completion stats */
  extensionProgress: { complete: number; total: number };
  /** Recommended skills to focus on */
  recommendedFocus: RecommendedSkill[];
  /** Force a refresh of the data (bypasses cache) */
  refresh: () => void;
  /** User's country/yearGrade info (if set) */
  curriculumInfo: {
    country?: string;
    yearGrade?: string;
    countryLabel?: string;
    yearGradeLabel?: string;
  } | null;
}

// Cache configuration
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: {
    overallStatus: CurriculumStatus;
    skillProgress: SkillProgress[];
    coreProgress: { complete: number; total: number };
    extensionProgress: { complete: number; total: number };
    recommendedFocus: RecommendedSkill[];
    curriculumInfo: {
      country?: string;
      yearGrade?: string;
      countryLabel?: string;
      yearGradeLabel?: string;
    } | null;
  };
  timestamp: number;
}

// Module-level cache (persists across hook instances)
const progressCache = new Map<string, CacheEntry>();

// ============================================================================
// Hook Implementation
// ============================================================================

export function useCurriculumProgress(profileId: string): CurriculumProgressData {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [overallStatus, setOverallStatus] = useState<OverallStatus>(null);
  const [skillProgress, setSkillProgress] = useState<SkillProgress[]>([]);
  const [coreProgress, setCoreProgress] = useState({ complete: 0, total: 0 });
  const [extensionProgress, setExtensionProgress] = useState({ complete: 0, total: 0 });
  const [recommendedFocus, setRecommendedFocus] = useState<RecommendedSkill[]>([]);
  const [curriculumInfo, setCurriculumInfo] = useState<CurriculumProgressData['curriculumInfo']>(null);
  
  // Track if a force refresh was requested
  const forceRefreshRef = useRef(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Watch for game session completion
  const gameStatus = useGameStore((state) => state.status);
  const prevGameStatusRef = useRef(gameStatus);

  // Watch profile for country/yearGrade changes
  const profile = useLiveQuery(
    () => profileId ? db.profiles.get(profileId) : undefined,
    [profileId]
  );

  /**
   * Force refresh the progress data (bypasses cache)
   */
  const refresh = useCallback(() => {
    forceRefreshRef.current = true;
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  /**
   * Check if cached data is still valid
   */
  const isCacheValid = useCallback((profileId: string): boolean => {
    const cached = progressCache.get(profileId);
    if (!cached) return false;
    
    const age = Date.now() - cached.timestamp;
    return age < CACHE_TTL_MS;
  }, []);

  /**
   * Load progress data from cache or calculate fresh
   */
  const loadProgress = useCallback(async () => {
    if (!profileId) {
      setLoading(false);
      setError(new Error('No profile ID provided'));
      return;
    }

    try {
      setError(null);

      // Check cache (unless force refresh requested)
      if (!forceRefreshRef.current && isCacheValid(profileId)) {
        const cached = progressCache.get(profileId)!;
        setOverallStatus(cached.data.overallStatus);
        setSkillProgress(cached.data.skillProgress);
        setCoreProgress(cached.data.coreProgress);
        setExtensionProgress(cached.data.extensionProgress);
        setRecommendedFocus(cached.data.recommendedFocus);
        setCurriculumInfo(cached.data.curriculumInfo);
        setLoading(false);
        return;
      }

      setLoading(true);
      forceRefreshRef.current = false;

      // Get curriculum progress from tracker
      const progress = await CurriculumTracker.getCurriculumProgress(profileId);
      
      // Get recommended focus
      const recommended = await CurriculumTracker.getRecommendedFocus(profileId, 3);

      // Calculate completion stats
      // "Complete" = proficient or mastered
      const coreComplete = progress.coreSkillProgress.filter(
        (p) => p.proficiency === 'proficient' || p.proficiency === 'mastered'
      ).length;
      const coreTotal = progress.coreSkillProgress.length;

      const extComplete = progress.extensionSkillProgress.filter(
        (p) => p.proficiency === 'proficient' || p.proficiency === 'mastered'
      ).length;
      const extTotal = progress.extensionSkillProgress.length;

      // Combine all skill progress
      const allSkillProgress = [
        ...progress.coreSkillProgress,
        ...progress.extensionSkillProgress,
      ];

      // Build curriculum info
      const info = progress.country
        ? {
            country: progress.country,
            yearGrade: progress.yearGrade,
            countryLabel: progress.countryLabel,
            yearGradeLabel: progress.yearGradeLabel,
          }
        : null;

      // Update state
      setOverallStatus(progress.overallStatus);
      setSkillProgress(allSkillProgress);
      setCoreProgress({ complete: coreComplete, total: coreTotal });
      setExtensionProgress({ complete: extComplete, total: extTotal });
      setRecommendedFocus(recommended);
      setCurriculumInfo(info);

      // Update cache
      progressCache.set(profileId, {
        data: {
          overallStatus: progress.overallStatus,
          skillProgress: allSkillProgress,
          coreProgress: { complete: coreComplete, total: coreTotal },
          extensionProgress: { complete: extComplete, total: extTotal },
          recommendedFocus: recommended,
          curriculumInfo: info,
        },
        timestamp: Date.now(),
      });

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load curriculum progress'));
      setLoading(false);
    }
  }, [profileId, isCacheValid]);

  // Auto-refresh when game session completes
  useEffect(() => {
    if (prevGameStatusRef.current === 'playing' && gameStatus === 'finished') {
      // Game just finished - invalidate cache and refresh
      progressCache.delete(profileId);
      refresh();
    }
    prevGameStatusRef.current = gameStatus;
  }, [gameStatus, profileId, refresh]);

  // Refresh when profile curriculum settings change
  useEffect(() => {
    if (profile) {
      // Check if country or yearGrade changed from cached version
      const cached = progressCache.get(profileId);
      if (cached) {
        const cachedCountry = cached.data.curriculumInfo?.country;
        const cachedYear = cached.data.curriculumInfo?.yearGrade;
        
        if (profile.country !== cachedCountry || profile.yearGrade !== cachedYear) {
          // Settings changed - invalidate cache
          progressCache.delete(profileId);
          refresh();
        }
      }
    }
  }, [profile?.country, profile?.yearGrade, profileId, refresh, profile]);

  // Load progress on mount and when dependencies change
  useEffect(() => {
    loadProgress();
  }, [loadProgress, refreshTrigger]);

  return {
    loading,
    error,
    overallStatus,
    skillProgress,
    coreProgress,
    extensionProgress,
    recommendedFocus,
    refresh,
    curriculumInfo,
  };
}

// ============================================================================
// Utility: Clear cache (for testing or manual invalidation)
// ============================================================================

export function clearCurriculumProgressCache(profileId?: string): void {
  if (profileId) {
    progressCache.delete(profileId);
  } else {
    progressCache.clear();
  }
}

// Export cache for testing purposes
export const _testExports = {
  progressCache,
  CACHE_TTL_MS,
};
