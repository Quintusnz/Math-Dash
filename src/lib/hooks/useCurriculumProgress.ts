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
  type ProficiencyLevel,
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
  /** Overall completion percentage across applicable skills */
  overallPercentage: number | null;
  /** Progress for all skills */
  skillProgress: SkillProgress[];
  /** Core skills only */
  coreSkills: SkillProgress[];
  /** Extension skills only */
  extensionSkills: SkillProgress[];
  /** Count of core skills by proficiency */
  coreSkillCounts: Record<ProficiencyLevel, number>;
  /** Count of extension skills by proficiency */
  extensionSkillCounts: Record<ProficiencyLevel, number>;
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
  /** When the tracker last calculated this snapshot */
  lastCalculatedAt: string | null;
}

// Cache configuration
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheMeta {
  profileId: string;
  country?: string;
  yearGrade?: string;
  curriculumLastUpdated?: string;
}

interface CacheEntry {
  data: {
    overallStatus: CurriculumStatus;
    overallPercentage: number;
    skillProgress: SkillProgress[];
    coreSkills: SkillProgress[];
    extensionSkills: SkillProgress[];
    coreSkillCounts: Record<ProficiencyLevel, number>;
    extensionSkillCounts: Record<ProficiencyLevel, number>;
    coreProgress: { complete: number; total: number };
    extensionProgress: { complete: number; total: number };
    recommendedFocus: RecommendedSkill[];
    curriculumInfo: {
      country?: string;
      yearGrade?: string;
      countryLabel?: string;
      yearGradeLabel?: string;
    } | null;
    lastCalculatedAt: string | null;
  };
  timestamp: number;
  meta: CacheMeta;
}

const createEmptyCounts = (): Record<ProficiencyLevel, number> => ({
  'not-started': 0,
  developing: 0,
  proficient: 0,
  mastered: 0,
});

// Module-level cache (persists across hook instances)
const progressCache = new Map<string, CacheEntry>();

const buildCacheKey = (meta: CacheMeta): string => {
  const { profileId, country = '', yearGrade = '', curriculumLastUpdated = '' } = meta;
  return [profileId, country, yearGrade, curriculumLastUpdated].join('|');
};

// ============================================================================
// Hook Implementation
// ============================================================================

export function useCurriculumProgress(profileId: string): CurriculumProgressData {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [overallStatus, setOverallStatus] = useState<OverallStatus>(null);
  const [overallPercentage, setOverallPercentage] = useState<number | null>(null);
  const [skillProgress, setSkillProgress] = useState<SkillProgress[]>([]);
  const [coreSkills, setCoreSkills] = useState<SkillProgress[]>([]);
  const [extensionSkills, setExtensionSkills] = useState<SkillProgress[]>([]);
  const [coreProgress, setCoreProgress] = useState({ complete: 0, total: 0 });
  const [extensionProgress, setExtensionProgress] = useState({ complete: 0, total: 0 });
  const [recommendedFocus, setRecommendedFocus] = useState<RecommendedSkill[]>([]);
  const [curriculumInfo, setCurriculumInfo] = useState<CurriculumProgressData['curriculumInfo']>(null);
  const [coreSkillCounts, setCoreSkillCounts] = useState<Record<ProficiencyLevel, number>>(createEmptyCounts());
  const [extensionSkillCounts, setExtensionSkillCounts] = useState<Record<ProficiencyLevel, number>>(createEmptyCounts());
  const [lastCalculatedAt, setLastCalculatedAt] = useState<string | null>(null);
  
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
  const isCacheValid = useCallback((cacheKey: string): boolean => {
    const cached = progressCache.get(cacheKey);
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
      setOverallStatus(null);
      setOverallPercentage(null);
      setSkillProgress([]);
      setCoreSkills([]);
      setExtensionSkills([]);
      setCoreProgress({ complete: 0, total: 0 });
      setExtensionProgress({ complete: 0, total: 0 });
      setRecommendedFocus([]);
      setCurriculumInfo(null);
      setCoreSkillCounts(createEmptyCounts());
      setExtensionSkillCounts(createEmptyCounts());
      setLastCalculatedAt(null);
      return;
    }

    try {
      setError(null);

      const cacheMeta: CacheMeta = {
        profileId,
        country: profile?.country,
        yearGrade: profile?.yearGrade,
        curriculumLastUpdated: profile?.curriculumLastUpdated ?? profile?.updatedAt,
      };
      const cacheKey = buildCacheKey(cacheMeta);

      // Check cache (unless force refresh requested)
      if (!forceRefreshRef.current && isCacheValid(cacheKey)) {
        const cached = progressCache.get(cacheKey)!;
        setOverallStatus(cached.data.overallStatus);
        setOverallPercentage(cached.data.overallPercentage);
        setSkillProgress(cached.data.skillProgress);
        setCoreSkills(cached.data.coreSkills);
        setExtensionSkills(cached.data.extensionSkills);
        setCoreProgress(cached.data.coreProgress);
        setExtensionProgress(cached.data.extensionProgress);
        setCoreSkillCounts(cached.data.coreSkillCounts);
        setExtensionSkillCounts(cached.data.extensionSkillCounts);
        setRecommendedFocus(cached.data.recommendedFocus);
        setCurriculumInfo(cached.data.curriculumInfo);
        setLastCalculatedAt(cached.data.lastCalculatedAt);
        setLoading(false);
        return;
      }

      setLoading(true);
      forceRefreshRef.current = false;

      // Get curriculum progress from tracker
      const progress = await CurriculumTracker.getCurriculumProgress(profileId);
      
      // Get recommended focus
      const recommended = await CurriculumTracker.getRecommendedFocus(profileId, 3);
      const coreSkillsData = progress.coreSkillProgress;
      const extensionSkillsData = progress.extensionSkillProgress;

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
        ...coreSkillsData,
        ...extensionSkillsData,
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
      setOverallPercentage(progress.overallPercentage);
      setSkillProgress(allSkillProgress);
      setCoreSkills(coreSkillsData);
      setExtensionSkills(extensionSkillsData);
      setCoreProgress({ complete: coreComplete, total: coreTotal });
      setExtensionProgress({ complete: extComplete, total: extTotal });
      setCoreSkillCounts(progress.coreSkillCounts);
      setExtensionSkillCounts(progress.extensionSkillCounts);
      setRecommendedFocus(recommended);
      setCurriculumInfo(info);
      setLastCalculatedAt(progress.calculatedAt);

      // Update cache
      progressCache.set(cacheKey, {
        data: {
          overallStatus: progress.overallStatus,
          overallPercentage: progress.overallPercentage,
          skillProgress: allSkillProgress,
          coreSkills: coreSkillsData,
          extensionSkills: extensionSkillsData,
          coreSkillCounts: progress.coreSkillCounts,
          extensionSkillCounts: progress.extensionSkillCounts,
          coreProgress: { complete: coreComplete, total: coreTotal },
          extensionProgress: { complete: extComplete, total: extTotal },
          recommendedFocus: recommended,
          curriculumInfo: info,
          lastCalculatedAt: progress.calculatedAt,
        },
        timestamp: Date.now(),
        meta: cacheMeta,
      });

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load curriculum progress'));
      setLoading(false);
    }
  }, [profileId, isCacheValid, profile]);

  // Auto-refresh when game session completes
  useEffect(() => {
    if (prevGameStatusRef.current === 'playing' && gameStatus === 'finished') {
      // Game just finished - invalidate cache and refresh
      invalidateCurriculumCache(profileId);
      refresh();
    }
    prevGameStatusRef.current = gameStatus;
  }, [gameStatus, profileId, refresh]);

  // Refresh when profile curriculum settings change
  useEffect(() => {
    if (profile) {
      for (const [key, entry] of progressCache.entries()) {
        if (entry.meta.profileId !== profileId) continue;
        const changed =
          entry.meta.country !== profile.country ||
          entry.meta.yearGrade !== profile.yearGrade ||
          entry.meta.curriculumLastUpdated !== (profile.curriculumLastUpdated ?? profile.updatedAt);
        if (changed) {
          progressCache.delete(key);
          refresh();
          break;
        }
      }
    }
  }, [
    profile?.country,
    profile?.yearGrade,
    profile?.curriculumLastUpdated,
    profile?.updatedAt,
    profileId,
    refresh,
  ]);

  // Load progress on mount and when dependencies change
  useEffect(() => {
    loadProgress();
  }, [loadProgress, refreshTrigger]);

  return {
    loading,
    error,
    overallStatus,
    overallPercentage,
    skillProgress,
    coreSkills,
    extensionSkills,
    coreSkillCounts,
    extensionSkillCounts,
    coreProgress,
    extensionProgress,
    recommendedFocus,
    refresh,
    curriculumInfo,
    lastCalculatedAt,
  };
}

// ============================================================================
// Utility: Clear cache (for testing or manual invalidation)
// ============================================================================

export function clearCurriculumProgressCache(profileId?: string): void {
  if (profileId) {
    invalidateCurriculumCache(profileId);
  } else {
    progressCache.clear();
  }
}

export function invalidateCurriculumCache(profileId: string): void {
  for (const [key, entry] of progressCache.entries()) {
    if (entry.meta.profileId === profileId) {
      progressCache.delete(key);
    }
  }
}

// Export cache for testing purposes
export const _testExports = {
  progressCache,
  CACHE_TTL_MS,
  buildCacheKey,
};
