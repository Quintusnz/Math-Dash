import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { SkillProgress } from '@/lib/game-engine/curriculum-tracker';
import { SkillCard } from '@/components/features/curriculum/SkillCard';

const sampleSkill: SkillProgress = {
  skillId: 'SKILL_TEST',
  label: 'Square Numbers',
  proficiency: 'proficient',
  accuracy: 90,
  coverage: 95,
  totalAttempts: 45,
  totalCorrect: 40,
  avgResponseTime: 1800,
  masteredFactCount: 9,
  expectedFactCount: 10,
  isCore: true,
  isExtension: false,
  lastPracticedAt: '2025-12-01T08:00:00Z',
};

describe('SkillCard', () => {
  it('renders skill content and stats', () => {
    render(<SkillCard skill={sampleSkill} variant="core" />);

    expect(screen.getByRole('button', { name: /Square Numbers/ })).toBeInTheDocument();
    expect(screen.getByText(/90% accuracy/)).toBeInTheDocument();
    expect(screen.getByText(/95% coverage/)).toBeInTheDocument();
    expect(screen.getByText(/9\/10 mastered/)).toBeInTheDocument();
  });

  it('sets highlight attribute when requested', () => {
    render(<SkillCard skill={sampleSkill} highlight />);
    const card = screen.getByRole('button', { name: /Square Numbers/ });
    expect(card.getAttribute('data-highlight')).toBe('true');
  });

  it('invokes onSelect via click and keyboard', () => {
    const onSelect = vi.fn();
    render(<SkillCard skill={sampleSkill} onSelect={onSelect} />);

    const card = screen.getByRole('button', { name: /Square Numbers/ });
    fireEvent.click(card);
    expect(onSelect).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledTimes(2);
  });
});
