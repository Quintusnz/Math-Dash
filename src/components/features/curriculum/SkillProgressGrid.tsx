'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import type { SkillProgress } from '@/lib/game-engine/curriculum-tracker';
import { SkillCard } from './SkillCard';
import styles from './SkillProgressGrid.module.css';

type FilterId = 'all' | 'needs-focus' | 'proficient';

const FILTERS: { id: FilterId; label: string; description: string }[] = [
  { id: 'all', label: 'All', description: 'Show every skill' },
  { id: 'needs-focus', label: 'Needs focus', description: 'Skills that are developing or not started' },
  { id: 'proficient', label: 'Proficient+', description: 'Skills that are on track or mastered' },
];

const createCountMap = () => ({
  'not-started': 0,
  developing: 0,
  proficient: 0,
  mastered: 0,
});

export interface SkillProgressGridProps {
  title: string;
  skills: SkillProgress[];
  variant?: 'core' | 'extension';
  onSkillSelect?: (skill: SkillProgress) => void;
  emptyState?: string;
  highlightSkillIds?: string[];
  className?: string;
}

export function SkillProgressGrid({
  title,
  skills,
  variant,
  onSkillSelect,
  emptyState = 'No skills to show yet.',
  highlightSkillIds,
  className,
}: SkillProgressGridProps) {
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');

  const proficiencyCounts = useMemo(() => {
    const counts = createCountMap();
    for (const skill of skills) {
      counts[skill.proficiency] += 1;
    }
    return counts;
  }, [skills]);

  const filteredSkills = useMemo(() => {
    if (activeFilter === 'needs-focus') {
      return skills.filter(
        (skill) => skill.proficiency === 'not-started' || skill.proficiency === 'developing'
      );
    }
    if (activeFilter === 'proficient') {
      return skills.filter(
        (skill) => skill.proficiency === 'proficient' || skill.proficiency === 'mastered'
      );
    }
    return skills;
  }, [skills, activeFilter]);

  const proficientPlus = proficiencyCounts.proficient + proficiencyCounts.mastered;

  const renderCard = (skill: SkillProgress) => (
    <SkillCard
      key={skill.skillId}
      skill={skill}
      variant={variant ?? (skill.isCore ? 'core' : skill.isExtension ? 'extension' : undefined)}
      highlight={highlightSkillIds?.includes(skill.skillId)}
      onSelect={onSkillSelect}
    />
  );

  const body = (() => {
    if (skills.length === 0) {
      return <div className={styles.emptyState}>{emptyState}</div>;
    }
    if (filteredSkills.length === 0) {
      return <div className={styles.emptyState}>No skills match this filter.</div>;
    }
    return <div className={styles.grid}>{filteredSkills.map(renderCard)}</div>;
  })();

  return (
    <section className={clsx(styles.container, className)} aria-label={`${title} skill grid`}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.title}>{title}</span>
          <span className={styles.subtitle}>
            {skills.length} skills | {proficientPlus} proficient+
          </span>
        </div>
        {variant && (
          <span
            className={clsx(
              styles.variantBadge,
              variant === 'core' ? styles.variantCore : styles.variantExtension
            )}
          >
            {variant === 'core' ? 'Core focus' : 'Extension focus'}
          </span>
        )}
      </div>
      {skills.length > 0 && (
        <div className={styles.filters}>
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              aria-label={filter.description}
              aria-pressed={activeFilter === filter.id}
              className={clsx(
                styles.filterButton,
                activeFilter === filter.id && styles.filterButtonActive
              )}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}
      {body}
    </section>
  );
}
