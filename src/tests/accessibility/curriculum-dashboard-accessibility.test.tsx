import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { SkillProgress } from "@/lib/game-engine/curriculum-tracker";
import { SkillProgressGrid } from "@/components/features/curriculum/SkillProgressGrid";
import { SkillCard } from "@/components/features/curriculum/SkillCard";
import { CurriculumProgressPanel } from "@/components/features/grown-ups/CurriculumProgressPanel";

const useCurriculumProgressMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/hooks/useCurriculumProgress", () => ({
  useCurriculumProgress: useCurriculumProgressMock,
}));

const buildSkill = (overrides: Partial<SkillProgress> = {}): SkillProgress => ({
  skillId: "SKILL",
  label: "Example Skill",
  proficiency: "developing",
  accuracy: 60,
  coverage: 40,
  totalAttempts: 10,
  totalCorrect: 6,
  avgResponseTime: 1800,
  masteredFactCount: 1,
  expectedFactCount: 5,
  isCore: true,
  isExtension: false,
  lastPracticedAt: "2025-10-01T00:00:00Z",
  ...overrides,
});

describe("Curriculum accessibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCurriculumProgressMock.mockReturnValue({
      loading: false,
      error: null,
      overallStatus: "on-track",
      skillProgress: [
        buildSkill({ skillId: "A", label: "Addition facts" }),
        buildSkill({ skillId: "B", label: "Times tables", proficiency: "not-started" }),
        buildSkill({ skillId: "C", label: "Squares", isCore: false, isExtension: true }),
      ],
      coreProgress: { complete: 1, total: 2 },
      extensionProgress: { complete: 0, total: 1 },
      curriculumInfo: {
        country: "NZ",
        yearGrade: "Y3",
        countryLabel: "New Zealand",
        yearGradeLabel: "Year 3",
      },
    });
  });

  it("exposes filter chips with aria-pressed state", () => {
    const skills = [
      buildSkill({ skillId: "A", label: "Addition to 20", proficiency: "proficient" }),
      buildSkill({ skillId: "B", label: "Halves", proficiency: "developing" }),
    ];

    render(<SkillProgressGrid title="Core" skills={skills} />);

    const needsFocus = screen.getByRole("button", { name: "Needs focus" });
    expect(needsFocus).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(needsFocus);
    expect(needsFocus).toHaveAttribute("aria-pressed", "true");
  });

  it("allows keyboard activation on SkillCard", () => {
    const onSelect = vi.fn();
    render(<SkillCard skill={buildSkill()} onSelect={onSelect} />);

    const card = screen.getByRole("button", { name: /Example Skill/ });
    fireEvent.keyDown(card, { key: " " });
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("links collapse controls with sections via aria-controls", () => {
    render(<CurriculumProgressPanel profileId="p1" />);

    const coreToggle = screen.getAllByRole("button", { name: /^Show$/i })[0];
    const coreSection = screen.getByLabelText("Core skills");

    expect(coreToggle).toHaveAttribute("aria-controls", coreSection.id);
    expect(coreToggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(coreToggle);
    expect(coreToggle).toHaveAttribute("aria-expanded", "true");
  });
});
