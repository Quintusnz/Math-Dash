import {
  CurriculumTracker,
  type CurriculumStatus,
  type ProficiencyLevel,
  type SkillProgress,
  type RecommendedSkill,
} from '@/lib/game-engine/curriculum-tracker';

export interface CoachCurriculumSnapshot {
  profileId: string;
  status: CurriculumStatus | null;
  overallPercentage: number | null;
  curriculum?: {
    country?: string;
    countryLabel?: string;
    yearGrade?: string;
    yearGradeLabel?: string;
  };
  core: {
    proficientCount: number;
    total: number;
    masteryCounts: Record<ProficiencyLevel, number>;
    needsFocus: SkillProgress[];
  };
  extension: {
    startedCount: number;
    total: number;
    masteryCounts: Record<ProficiencyLevel, number>;
  };
  recommendedFocus: RecommendedSkill[];
  generatedAt: string;
}

export async function buildCoachCurriculumSnapshot(
  profileId: string,
  focusLimit: number = 5
): Promise<CoachCurriculumSnapshot> {
  const progress = await CurriculumTracker.getCurriculumProgress(profileId);
  const recommended = await CurriculumTracker.getRecommendedFocus(profileId, 3);

  const proficientCount = progress.coreSkillProgress.filter(
    (skill) => skill.proficiency === 'proficient' || skill.proficiency === 'mastered'
  ).length;

  const needsFocus = selectNeedsFocus(progress.coreSkillProgress, focusLimit);

  const extensionStarted = progress.extensionSkillProgress.filter(
    (skill) => skill.proficiency !== 'not-started'
  ).length;

  return {
    profileId,
    status: progress.overallStatus ?? null,
    overallPercentage: progress.overallPercentage ?? null,
    curriculum: {
      country: progress.country,
      countryLabel: progress.countryLabel,
      yearGrade: progress.yearGrade,
      yearGradeLabel: progress.yearGradeLabel,
    },
    core: {
      proficientCount,
      total: progress.coreSkillProgress.length,
      masteryCounts: progress.coreSkillCounts,
      needsFocus,
    },
    extension: {
      startedCount: extensionStarted,
      total: progress.extensionSkillProgress.length,
      masteryCounts: progress.extensionSkillCounts,
    },
    recommendedFocus: recommended,
    generatedAt: progress.calculatedAt,
  };
}

function selectNeedsFocus(skills: SkillProgress[], limit: number): SkillProgress[] {
  const needAttention = skills.filter(
    (skill) => skill.proficiency === 'not-started' || skill.proficiency === 'developing'
  );

  return needAttention
    .sort((a, b) => {
      if (a.proficiency !== b.proficiency) {
        return a.proficiency === 'not-started' ? -1 : 1;
      }
      if (a.coverage === b.coverage) {
        return a.accuracy - b.accuracy;
      }
      return a.coverage - b.coverage;
    })
    .slice(0, limit);
}
