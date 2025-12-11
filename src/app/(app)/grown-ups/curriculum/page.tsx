'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { BookOpen, RefreshCcw, Sparkles, Target, AlertTriangle, Play } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useCurriculumProgress } from '@/lib/hooks/useCurriculumProgress';
import { SkillProgressGrid } from '@/components/features/curriculum';
import { useGameStore } from '@/lib/stores/useGameStore';
import { trackCurriculumRecommendationClicked } from '@/lib/analytics/curriculum-analytics';
import styles from './page.module.css';

const STATUS_COPY: Record<string, string> = {
  behind: 'Needs attention: help your child level up key core skills.',
  'on-track': 'Steady progress: most core skills are proficient.',
  ahead: 'Great work: extension skills are underway.',
};

const STATUS_ADVICE: Record<string, string> = {
  behind: 'Start with the recommended focus list to unlock core mastery.',
  'on-track': 'Keep reinforcing core skills and sprinkle in extension.',
  ahead: 'Mix in extension sessions to maintain momentum.',
};

const RECOMMENDATION_REASON: Record<string, string> = {
  'needs-practice': 'Needs practice',
  'in-progress': 'Almost there',
  'next-skill': 'Next up',
  review: 'Review opportunity',
};

export default function CurriculumProgressPage() {
  const profiles = useLiveQuery(() => db.profiles.toArray());
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (!profiles || profiles.length === 0) return;
    const requested = searchParams?.get('profileId');
    if (requested && profiles.some((p) => p.id === requested)) {
      setSelectedProfileId((prev) => prev ?? requested);
      return;
    }
    setSelectedProfileId((prev) => prev ?? profiles[0].id);
  }, [profiles, searchParams]);

  const handleProfileChange = (profileId: string) => {
    setSelectedProfileId(profileId);
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('profileId', profileId);
    router.replace(`/grown-ups/curriculum?${params.toString()}`);
  };

  if (!profiles) {
    return (
      <div className={styles.page}>
        <div className={styles.summaryCard}>
          <div className={styles.loadingSkeleton}>
            <div className={styles.skeletonLine} style={{ width: '45%' }} />
            <div className={styles.skeletonLine} style={{ width: '65%' }} />
            <div className={styles.skeletonLine} style={{ width: '35%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.titleRow}>
            <BookOpen size={22} aria-hidden="true" />
            <h1 className={styles.title}>Curriculum Progress</h1>
          </div>
          <p className={styles.subText}>
            Create a child profile in the Grown-Ups dashboard to start tracking curriculum progress.
          </p>
        </header>
        <div className={styles.emptyState}>
          <p>
            No profiles yet. Visit the{' '}
            <Link href="/grown-ups" className={styles.statusCopy}>
              Grown-Ups dashboard
            </Link>{' '}
            to add your first learner.
          </p>
        </div>
      </div>
    );
  }

  const selectedProfile = profiles.find((profile) => profile.id === selectedProfileId) ?? profiles[0];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <Link href="/grown-ups" className={styles.backLink}>
            &larr; Back to dashboard
          </Link>
          <div className={styles.titleRow}>
            <BookOpen size={22} aria-hidden="true" />
            <h1 className={styles.title}>{selectedProfile?.displayName ?? 'Curriculum Progress'}</h1>
          </div>
        </div>
        <p className={styles.subText}>Detailed view of curriculum-aligned progress for each child.</p>
        <div className={styles.profileSelector}>
          {profiles.map((profile) => (
            <button
              key={profile.id}
              type="button"
              onClick={() => handleProfileChange(profile.id)}
              className={clsx(
                styles.profileButton,
                selectedProfile?.id === profile.id && styles.profileButtonActive
              )}
            >
              {profile.displayName}
            </button>
          ))}
        </div>
      </header>

      {selectedProfile?.id ? (
        <ProfileCurriculumView profileId={selectedProfile.id} profileName={selectedProfile.displayName} />
      ) : (
        <div className={styles.summaryCard}>
          <p className={styles.subText}>Select a profile to see curriculum progress.</p>
        </div>
      )}
    </div>
  );
}

interface ProfileCurriculumViewProps {
  profileId: string;
  profileName: string;
}

function ProfileCurriculumView({ profileId, profileName }: ProfileCurriculumViewProps) {
  const router = useRouter();
  const {
    loading,
    error,
    curriculumInfo,
    overallStatus,
    overallPercentage,
    coreSkills,
    extensionSkills,
    coreProgress,
    extensionProgress,
    coreSkillCounts,
    extensionSkillCounts,
    recommendedFocus,
    lastCalculatedAt,
    refresh,
  } = useCurriculumProgress(profileId);
  const setConfig = useGameStore((state) => state.setConfig);

  const highlightSkillIds = useMemo(
    () => recommendedFocus.map((rec) => rec.skillId),
    [recommendedFocus]
  );
  const heroPercentage = overallPercentage ?? 0;
  const needsFocusCount = coreSkillCounts['not-started'] + coreSkillCounts.developing;
  const heroEmptyState = heroPercentage === 0 && recommendedFocus.length === 0;
  const sortedRecommendations = [...recommendedFocus].sort((a, b) => a.priority - b.priority);

  const statusClass =
    overallStatus === 'ahead'
      ? styles.badgeAhead
      : overallStatus === 'on-track'
        ? styles.badgeOnTrack
        : styles.badgeBehind;

  const handlePractice = (skillId: string) => {
    const rec = recommendedFocus.find((item) => item.skillId === skillId);
    if (!rec) return;

    const cfg = rec.action?.config ?? {};
    const update: Partial<Parameters<typeof setConfig>[0]> = {};
    if (cfg.operations) update.operations = cfg.operations;
    if (cfg.selectedNumbers) update.selectedNumbers = cfg.selectedNumbers;
    if (cfg.numberRange) update.numberRange = cfg.numberRange;
    if (cfg.selectedTopics && cfg.selectedTopics.length > 0) {
      update.selectedTopics = cfg.selectedTopics;
    } else if (rec.action?.topicType) {
      update.selectedTopics = [rec.action.topicType];
    }
    setConfig(update);
    trackCurriculumRecommendationClicked(profileId, skillId, 'progress_panel');
    router.push('/play?source=recommendation');
  };

  if (loading) {
    return (
      <div className={styles.summaryCard}>
        <div className={styles.loadingSkeleton}>
          <div className={styles.skeletonLine} style={{ width: '55%' }} />
          <div className={styles.skeletonLine} style={{ width: '70%' }} />
          <div className={styles.skeletonLine} style={{ width: '40%' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.summaryCard}>
        <div className={styles.emptyState}>
          <AlertTriangle size={16} aria-hidden="true" /> Unable to load curriculum progress. Please try again.
        </div>
      </div>
    );
  }

  const statusCopy = overallStatus ? STATUS_COPY[overallStatus] : 'Set a curriculum to unlock progress insights.';
  const statusHint = overallStatus ? STATUS_ADVICE[overallStatus] : 'Set a curriculum to unlock tailored advice.';

  return (
    <>
      <div className={styles.summaryCard}>
        <div className={styles.summaryHeader}>
          <div>
            <p className={styles.subText}>
              {curriculumInfo?.countryLabel ?? 'Curriculum not set'}{' '}
              {curriculumInfo?.yearGradeLabel ? `· ${curriculumInfo.yearGradeLabel}` : ''}
            </p>
            <h2 className={styles.title}>
              {overallPercentage !== null ? `${overallPercentage}% complete` : 'Progress unavailable'}
            </h2>
            <div
              className={styles.progressTrack}
              role="progressbar"
              aria-label="Overall curriculum completion"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={heroPercentage}
            >
              <div className={styles.progressFill} style={{ width: `${heroPercentage}%` }} />
            </div>
          </div>
          {overallStatus && (
            <span className={clsx(styles.statusBadge, statusClass)}>
              <Target size={16} aria-hidden="true" />
              {overallStatus.replace('-', ' ')}
            </span>
          )}
        </div>

        <p className={styles.statusCopy}>{statusCopy}</p>
        <p className={styles.statusHint}>{statusHint}</p>
        <p className={styles.lastUpdated}>
          Last calculated {lastCalculatedAt ? new Date(lastCalculatedAt).toLocaleString() : 'just now'}
        </p>

        <div className={styles.statGrid}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Core proficient</p>
            <p className={styles.statValue}>
              {coreProgress.complete}/{coreProgress.total}
            </p>
            <p className={styles.statHintText}>Proficient or mastered core skills</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Extension practiced</p>
            <p className={styles.statValue}>
              {extensionProgress.complete}/{extensionProgress.total}
            </p>
            <p className={styles.statHintText}>Extension skills with any activity</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Needs focus</p>
            <p className={styles.statValue}>{needsFocusCount}</p>
            <p className={styles.statHintText}>Not started or developing core skills</p>
          </div>
        </div>

        <div className={styles.actionsRow}>
          <button type="button" className={styles.refreshButton} onClick={refresh}>
            <RefreshCcw size={15} aria-hidden="true" /> Refresh data
          </button>
          {!curriculumInfo && (
            <button type="button" className={styles.ctaButton} onClick={() => router.push('/grown-ups?tab=settings')}>
              Set curriculum
            </button>
          )}
        </div>

        {heroEmptyState && (
          <div className={styles.heroEmpty}>
            <Sparkles size={18} aria-hidden="true" />
            <div>
              <p className={styles.heroEmptyTitle}>Kick things off</p>
              <span>Play a practice session to see personalised insights.</span>
            </div>
          </div>
        )}
      </div>

      {curriculumInfo ? (
        <div className={styles.layout}>
          <div className={styles.gridStack}>
            <SkillProgressGrid
              title="Core skills"
              skills={coreSkills}
              variant="core"
              highlightSkillIds={highlightSkillIds}
              emptyState="No core skills mapped yet."
            />
            <SkillProgressGrid
              title="Extension skills"
              skills={extensionSkills}
              variant="extension"
              highlightSkillIds={highlightSkillIds}
              emptyState="This curriculum has no extension skills."
            />
          </div>

          <aside className={styles.recommendations}>
            <div className={styles.recommendHeader}>
              <h3>Recommended focus</h3>
              <span className={styles.subText}>Up to three areas pulled from the curriculum tracker.</span>
            </div>
            {sortedRecommendations.length === 0 ? (
              <div className={styles.emptyState}>
                <Sparkles size={16} aria-hidden="true" /> Play a session to see targeted practice ideas.
              </div>
            ) : (
              <div className={styles.recommendList}>
                {sortedRecommendations.map((rec) => (
                  <div key={rec.skillId} className={styles.recommendCard}>
                    <div className={styles.recommendInfo}>
                      <div className={styles.recommendTitleRow}>
                        <span className={styles.recommendTitle}>{rec.label}</span>
                        <span className={styles.recommendPriority}>Priority {rec.priority}</span>
                      </div>
                      <span className={styles.recommendReason}>{RECOMMENDATION_REASON[rec.reason]}</span>
                      <span className={styles.recommendMeta}>
                        {rec.proficiency} · {rec.accuracy}% accuracy · {rec.coverage}% coverage
                      </span>
                      <div className={styles.recommendProgress} aria-hidden="true">
                        <div className={styles.recommendProgressFill} style={{ width: `${rec.coverage}%` }} />
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.practiceButton}
                      onClick={() => handlePractice(rec.skillId)}
                    >
                      <Play size={14} aria-hidden="true" /> Practice
                    </button>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <AlertTriangle size={16} aria-hidden="true" /> Set the country and year for {profileName} to unlock the
          curriculum breakdown.
        </div>
      )}
    </>
  );
}
