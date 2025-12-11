'use client';

import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { Circle, CircleDot, CheckCircle2, Sparkles as SparkleIcon } from 'lucide-react';
import type { SkillProgress } from '@/lib/game-engine/curriculum-tracker';
import styles from './SkillCard.module.css';

const PROFICIENCY_LABELS: Record<SkillProgress['proficiency'], string> = {
  'not-started': 'Not started',
  developing: 'Developing',
  proficient: 'Proficient',
  mastered: 'Mastered',
};

const BADGE_CLASS: Record<SkillProgress['proficiency'], string> = {
  'not-started': styles.badgeNotStarted,
  developing: styles.badgeDeveloping,
  proficient: styles.badgeProficient,
  mastered: styles.badgeMastered,
};

const PROFICIENCY_ICON: Record<SkillProgress['proficiency'], LucideIcon> = {
  'not-started': Circle,
  developing: CircleDot,
  proficient: CheckCircle2,
  mastered: SparkleIcon,
};

export interface SkillCardProps {
  skill: SkillProgress;
  variant?: 'core' | 'extension';
  highlight?: boolean;
  className?: string;
  onSelect?: (skill: SkillProgress) => void;
}

export function SkillCard({
  skill,
  variant,
  highlight = false,
  className,
  onSelect,
}: SkillCardProps) {
  const resolvedVariant = variant ?? (skill.isCore ? 'core' : skill.isExtension ? 'extension' : undefined);
  const BadgeIcon = PROFICIENCY_ICON[skill.proficiency];

  const handleSelect = () => {
    onSelect?.(skill);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={skill.label}
      data-highlight={highlight ? 'true' : undefined}
      className={clsx(
        styles.card,
        resolvedVariant === 'core' && styles.cardCore,
        resolvedVariant === 'extension' && styles.cardExtension,
        highlight && styles.cardHighlight,
        className
      )}
      onClick={handleSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleSelect();
        }
      }}
    >
      <div className={styles.header}>
        <span className={styles.skillLabel}>{skill.label}</span>
        <span className={clsx(styles.badge, BADGE_CLASS[skill.proficiency])}>
          <BadgeIcon size={14} aria-hidden="true" />
          {PROFICIENCY_LABELS[skill.proficiency]}
        </span>
      </div>
      <div className={styles.statRow}>
        <span>{Math.round(skill.accuracy)}% accuracy</span>
        <span>{Math.round(skill.coverage)}% coverage</span>
      </div>
      <div className={styles.statRow}>
        <span>{skill.totalAttempts} attempts</span>
        <span>
          {skill.masteredFactCount}/{skill.expectedFactCount} mastered
        </span>
      </div>
      {skill.lastPracticedAt && (
        <span className={styles.meta}>
          Last practiced {new Date(skill.lastPracticedAt).toLocaleDateString()}
        </span>
      )}
    </div>
  );
}
