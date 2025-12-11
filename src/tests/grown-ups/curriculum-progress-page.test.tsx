import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CurriculumProgressPage from "@/app/(app)/grown-ups/curriculum/page";

const useLiveQueryMock = vi.hoisted(() => vi.fn());
const useCurriculumProgressMock = vi.hoisted(() => vi.fn());
const setConfigMock = vi.hoisted(() => vi.fn());
const replaceMock = vi.fn();
const pushMock = vi.fn();
const trackRecMock = vi.hoisted(() => vi.fn());
let searchParamsValue: URLSearchParams;

vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: useLiveQueryMock,
}));

vi.mock("@/lib/hooks/useCurriculumProgress", () => ({
  useCurriculumProgress: useCurriculumProgressMock,
}));

vi.mock("@/lib/stores/useGameStore", () => ({
  useGameStore: (selector: (state: { setConfig: typeof setConfigMock }) => unknown) =>
    selector({ setConfig: setConfigMock }),
}));

vi.mock("@/lib/analytics/curriculum-analytics", () => ({
  trackCurriculumRecommendationClicked: trackRecMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
  }),
  useSearchParams: () => searchParamsValue,
}));

const baseProgress = {
  loading: false,
  error: null,
  curriculumInfo: {
    country: "NZ",
    yearGrade: "Y3",
    countryLabel: "New Zealand",
    yearGradeLabel: "Year 3",
  },
  overallStatus: "on-track" as const,
  overallPercentage: 72,
  coreSkills: [
    {
      skillId: "NB10",
      label: "Number bonds",
      proficiency: "mastered",
      accuracy: 96,
      coverage: 100,
      totalAttempts: 40,
      totalCorrect: 38,
      avgResponseTime: 1200,
      masteredFactCount: 8,
      expectedFactCount: 8,
      isCore: true,
      isExtension: false,
      lastPracticedAt: "2025-12-01T00:00:00Z",
    },
  ],
  extensionSkills: [],
  coreProgress: { complete: 1, total: 5 },
  extensionProgress: { complete: 0, total: 2 },
  coreSkillCounts: {
    "not-started": 1,
    developing: 2,
    proficient: 1,
    mastered: 1,
  },
  extensionSkillCounts: {
    "not-started": 0,
    developing: 0,
    proficient: 0,
    mastered: 0,
  },
  recommendedFocus: [
    {
      skillId: "SKILL_1",
      label: "Core times tables",
      proficiency: "developing" as const,
      coverage: 45,
      accuracy: 62,
      reason: "needs-practice" as const,
      priority: 2,
      action: {
        topicType: "multiplication",
        config: {
          operations: ["multiplication"],
          selectedNumbers: [2, 5, 10],
        },
      },
    },
  ],
  refresh: vi.fn(),
  lastCalculatedAt: "2025-12-10T12:30:00Z",
};

describe("CurriculumProgressPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParamsValue = new URLSearchParams();
    useLiveQueryMock.mockReturnValue([
      { id: "p1", displayName: "Liam" },
      { id: "p2", displayName: "Ava" },
    ]);
    useCurriculumProgressMock.mockReturnValue(baseProgress);
  });

  it("renders profile selector and summary", () => {
    render(<CurriculumProgressPage />);

    expect(screen.getByRole("heading", { name: "Liam" })).toBeInTheDocument();
    expect(screen.getByText("Core skills")).toBeInTheDocument();
    expect(screen.getByText("Recommended focus")).toBeInTheDocument();
    expect(screen.getByText(/Year 3/i)).toBeInTheDocument();
  });

  it("navigates to curriculum settings when CTA pressed", () => {
    useCurriculumProgressMock.mockReturnValue({
      ...baseProgress,
      curriculumInfo: null,
      recommendedFocus: [],
    });

    render(<CurriculumProgressPage />);

    fireEvent.click(screen.getByRole("button", { name: /Set curriculum/i }));
    expect(pushMock).toHaveBeenCalledWith("/grown-ups?tab=settings");
  });

  it("starts practice when recommendation clicked", () => {
    render(<CurriculumProgressPage />);

    fireEvent.click(screen.getByRole("button", { name: /Practice/i }));
    expect(setConfigMock).toHaveBeenCalled();
    expect(trackRecMock).toHaveBeenCalledWith("p1", "SKILL_1", "progress_panel");
    expect(pushMock).toHaveBeenCalledWith("/play?source=recommendation");
  });

  it("calls refresh handler", () => {
    const refreshMock = vi.fn();
    useCurriculumProgressMock.mockReturnValue({
      ...baseProgress,
      refresh: refreshMock,
    });

    render(<CurriculumProgressPage />);
    fireEvent.click(screen.getByRole("button", { name: /Refresh data/i }));
    expect(refreshMock).toHaveBeenCalled();
  });

  it("shows empty state when no profiles exist", () => {
    useLiveQueryMock.mockReturnValue([]);

    render(<CurriculumProgressPage />);
    expect(
      screen.getByText(/Create a child profile/i)
    ).toBeInTheDocument();
  });
});
