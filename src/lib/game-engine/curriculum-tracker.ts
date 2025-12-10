/**
 * Math Dash - Curriculum Tracker
 * 
 * Core service for tracking curriculum-aligned progress.
 * Calculates skill proficiency based on mastery records and provides
 * recommendations for focused practice.
 * 
 * @see src/lib/constants/curriculum-data.ts for skill definitions
 * @see src/lib/constants/country-config.ts for country/year mappings
 * @see src/lib/constants/skill-game-mapping.ts for skill-to-game mappings
 */

import { db, MasteryRecord, Profile } from '../db';
import {
  type SkillId,
  type CountryCode,
  SKILLS,
  getSkillById,
  isCoreSkill,
  isExtensionSkill,
  getBenchmark,
} from '../constants/curriculum-data';
import {
  SKILL_GAME_MAP,
  getExpectedFactCount,
  filterRecordsForSkill,
} from '../constants/skill-game-mapping';
import {
  deriveYearFromAge,
  getCountryLabel,
  getYearLabel,
  type AgeBand,
} from '../constants/country-config';

// ============================================================================
// Type Definitions
// ============================================================================

export type ProficiencyLevel = 'not-started' | 'developing' | 'proficient' | 'mastered';

export interface SkillProgress {
  /** The skill ID (e.g., 'TT_CORE') */
  skillId: SkillId;
  /** Human-readable skill label */
  label: string;
  /** Current proficiency level */
  proficiency: ProficiencyLevel;
  /** Accuracy percentage (0-100) */
  accuracy: number;
  /** Coverage percentage - how many facts practiced vs expected (0-100) */
  coverage: number;
  /** Total attempts across all facts for this skill */
  totalAttempts: number;
  /** Total correct answers */
  totalCorrect: number;
  /** Average response time in milliseconds */
  avgResponseTime: number;
  /** Number of facts at 'mastered' status */
  masteredFactCount: number;
  /** Expected number of facts for this skill */
  expectedFactCount: number;
  /** Whether this is a core skill for the user's year level */
  isCore: boolean;
  /** Whether this is an extension skill for the user's year level */
  isExtension: boolean;
  /** Last practiced timestamp (ISO string) */
  lastPracticedAt?: string;
}

export type CurriculumStatus = 'behind' | 'on-track' | 'ahead';

export interface CurriculumProgress {
  /** Overall status of curriculum progress */
  overallStatus: CurriculumStatus;
  /** Overall percentage complete (weighted by core/extension) */
  overallPercentage: number;
  /** Progress on core skills for the user's year level */
  coreSkillProgress: SkillProgress[];
  /** Progress on extension skills */
  extensionSkillProgress: SkillProgress[];
  /** Count of core skills at each proficiency level */
  coreSkillCounts: Record<ProficiencyLevel, number>;
  /** Count of extension skills at each proficiency level */
  extensionSkillCounts: Record<ProficiencyLevel, number>;
  /** User's country code */
  country?: CountryCode;
  /** User's year/grade level */
  yearGrade?: string;
  /** Human-readable country label (e.g., 'New Zealand') */
  countryLabel?: string;
  /** Human-readable year/grade label (e.g., 'Year 3') */
  yearGradeLabel?: string;
  /** When this progress was calculated */
  calculatedAt: string;
}

export interface RecommendedSkill {
  /** The skill to focus on */
  skillId: SkillId;
  /** Skill label */
  label: string;
  /** Why this skill was recommended */
  reason: 'needs-practice' | 'in-progress' | 'next-skill' | 'review';
  /** Priority (1 = highest) */
  priority: number;
  /** Current proficiency */
  proficiency: ProficiencyLevel;
  /** Coverage percentage */
  coverage: number;
  /** Accuracy percentage */
  accuracy: number;
  /** Actionable config to start practice */
  action: {
    topicType?: import('../stores/useGameStore').TopicType;
    config: Partial<import('../stores/useGameStore').GameConfig>;
  };
}

// ============================================================================
// Proficiency Thresholds
// ============================================================================

const PROFICIENCY_THRESHOLDS = {
  /** Minimum coverage (percent) before we consider a skill started */
  MIN_STARTED_COVERAGE: 30,
  /** Developing thresholds */
  DEVELOPING_ACCURACY: 70,
  DEVELOPING_COVERAGE: 60,
  /** Mastery thresholds */
  MASTERED_ACCURACY: 85,
  MASTERED_COVERAGE: 80,
  MASTERED_MAX_RESPONSE_TIME: 3000,
};

// ============================================================================
// CurriculumTracker Class
// ============================================================================

export class CurriculumTracker {
  /**
   * Calculate progress for a single skill
   */
  static async getSkillProgress(
    profileId: string,
    skillId: SkillId,
    country?: CountryCode,
    yearGrade?: string
  ): Promise<SkillProgress> {
    const skill = getSkillById(skillId);
    const config = SKILL_GAME_MAP[skillId];
    
    if (!skill || !config) {
      throw new Error(`Unknown skill: ${skillId}`);
    }

    // Get all mastery records for this profile
    const masteryRecords = await db.mastery
      .where('profileId')
      .equals(profileId)
      .toArray();

    // Filter to facts that match this skill (with precedence)
    const matchingRecords = filterRecordsForSkill(masteryRecords, skillId);

    // Calculate aggregates
    const totalAttempts = matchingRecords.reduce((sum, r) => sum + r.attempts, 0);
    const totalCorrect = matchingRecords.reduce((sum, r) => sum + r.correct, 0);
    const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
    
    // Calculate weighted average response time
    const totalWeightedTime = matchingRecords.reduce(
      (sum, r) => sum + r.avgResponseTime * r.attempts,
      0
    );
    const avgResponseTime = totalAttempts > 0 ? totalWeightedTime / totalAttempts : 0;

    // Count mastered facts
    const masteredFactCount = matchingRecords.filter(
      (r) => r.status === 'mastered'
    ).length;

    // Calculate coverage
    const expectedFactCount = getExpectedFactCount(skillId);
    const coverage = expectedFactCount > 0
      ? (matchingRecords.length / expectedFactCount) * 100
      : 0;

    // Determine proficiency level
    const proficiency = this.calculateProficiencyLevel(
      accuracy,
      coverage,
      avgResponseTime,
      totalAttempts,
      masteredFactCount,
      expectedFactCount
    );

    // Check if core/extension for user's curriculum
    const isCore = country && yearGrade
      ? isCoreSkill(country, yearGrade, skillId)
      : false;
    const isExtension = country && yearGrade
      ? isExtensionSkill(country, yearGrade, skillId)
      : false;

    // Find last practiced
    const lastPracticedAt = matchingRecords.length > 0
      ? matchingRecords.reduce((latest, r) => {
          if (!r.lastAttemptAt) return latest;
          return !latest || r.lastAttemptAt > latest ? r.lastAttemptAt : latest;
        }, null as string | null) ?? undefined
      : undefined;

    return {
      skillId,
      label: skill.label,
      proficiency,
      accuracy: Math.round(accuracy),
      coverage: Math.min(100, Math.round(coverage)),
      totalAttempts,
      totalCorrect,
      avgResponseTime: Math.round(avgResponseTime),
      masteredFactCount,
      expectedFactCount,
      isCore,
      isExtension,
      lastPracticedAt,
    };
  }

  /**
   * Calculate overall curriculum progress for a profile
   */
  static async getCurriculumProgress(profileId: string): Promise<CurriculumProgress> {
    // Get profile to determine country/yearGrade
    const profile = await db.profiles.get(profileId);
    
    const country = profile?.country;
    // Prefer an explicitly stored year/grade; fall back to age-band-derived suggestion
    const derivedYearGrade = profile?.ageBand && country
      ? deriveYearFromAge(country, profile.ageBand as AgeBand)
      : undefined;
    const yearGrade = profile?.yearGrade ?? derivedYearGrade;

    // Calculate progress for all skills
    const allProgress: SkillProgress[] = await Promise.all(
      SKILLS.map((skill) =>
        this.getSkillProgress(profileId, skill.id, country, yearGrade)
      )
    );

    // Separate core and extension skills
    const coreSkillProgress = allProgress.filter((p) => p.isCore);
    const extensionSkillProgress = allProgress.filter((p) => p.isExtension);

    // If no country/year set, use all skills as core
    const effectiveCoreProgress = coreSkillProgress.length > 0
      ? coreSkillProgress
      : allProgress;
    const effectiveExtensionProgress = coreSkillProgress.length > 0
      ? extensionSkillProgress
      : [];

    // Count skills at each level
    const coreSkillCounts = this.countByProficiency(effectiveCoreProgress);
    const extensionSkillCounts = this.countByProficiency(effectiveExtensionProgress);

    // Calculate overall percentage (weighted: core = 70%, extension = 30%)
    const corePercentage = this.calculateOverallPercentage(effectiveCoreProgress);
    const extensionPercentage = this.calculateOverallPercentage(effectiveExtensionProgress);
    
    const overallPercentage = effectiveExtensionProgress.length > 0
      ? Math.round(corePercentage * 0.7 + extensionPercentage * 0.3)
      : Math.round(corePercentage);

    // Determine overall status
    const overallStatus = this.determineOverallStatus(
      coreSkillCounts.mastered,
      effectiveCoreProgress.length,
      extensionSkillCounts.mastered
    );

    return {
      overallStatus,
      overallPercentage,
      coreSkillProgress: effectiveCoreProgress,
      extensionSkillProgress: effectiveExtensionProgress,
      coreSkillCounts,
      extensionSkillCounts,
      country,
      yearGrade,
      countryLabel: country ? getCountryLabel(country) : undefined,
      yearGradeLabel: country && yearGrade ? getYearLabel(country, yearGrade) : undefined,
      calculatedAt: new Date().toISOString(),
    };
  }

  /**
   * Get recommended skills for focused practice
   */
  static async getRecommendedFocus(
    profileId: string,
    maxRecommendations: number = 3
  ): Promise<RecommendedSkill[]> {
    const progress = await this.getCurriculumProgress(profileId);
    const recommendations: RecommendedSkill[] = [];

    const buildAction = (skillId: SkillId): RecommendedSkill['action'] => {
      const cfg = SKILL_GAME_MAP[skillId];
      const defaultRange = {
        preset: 'starter',
        min: 0,
        max: 20,
        rangeType: 'answer' as const,
        allowNegatives: false,
      };
      return {
        topicType: cfg?.topics?.[0],
        config: {
          operations: cfg?.operations,
          selectedNumbers: cfg?.selectedNumbers,
          numberRange: cfg?.numberRange ?? defaultRange,
          selectedTopics: cfg?.topics ?? [],
        },
      };
    };

    const pushRec = (skill: SkillProgress, reason: RecommendedSkill['reason'], priority: number) => {
      if (recommendations.find((r) => r.skillId === skill.skillId)) return;
      recommendations.push({
        skillId: skill.skillId,
        label: skill.label,
        reason,
        priority,
        proficiency: skill.proficiency,
        coverage: skill.coverage,
        accuracy: skill.accuracy,
        action: buildAction(skill.skillId),
      });
    };

    // Priority 1: Core skills that are 'developing' (almost there) - sort by higher coverage but low accuracy
    const developingCore = progress.coreSkillProgress
      .filter((p) => p.proficiency === 'developing')
      .sort((a, b) => b.coverage - a.coverage || a.accuracy - b.accuracy);

    developingCore.slice(0, maxRecommendations).forEach((skill) =>
      pushRec(skill, 'in-progress', 1)
    );

    // Priority 2: Started but below proficient accuracy (needs-practice)
    if (recommendations.length < maxRecommendations) {
      const needsPractice = progress.coreSkillProgress
        .filter(
          (p) =>
            p.proficiency !== 'mastered' &&
            p.proficiency !== 'not-started' &&
            p.accuracy < PROFICIENCY_THRESHOLDS.PROFICIENT_ACCURACY
        )
        .sort((a, b) => a.accuracy - b.accuracy);

      needsPractice.slice(0, maxRecommendations - recommendations.length).forEach((skill) =>
        pushRec(skill, 'needs-practice', 2)
      );
    }

    // Priority 3: Not-started core skills
    if (recommendations.length < maxRecommendations) {
      const notStarted = progress.coreSkillProgress.filter((p) => p.proficiency === 'not-started');
      notStarted.slice(0, maxRecommendations - recommendations.length).forEach((skill) =>
        pushRec(skill, 'next-skill', 3)
      );
    }

    // Priority 4: Review mastered (oldest practice first)
    if (recommendations.length < maxRecommendations) {
      const mastered = progress.coreSkillProgress
        .filter((p) => p.proficiency === 'mastered')
        .sort((a, b) => {
          const aTime = a.lastPracticedAt ? new Date(a.lastPracticedAt).getTime() : 0;
          const bTime = b.lastPracticedAt ? new Date(b.lastPracticedAt).getTime() : 0;
          return aTime - bTime;
        });

      mastered.slice(0, maxRecommendations - recommendations.length).forEach((skill) =>
        pushRec(skill, 'review', 4)
      );
    }

    return recommendations.slice(0, maxRecommendations);
  }

  /**
   * Get a specific benchmark for the user's country and year
   */
  static getBenchmarkSkills(
    country: CountryCode,
    yearGrade: string
  ): { coreSkills: SkillId[]; extensionSkills: SkillId[] } | undefined {
    const benchmark = getBenchmark(country, yearGrade);
    return benchmark
      ? { coreSkills: benchmark.coreSkills, extensionSkills: benchmark.extensionSkills }
      : undefined;
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private static calculateProficiencyLevel(
    accuracy: number,
    coverage: number,
    avgResponseTime: number,
    totalAttempts: number,
    masteredFactCount: number,
    expectedFactCount: number
  ): ProficiencyLevel {
    // Not started if no attempts or coverage remains too low
    if (totalAttempts === 0 || coverage < PROFICIENCY_THRESHOLDS.MIN_STARTED_COVERAGE) {
      return 'not-started';
    }

    // Developing if accuracy or coverage below thresholds
    if (
      accuracy < PROFICIENCY_THRESHOLDS.DEVELOPING_ACCURACY ||
      coverage < PROFICIENCY_THRESHOLDS.DEVELOPING_COVERAGE
    ) {
      return 'developing';
    }

    // Mastered requires high accuracy, high coverage, and fast responses
    if (
      accuracy >= PROFICIENCY_THRESHOLDS.MASTERED_ACCURACY &&
      coverage >= PROFICIENCY_THRESHOLDS.MASTERED_COVERAGE &&
      avgResponseTime <= PROFICIENCY_THRESHOLDS.MASTERED_MAX_RESPONSE_TIME
    ) {
      return 'mastered';
    }

    return 'proficient';
  }

  private static countByProficiency(
    progress: SkillProgress[]
  ): Record<ProficiencyLevel, number> {
    const counts: Record<ProficiencyLevel, number> = {
      'not-started': 0,
      'developing': 0,
      'proficient': 0,
      'mastered': 0,
    };

    for (const p of progress) {
      counts[p.proficiency]++;
    }

    return counts;
  }

  private static calculateOverallPercentage(progress: SkillProgress[]): number {
    if (progress.length === 0) return 0;

    // Weight: not-started=0, developing=25, proficient=70, mastered=100
    const weights: Record<ProficiencyLevel, number> = {
      'not-started': 0,
      'developing': 25,
      'proficient': 70,
      'mastered': 100,
    };

    const totalWeight = progress.reduce(
      (sum, p) => sum + weights[p.proficiency],
      0
    );

    return Math.round(totalWeight / progress.length);
  }

  private static determineOverallStatus(
    coreMastered: number,
    totalCoreSkills: number,
    extensionMastered: number
  ): CurriculumStatus {
    if (totalCoreSkills === 0) {
      return 'behind';
    }

    const corePercent = totalCoreSkills > 0 ? coreMastered / totalCoreSkills : 0;

    if (corePercent < 0.5) {
      return 'behind';
    }

    if (corePercent >= 0.8 && extensionMastered > 0) {
      return 'ahead';
    }

    return 'on-track';
  }
}
