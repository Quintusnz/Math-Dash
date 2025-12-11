import { describe, it, expect, beforeEach, vi } from "vitest";
import { buildCoachCurriculumSnapshot } from "@/lib/coach/curriculum-adapter";
import type { SkillProgress, RecommendedSkill } from "@/lib/game-engine/curriculum-tracker";

const trackerMocks = vi.hoisted(() => ({
  getCurriculumProgress: vi.fn(),
  getRecommendedFocus: vi.fn(),
}));

vi.mock("@/lib/game-engine/curriculum-tracker", () => ({
  CurriculumTracker: {
    getCurriculumProgress: trackerMocks.getCurriculumProgress,
    getRecommendedFocus: trackerMocks.getRecommendedFocus,
  },
}));

const buildSkill = (
  overrides: Partial<SkillProgress> = {}
): SkillProgress => ({
  skillId: "SKILL",
  label: "Skill",
  proficiency: "developing",
  accuracy: 65,
  coverage: 40,
  totalAttempts: 10,
  totalCorrect: 6,
  avgResponseTime: 1800,
  masteredFactCount: 1,
  expectedFactCount: 6,
  isCore: true,
  isExtension: false,
  lastPracticedAt: "2025-12-01T00:00:00Z",
  ...overrides,
});

const buildRecommendation = (overrides: Partial<RecommendedSkill> = {}): RecommendedSkill => ({
  skillId: "REC",
  label: "Focus Skill",
  reason: "needs-practice",
  priority: 1,
  proficiency: "developing",
  accuracy: 55,
  coverage: 35,
  action: {
    config: {
      operations: ["multiplication"],
      selectedNumbers: [3, 4],
    },
  },
  ...overrides,
});

describe("buildCoachCurriculumSnapshot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("summarises tracker output for Coach consumption", async () => {
    trackerMocks.getCurriculumProgress.mockResolvedValue({
      overallStatus: "on-track",
      overallPercentage: 72,
      coreSkillProgress: [
        buildSkill({
          skillId: "CORE_MASTERED",
          proficiency: "mastered",
          isCore: true,
          isExtension: false,
        }),
        buildSkill({
          skillId: "CORE_DEV",
          proficiency: "developing",
          accuracy: 50,
          coverage: 30,
        }),
        buildSkill({
          skillId: "CORE_NEW",
          proficiency: "not-started",
          accuracy: 0,
          coverage: 0,
        }),
      ],
      extensionSkillProgress: [
        buildSkill({
          skillId: "EXT_PRO",
          proficiency: "proficient",
          isCore: false,
          isExtension: true,
        }),
        buildSkill({
          skillId: "EXT_NEW",
          proficiency: "not-started",
          isCore: false,
          isExtension: true,
        }),
      ],
      coreSkillCounts: {
        "not-started": 1,
        developing: 1,
        proficient: 0,
        mastered: 1,
      },
      extensionSkillCounts: {
        "not-started": 1,
        developing: 0,
        proficient: 1,
        mastered: 0,
      },
      country: "NZ",
      countryLabel: "New Zealand",
      yearGrade: "Y3",
      yearGradeLabel: "Year 3",
      calculatedAt: "2025-12-10T08:00:00Z",
    });

    const recommendations = [
      buildRecommendation({
        skillId: "CORE_DEV",
        reason: "needs-practice",
      }),
    ];
    trackerMocks.getRecommendedFocus.mockResolvedValue(recommendations);

    const snapshot = await buildCoachCurriculumSnapshot("p1");

    expect(snapshot.profileId).toBe("p1");
    expect(snapshot.status).toBe("on-track");
    expect(snapshot.overallPercentage).toBe(72);
    expect(snapshot.curriculum?.countryLabel).toBe("New Zealand");
    expect(snapshot.core.proficientCount).toBe(1);
    expect(snapshot.core.total).toBe(3);
    expect(snapshot.core.needsFocus.map((skill) => skill.skillId)).toEqual([
      "CORE_NEW",
      "CORE_DEV",
    ]);
    expect(snapshot.extension.startedCount).toBe(1);
    expect(snapshot.recommendedFocus).toEqual(recommendations);
    expect(snapshot.generatedAt).toBe("2025-12-10T08:00:00Z");
  });

  it("limits needs-focus entries based on provided cap", async () => {
    trackerMocks.getCurriculumProgress.mockResolvedValue({
      overallStatus: "behind",
      overallPercentage: 30,
      coreSkillProgress: [
        buildSkill({ skillId: "NEEDS_1", proficiency: "not-started" }),
        buildSkill({ skillId: "NEEDS_2", proficiency: "developing", coverage: 15 }),
        buildSkill({ skillId: "NEEDS_3", proficiency: "developing", coverage: 60 }),
      ],
      extensionSkillProgress: [],
      coreSkillCounts: {
        "not-started": 1,
        developing: 2,
        proficient: 0,
        mastered: 0,
      },
      extensionSkillCounts: {
        "not-started": 0,
        developing: 0,
        proficient: 0,
        mastered: 0,
      },
      country: undefined,
      countryLabel: undefined,
      yearGrade: undefined,
      yearGradeLabel: undefined,
      calculatedAt: "2025-12-11T02:00:00Z",
    });
    trackerMocks.getRecommendedFocus.mockResolvedValue([]);

    const snapshot = await buildCoachCurriculumSnapshot("p2", 2);

    expect(snapshot.core.needsFocus).toHaveLength(2);
    expect(snapshot.core.needsFocus.map((skill) => skill.skillId)).toEqual([
      "NEEDS_1",
      "NEEDS_2",
    ]);
  });
});
