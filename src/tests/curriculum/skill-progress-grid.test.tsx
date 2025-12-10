import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { SkillProgress } from '@/lib/game-engine/curriculum-tracker';
import { SkillProgressGrid } from '@/components/features/curriculum/SkillProgressGrid';

const baseSkill: SkillProgress = {
  skillId: 'SKILL_1',
  label: 'Number Bonds',
  proficiency: 'developing',
  accuracy: 62,
  coverage: 55,
  totalAttempts: 20,
  totalCorrect: 12,
  avgResponseTime: 2300,
  masteredFactCount: 2,
  expectedFactCount: 10,
  isCore: true,
  isExtension: false,
  lastPracticedAt: '2025-12-01T12:00:00Z',
};

const buildSkill = (overrides: Partial<SkillProgress> = {}): SkillProgress => ({
  ...baseSkill,
  ...overrides,
});

describe('SkillProgressGrid', () => {
  it('renders provided skills and summary', () => {
    render(
      <SkillProgressGrid
        title="Core Skills"
        variant="core"
        skills={[
          buildSkill({ skillId: 'SKILL_A', label: 'Addition to 20', proficiency: 'proficient', accuracy: 88, coverage: 92, masteredFactCount: 8 }),
          buildSkill({ skillId: 'SKILL_B', label: 'Times Tables', proficiency: 'developing' }),
        ]}
      />
    );

    expect(screen.getByText('Core Skills')).toBeInTheDocument();
    expect(screen.getByText(/2 skills/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Addition to 20/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Times Tables/ })).toBeInTheDocument();
  });

  it('filters to skills that need focus', () => {
    render(
      <SkillProgressGrid
        title="Core"
        skills={[
          buildSkill({ skillId: 'SKILL_A', label: 'Addition to 20', proficiency: 'proficient' }),
          buildSkill({ skillId: 'SKILL_B', label: 'Multiplication facts', proficiency: 'developing' }),
        ]}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: /developing or not started/i })
    );

    expect(screen.getByRole('button', { name: /Multiplication facts/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Addition to 20/ })).toBeNull();
  });

  it('invokes onSkillSelect when a card is clicked', () => {
    const onSkillSelect = vi.fn();
    render(
      <SkillProgressGrid
        title="Core"
        skills={[buildSkill({ skillId: 'SKILL_C', label: 'Squares' })]}
        onSkillSelect={onSkillSelect}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Squares/ }));
    expect(onSkillSelect).toHaveBeenCalledWith(expect.objectContaining({ skillId: 'SKILL_C' }));
  });

  it('shows empty state when no skills exist', () => {
    render(<SkillProgressGrid title="Extension" variant="extension" skills={[]} />);
    expect(screen.getByText('No skills to show yet.')).toBeInTheDocument();
  });

  it('marks highlighted skills in the DOM', () => {
    render(
      <SkillProgressGrid
        title="Core"
        skills={[
          buildSkill({ skillId: 'SKILL_A', label: 'Doubles' }),
          buildSkill({ skillId: 'SKILL_B', label: 'Halves' }),
        ]}
        highlightSkillIds={['SKILL_B']}
      />
    );

    const highlighted = screen.getByRole('button', { name: /Halves/ });
    expect(highlighted.getAttribute('data-highlight')).toBe('true');
  });
});
