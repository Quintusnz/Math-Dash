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
  doesFactMatchSkill,
  getExpectedFactCount,
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
}

// ============================================================================
// Proficiency Thresholds
// ============================================================================

const PROFICIENCY_THRESHOLDS = {
  /** Minimum accuracy to be considered 'developing' */
  DEVELOPING_ACCURACY: 50,
  /** Minimum accuracy to be considered 'proficient' */
  PROFICIENT_ACCURACY: 70,
  /** Minimum accuracy to be considered 'mastered' */
  MASTERED_ACCURACY: 85,
  /** Minimum coverage to be considered 'proficient' */
  PROFICIENT_COVERAGE: 50,
  /** Minimum coverage to be considered 'mastered' */
  MASTERED_COVERAGE: 80,
  /** Maximum average response time (ms) for 'mastered' */
  MASTERED_MAX_RESPONSE_TIME: 3000,
  /** Minimum attempts to be considered 'proficient' */
  MIN_ATTEMPTS_PROFICIENT: 10,
  /** Minimum attempts to be considered 'mastered' */
  MIN_ATTEMPTS_MASTERED: 20,
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

    // Filter to facts that match this skill
    const matchingRecords = masteryRecords.filter((record) =>
      doesFactMatchSkill(record.fact, skillId)
    );

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
    const yearGrade = profile?.yearGrade ?? (
      profile?.ageBand && country
        ? deriveYearFromAge(country, profile.ageBand as AgeBand)
        : undefined
    );

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
      coreSkillCounts,
      effectiveCoreProgress.length,
      effectiveExtensionProgress
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

    // Priority 1: Core skills that are 'developing' (in progress, need more work)
    const developingCore = progress.coreSkillProgress
      .filter((p) => p.proficiency === 'developing')
      .sort((a, b) => a.coverage - b.coverage); // Lower coverage first

    for (const skill of developingCore.slice(0, maxRecommendations)) {
      recommendations.push({
        skillId: skill.skillId,
        label: skill.label,
        reason: 'in-progress',
        priority: 1,
        proficiency: skill.proficiency,
        coverage: skill.coverage,
      });
    }

    // Priority 2: Core skills that need practice (started but low accuracy)
    if (recommendations.length < maxRecommendations) {
      const needsPractice = progress.coreSkillProgress
        .filter(
          (p) =>
            p.proficiency !== 'mastered' &&
            p.proficiency !== 'not-started' &&
            p.accuracy < PROFICIENCY_THRESHOLDS.PROFICIENT_ACCURACY
        )
        .sort((a, b) => a.accuracy - b.accuracy);

      for (const skill of needsPractice.slice(0, maxRecommendations - recommendations.length)) {
        if (!recommendations.some((r) => r.skillId === skill.skillId)) {
          recommendations.push({
            skillId: skill.skillId,
            label: skill.label,
            reason: 'needs-practice',
            priority: 2,
            proficiency: skill.proficiency,
            coverage: skill.coverage,
          });
        }
      }
    }

    // Priority 3: Next core skill to start
    if (recommendations.length < maxRecommendations) {
      const notStarted = progress.coreSkillProgress
        .filter((p) => p.proficiency === 'not-started');

      for (const skill of notStarted.slice(0, maxRecommendations - recommendations.length)) {
        recommendations.push({
          skillId: skill.skillId,
          label: skill.label,
          reason: 'next-skill',
          priority: 3,
          proficiency: skill.proficiency,
          coverage: skill.coverage,
        });
      }
    }

    // Priority 4: Review mastered skills (if nothing else)
    if (recommendations.length < maxRecommendations) {
      const mastered = progress.coreSkillProgress
        .filter((p) => p.proficiency === 'mastered')
        .sort((a, b) => {
          // Prefer skills that haven't been practiced recently
          const aTime = a.lastPracticedAt ? new Date(a.lastPracticedAt).getTime() : 0;
          const bTime = b.lastPracticedAt ? new Date(b.lastPracticedAt).getTime() : 0;
          return aTime - bTime;
        });

      for (const skill of mastered.slice(0, maxRecommendations - recommendations.length)) {
        recommendations.push({
          skillId: skill.skillId,
          label: skill.label,
          reason: 'review',
          priority: 4,
          proficiency: skill.proficiency,
          coverage: skill.coverage,
        });
      }
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
    // Not started if no attempts
    if (totalAttempts === 0) {
      return 'not-started';
    }

    // Mastered requires high accuracy, coverage, speed, and sufficient attempts
    const masteryRatio = expectedFactCount > 0
      ? masteredFactCount / expectedFactCount
      : 0;

    if (
      accuracy >= PROFICIENCY_THRESHOLDS.MASTERED_ACCURACY &&
      coverage >= PROFICIENCY_THRESHOLDS.MASTERED_COVERAGE &&
      avgResponseTime <= PROFICIENCY_THRESHOLDS.MASTERED_MAX_RESPONSE_TIME &&
      totalAttempts >= PROFICIENCY_THRESHOLDS.MIN_ATTEMPTS_MASTERED &&
      masteryRatio >= 0.7
    ) {
      return 'mastered';
    }

    // Proficient requires good accuracy and coverage
    if (
      accuracy >= PROFICIENCY_THRESHOLDS.PROFICIENT_ACCURACY &&
      coverage >= PROFICIENCY_THRESHOLDS.PROFICIENT_COVERAGE &&
      totalAttempts >= PROFICIENCY_THRESHOLDS.MIN_ATTEMPTS_PROFICIENT
    ) {
      return 'proficient';
    }

    // Developing if any attempts made
    if (
      accuracy >= PROFICIENCY_THRESHOLDS.DEVELOPING_ACCURACY ||
      totalAttempts >= 3
    ) {
      return 'developing';
    }

    // Default to developing if some attempts
    return 'developing';
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
    counts: Record<ProficiencyLevel, number>,
    totalSkills: number,
    extensionProgress?: SkillProgress[]
  ): CurriculumStatus {
    if (totalSkills === 0) return 'behind';

    const behindCount = counts['not-started'] + counts.developing;
    const proficientOrBetter = counts.proficient + counts.mastered;
    
    // Ahead: >80% of core skills are mastered AND extension skills started
    if (counts.mastered >= totalSkills * 0.8) {
      const extensionStarted = extensionProgress?.some(
        (p) => p.proficiency !== 'not-started'
      );
      if (extensionStarted || !extensionProgress?.length) {
        return 'ahead';
      }
    }

    // On-track: >50% of core skills are proficient or mastered
    if (proficientOrBetter > totalSkills * 0.5) {
      return 'on-track';
    }

    // Behind: >50% of core skills are not-started or developing (default)
    return 'behind';
  }
}
