'use client';

import { useMemo, useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Target,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useCurriculumProgress } from '@/lib/hooks/useCurriculumProgress';
import {
  type CurriculumStatus,
  type SkillProgress,
} from '@/lib/game-engine/curriculum-tracker';
import {
  trackCurriculumProgressViewed,
  trackCurriculumSkillDetailed,
} from '@/lib/analytics/curriculum-analytics';
import styles from './CurriculumProgressPanel.module.css';

interface CurriculumProgressPanelProps {
  profileId: string;
  onOpenSettings?: () => void;
  className?: string;
}

const PROFICIENCY_ORDER: Record<string, number> = {
  'not-started': 0,
  'developing': 1,
  'proficient': 2,
  'mastered': 3,
};

const statusCopy: Record<string, string> = {
  behind: 'Needs attention: many core skills are not started or developing.',
  'on-track': 'Steady progress: over half of core skills are proficient.',
  ahead: 'Great work: most core skills are mastered.',
};

function formatProficiency(proficiency: SkillProgress['proficiency']): string {
  switch (proficiency) {
    case 'not-started':
      return 'Not started';
    case 'developing':
      return 'Developing';
    case 'proficient':
      return 'Proficient';
    case 'mastered':
      return 'Mastered';
    default:
      return proficiency;
  }
}

function skillSort(a: SkillProgress, b: SkillProgress) {
  const orderA = PROFICIENCY_ORDER[a.proficiency];
  const orderB = PROFICIENCY_ORDER[b.proficiency];
  if (orderA !== orderB) return orderA - orderB;
  return b.coverage - a.coverage;
}

export function CurriculumProgressPanel({
  profileId,
  onOpenSettings,
  className,
}: CurriculumProgressPanelProps) {
  const router = useRouter();
  const [coreExpanded, setCoreExpanded] = useState(false);
  const [extExpanded, setExtExpanded] = useState(false);
  const [coreCollapsed, setCoreCollapsed] = useState(true);
  const [extCollapsed, setExtCollapsed] = useState(true);
  const {
    loading,
    error,
    overallStatus,
    skillProgress,
    coreProgress,
    extensionProgress,
    curriculumInfo,
  } = useCurriculumProgress(profileId);

  const coreSectionId = useMemo(() => `core-skills-${Math.random().toString(36).slice(2, 8)}`, []);
  const extensionSectionId = useMemo(() => `extension-skills-${Math.random().toString(36).slice(2, 8)}`, []);

  const statusTrackedRef = useRef<CurriculumStatus | null>(null);

  useEffect(() => {
    if (curriculumInfo && overallStatus && statusTrackedRef.current !== overallStatus) {
      statusTrackedRef.current = overallStatus;
      trackCurriculumProgressViewed(profileId, overallStatus);
    }
  }, [curriculumInfo, overallStatus, profileId]);

  const handleSkillInteraction = (skill: SkillProgress) => {
    trackCurriculumSkillDetailed(profileId, skill.skillId, skill.proficiency);
  };

  const handleSkillKeyDown = (event: KeyboardEvent<HTMLDivElement>, skill: SkillProgress) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSkillInteraction(skill);
    }
  };

  const coreSkills = useMemo(
    () => skillProgress.filter((s) => s.isCore).sort(skillSort),
    [skillProgress]
  );
  const extensionSkills = useMemo(
    () => skillProgress.filter((s) => s.isExtension).sort(skillSort),
    [skillProgress]
  );

  const visibleCore = coreExpanded ? coreSkills : coreSkills.slice(0, 5);
  const visibleExt = extExpanded ? extensionSkills : extensionSkills.slice(0, 5);
  const openSettings = () => {
    if (onOpenSettings) {
      onOpenSettings();
    } else {
      router.push('/grown-ups?tab=settings');
    }
  };
  const openDetailedView = () => {
    if (!profileId) return;
    router.push(`/grown-ups/curriculum?profileId=${profileId}`);
  };

  const statusClass =
    overallStatus === 'ahead'
      ? styles.statusAhead
      : overallStatus === 'on-track'
        ? styles.statusOnTrack
        : styles.statusBehind;

  return (
    <section className={`${styles.container} ${className ?? ''}`} aria-label="Curriculum progress">
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <BookOpen size={18} aria-hidden="true" />
          <span className={styles.title}>Curriculum Progress</span>
        </div>
        <div className={styles.headerActions}>
          {overallStatus && (
            <span className={`${styles.statusBadge} ${statusClass}`}>{overallStatus}</span>
          )}
          <button type="button" className={styles.detailButton} onClick={openDetailedView}>
            View details
          </button>
        </div>
      </div>

      {loading && (
        <div className={styles.loading}>
          <div className={styles.skeleton} style={{ maxWidth: 180 }} />
          <div className={styles.skeleton} style={{ maxWidth: 120 }} />
        </div>
      )}

      {error && (
        <div className={styles.emptyState}>
          <AlertTriangle size={16} aria-hidden="true" /> Unable to load curriculum progress. Please
          try again.
        </div>
      )}

      {!loading && !error && !curriculumInfo && (
        <div className={styles.emptyState}>
          Set country and year to see curriculum-aligned progress.
          <button type="button" className={styles.ctaButton} onClick={openSettings}>
            Set curriculum
          </button>
        </div>
      )}

      {!loading && !error && curriculumInfo && (
        <>
          <div className={styles.meta}>
            {curriculumInfo.countryLabel} / {curriculumInfo.yearGradeLabel}
          </div>
          <div className={styles.chips}>
            <div className={`${styles.chip} ${styles.chipAccentCore}`}>
              <CheckCircle2 size={16} aria-hidden="true" />
              <span className="label">Core</span>
              <span>{coreProgress.complete}/{coreProgress.total} proficient+</span>
            </div>
            <div className={`${styles.chip} ${styles.chipAccentExt}`}>
              <Sparkles size={16} aria-hidden="true" />
              <span className="label">Extension</span>
              <span>{extensionProgress.complete}/{extensionProgress.total} started</span>
            </div>
            {overallStatus && (
              <div className={styles.chip}>
                <Target size={16} aria-hidden="true" />
                <span className="label">Status</span>
                <span>{statusCopy[overallStatus]}</span>
              </div>
            )}
          </div>

          <div className={styles.sections}>
            <div className={styles.skillList} aria-label="Core skills" id={coreSectionId}>
              <div className={styles.skillHeader}>
                <h4>Core Skills</h4>
                <span className={styles.meta}>
                  {coreProgress.complete}/{coreProgress.total} proficient+
                </span>
                <button
                  type="button"
                  className={styles.collapseToggle}
                  onClick={() => setCoreCollapsed((v) => !v)}
                  aria-expanded={!coreCollapsed} aria-controls={coreSectionId}
                >
                  {coreCollapsed ? 'Show' : 'Hide'}
                </button>
              </div>
              <div className={styles.sectionActions}>
                {/* Filter and summary removed per design simplification */}
              </div>
              {!coreCollapsed && (
                <>
                  {coreSkills.length === 0 && (
                    <div className={styles.meta}>No core skills found for this year.</div>
                  )}
                  {visibleCore.map((skill) => (
                    <div
                      key={skill.skillId}
                      className={`${styles.skillItem} ${
                        skill.proficiency === 'not-started' || skill.proficiency === 'developing'
                          ? styles.needsWork
                          : ''
                      }`}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSkillInteraction(skill)}
                      onKeyDown={(event) => handleSkillKeyDown(event, skill)}
                    >
                      <div className={styles.skillInfo}>
                        <span className={styles.skillLabel}>{skill.label}</span>
                        <span className={styles.skillMeta}>
                          {skill.accuracy}% acc / {skill.coverage}% coverage
                        </span>
                      </div>
                      <span
                        className={`${styles.proficiencyBadge} ${
                          skill.proficiency === 'not-started'
                            ? styles.pNotStarted
                            : skill.proficiency === 'developing'
                              ? styles.pDeveloping
                              : skill.proficiency === 'proficient'
                                ? styles.pProficient
                                : styles.pMastered
                        }`}
                      >
                        {formatProficiency(skill.proficiency)}
                      </span>
                    </div>
                  ))}
                  {coreSkills.length > visibleCore.length && (
                    <div className={styles.moreRow}>
                      <button
                        type="button"
                        className={styles.linkButton}
                        onClick={() => setCoreExpanded((v) => !v)}
                      >
                        {coreExpanded ? 'Show fewer' : `Show all (${coreSkills.length})`}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className={styles.skillList} aria-label="Extension skills" id={extensionSectionId}>
              <div className={styles.skillHeader}>
                <h4>Extension</h4>
                <span className={styles.meta}>
                  {extensionProgress.complete}/{extensionProgress.total} proficient+
                </span>
                <button
                  type="button"
                  className={styles.collapseToggle}
                  onClick={() => setExtCollapsed((v) => !v)}
                  aria-expanded={!extCollapsed} aria-controls={extensionSectionId}
                >
                  {extCollapsed ? 'Show' : 'Hide'}
                </button>
              </div>
              {extensionSkills.length === 0 && (
                <div className={styles.meta}>No extension skills for this year.</div>
              )}
              {!extCollapsed && (
                <>
                  {visibleExt.map((skill) => (
                    <div
                      key={skill.skillId}
                      className={styles.skillItem}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSkillInteraction(skill)}
                      onKeyDown={(event) => handleSkillKeyDown(event, skill)}
                    >
                      <div className={styles.skillInfo}>
                        <span className={styles.skillLabel}>{skill.label}</span>
                        <span className={styles.skillMeta}>
                          {skill.accuracy}% acc / {skill.coverage}% coverage
                        </span>
                      </div>
                      <span
                        className={`${styles.proficiencyBadge} ${
                          skill.proficiency === 'not-started'
                            ? styles.pNotStarted
                            : skill.proficiency === 'developing'
                              ? styles.pDeveloping
                              : skill.proficiency === 'proficient'
                                ? styles.pProficient
                                : styles.pMastered
                        }`}
                      >
                        {formatProficiency(skill.proficiency)}
                      </span>
                    </div>
                  ))}
                  {extensionSkills.length > visibleExt.length && (
                    <div className={styles.moreRow}>
                      <button
                        type="button"
                        className={styles.linkButton}
                        onClick={() => setExtExpanded((v) => !v)}
                      >
                        {extExpanded ? 'Show fewer' : `Show all (${extensionSkills.length})`}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </>
      )}
    </section>
  );
}
