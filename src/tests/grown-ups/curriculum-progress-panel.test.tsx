import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CurriculumProgressPanel } from "@/components/features/grown-ups/CurriculumProgressPanel";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

const analyticsMocks = vi.hoisted(() => ({
  trackViewed: vi.fn(),
  trackDetailed: vi.fn(),
}));

vi.mock("@/lib/analytics/curriculum-analytics", () => ({
  trackCurriculumProgressViewed: analyticsMocks.trackViewed,
  trackCurriculumSkillDetailed: analyticsMocks.trackDetailed,
}));

const useCurriculumProgressMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/hooks/useCurriculumProgress", () => {
  return {
    useCurriculumProgress: useCurriculumProgressMock,
  };
});

const baseData = {
  loading: false,
  error: null,
  overallStatus: "on-track" as const,
  skillProgress: [
    {
      skillId: "NB10",
      label: "Number bonds to 10",
      proficiency: "proficient",
      accuracy: 85,
      coverage: 100,
      totalAttempts: 20,
      totalCorrect: 17,
      avgResponseTime: 1200,
      masteredFactCount: 8,
      expectedFactCount: 8,
      isCore: true,
      isExtension: false,
      lastPracticedAt: new Date().toISOString(),
    },
    {
      skillId: "TT_CORE",
      label: "Core times tables",
      proficiency: "developing",
      accuracy: 55,
      coverage: 40,
      totalAttempts: 15,
      totalCorrect: 8,
      avgResponseTime: 1800,
      masteredFactCount: 1,
      expectedFactCount: 6,
      isCore: true,
      isExtension: false,
      lastPracticedAt: new Date().toISOString(),
    },
    {
      skillId: "SQ_1_10",
      label: "Squares 1-10",
      proficiency: "not-started",
      accuracy: 0,
      coverage: 0,
      totalAttempts: 0,
      totalCorrect: 0,
      avgResponseTime: 0,
      masteredFactCount: 0,
      expectedFactCount: 10,
      isCore: false,
      isExtension: true,
      lastPracticedAt: undefined,
    },
  ],
  coreProgress: { complete: 1, total: 2 },
  extensionProgress: { complete: 0, total: 1 },
  recommendedFocus: [],
  refresh: vi.fn(),
  curriculumInfo: {
    country: "NZ",
    yearGrade: "Y3",
    countryLabel: "New Zealand",
    yearGradeLabel: "Year 3",
  },
};

const buildSkill = (
  overrides: Partial<(typeof baseData)["skillProgress"][number]> = {}
) => ({
  ...baseData.skillProgress[0],
  ...overrides,
});

describe("CurriculumProgressPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pushMock.mockReset();
    useCurriculumProgressMock.mockReturnValue(baseData);
  });

  it("renders curriculum info and skill lists", () => {
    render(<CurriculumProgressPanel profileId="p1" />);

    expect(screen.getByText("Curriculum Progress")).toBeInTheDocument();
    expect(screen.getByText("New Zealand / Year 3")).toBeInTheDocument();
    expect(screen.getByText(/Core Skills/)).toBeInTheDocument();

    const [coreToggle, extToggle] = screen.getAllByRole("button", { name: /Show/i });
    fireEvent.click(coreToggle);
    expect(screen.getAllByText("Core times tables").length).toBeGreaterThan(0);
    expect(screen.getByText("Number bonds to 10")).toBeInTheDocument();

    fireEvent.click(extToggle);
    expect(screen.getByText("Squares 1-10")).toBeInTheDocument();
  });

  it("shows the explicitly stored year/grade label even when it differs from the age-based recommendation", () => {
    useCurriculumProgressMock.mockReturnValue({
      ...baseData,
      curriculumInfo: {
        country: "NZ",
        countryLabel: "New Zealand",
        yearGrade: "Y2",
        yearGradeLabel: "Year 2",
      },
    });

    render(<CurriculumProgressPanel profileId="p1" />);

    expect(screen.getByText("New Zealand / Year 2")).toBeInTheDocument();
  });

  it("shows CTA when curriculum is not set", () => {
    const onOpenSettings = vi.fn();
    useCurriculumProgressMock.mockReturnValue({
      ...baseData,
      curriculumInfo: null,
      skillProgress: [],
    });

    render(<CurriculumProgressPanel profileId="p1" onOpenSettings={onOpenSettings} />);

    const cta = screen.getByRole("button", { name: /Set curriculum/i });
    fireEvent.click(cta);
    expect(onOpenSettings).toHaveBeenCalled();
  });

  it("falls back to router navigation when CTA pressed without handler", () => {
    useCurriculumProgressMock.mockReturnValue({
      ...baseData,
      curriculumInfo: null,
      skillProgress: [],
    });

    render(<CurriculumProgressPanel profileId="p1" />);

    const cta = screen.getByRole("button", { name: /Set curriculum/i });
    fireEvent.click(cta);
    expect(pushMock).toHaveBeenCalledWith("/grown-ups?tab=settings");
  });

  it("reports analytics once per status", () => {
    const { rerender } = render(<CurriculumProgressPanel profileId="p1" />);

    expect(analyticsMocks.trackViewed).toHaveBeenCalledWith("p1", "on-track");

    rerender(<CurriculumProgressPanel profileId="p1" />);
    expect(analyticsMocks.trackViewed).toHaveBeenCalledTimes(1);
  });

  it("tracks interaction when skill row activated via keyboard", () => {
    render(<CurriculumProgressPanel profileId="p1" />);

    const [coreToggle] = screen.getAllByRole("button", { name: /Show/i });
    fireEvent.click(coreToggle);

    const skillButton = screen.getByRole("button", { name: /Core times tables/i });
    fireEvent.keyDown(skillButton, { key: "Enter" });
    fireEvent.keyDown(skillButton, { key: " " });

    expect(analyticsMocks.trackDetailed).toHaveBeenCalledTimes(2);
    expect(analyticsMocks.trackDetailed).toHaveBeenCalledWith("p1", "TT_CORE", "developing");
  });

  it("shows accessible status copy", () => {
    render(<CurriculumProgressPanel profileId="p1" />);
    expect(
      screen.getByText("Steady progress: over half of core skills are proficient.")
    ).toBeInTheDocument();
  });

  it("updates collapse toggle aria attributes and show-all button", () => {
    const largeSkillList = Array.from({ length: 6 }).map((_, idx) =>
      buildSkill({ skillId: `CORE_${idx}`, label: `Core Skill ${idx}`, accuracy: 70 + idx })
    );

    useCurriculumProgressMock.mockReturnValue({
      ...baseData,
      skillProgress: [
        ...largeSkillList,
        buildSkill({
          skillId: "EXT_1",
          label: "Extension Skill",
          isCore: false,
          isExtension: true,
        }),
      ],
      coreProgress: { complete: 4, total: 6 },
    });

    render(<CurriculumProgressPanel profileId="p1" />);

    const [coreToggle] = screen.getAllByRole("button", { name: /Show/i });
    expect(coreToggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(coreToggle);
    expect(coreToggle).toHaveAttribute("aria-expanded", "true");

    const showAll = screen.getByRole("button", { name: /Show all/ });
    expect(showAll.textContent).toContain("(6)");
    fireEvent.click(showAll);
    expect(screen.queryByRole("button", { name: /Show all/ })).toBeNull();
  });
});
