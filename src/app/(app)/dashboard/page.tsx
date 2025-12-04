"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfileStore } from "@/lib/stores/useProfileStore";
import { useLiveQuery } from "dexie-react-hooks";
import { db, DailyDash } from "@/lib/db";
import { MasteryTracker } from "@/lib/game-engine/mastery-tracker";
import { WeeklyGoalTracker } from "@/lib/game-engine/weekly-goal-tracker";
import { DailyDashTracker } from "@/lib/game-engine/daily-dash-tracker";
import { getTodayDate } from "@/lib/game-engine/weekly-goal-tracker";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AuthGuard, PlayCodeDisplay } from "@/components/features/auth";
import { StreakDisplay, WeeklyGoalDisplay, DailyDashCard, SuggestedPractice, QuickPlay } from "@/components/features/engagement";
import { ProfileChip } from "@/components/features/profiles/ProfileChip";
import { TopicSuggestions, Suggestion } from "@/lib/game-engine/topic-suggestions";
import { Settings, LogOut, Rocket, Swords, Zap, Trophy } from "lucide-react";
import styles from './page.module.css';

const SkillRadar = dynamic(
  () => import("@/components/features/analytics/SkillRadar").then((mod) => mod.SkillRadar),
  { 
    loading: () => <div className={styles.loadingPlaceholder} />,
    ssr: false 
  }
);

function DashboardContent() {
  const router = useRouter();
  const { activeProfile, logout } = useProfileStore();
  const [showGoalCelebration, setShowGoalCelebration] = useState(false);
  const [dailyDashState, setDailyDashState] = useState<DailyDash | null | undefined>(undefined);
  
  const radarData = useLiveQuery(
    async () => activeProfile?.id ? await MasteryTracker.getRadarData(activeProfile.id) : undefined,
    [activeProfile?.id]
  );

  // Fetch weekly goal with auto-reset logic
  const weeklyGoal = useLiveQuery(
    async () => {
      if (!activeProfile?.id) return undefined;
      try {
        return await WeeklyGoalTracker.getWeeklyGoal(activeProfile.id);
      } catch (e) {
        console.error('Failed to fetch weekly goal:', e);
        return undefined;
      }
    },
    [activeProfile?.id]
  );

  // Fetch streak data fresh from database to ensure it's always current
  const streakData = useLiveQuery(
    async () => {
      if (!activeProfile?.id) return null;
      const profile = await db.profiles.get(activeProfile.id);
      return profile?.streak ?? null;
    },
    [activeProfile?.id]
  );

  // Fetch topic suggestions based on mastery data
  const suggestions = useLiveQuery(
    async () => {
      if (!activeProfile?.id) return [] as Suggestion[];
      try {
        return await TopicSuggestions.getSuggestions(activeProfile.id, 2);
      } catch (e) {
        console.error('Failed to fetch suggestions:', e);
        return [] as Suggestion[];
      }
    },
    [activeProfile?.id]
  );

  // READ-ONLY: Fetch today's Daily Dash from database
  const today = getTodayDate();
  const existingDailyDash = useLiveQuery(
    async () => {
      if (!activeProfile?.id) return null;
      // Only READ - no writes in useLiveQuery
      const existing = await db.dailyDash
        .where('[profileId+date]')
        .equals([activeProfile.id, today])
        .first();
      return existing ?? null;
    },
    [activeProfile?.id, today]
  );

  // WRITE: Generate daily dash outside of useLiveQuery if none exists
  useEffect(() => {
    const generateDashIfNeeded = async () => {
      if (!activeProfile?.id) {
        setDailyDashState(null);
        return;
      }
      
      // If useLiveQuery is still loading, wait
      if (existingDailyDash === undefined) {
        return;
      }
      
      // If we already have one, use it
      if (existingDailyDash) {
        setDailyDashState(existingDailyDash);
        return;
      }
      
      // Generate a new one (write operation - outside useLiveQuery)
      try {
        console.log('[DailyDash] Generating new dash for profile:', activeProfile.id);
        const newDash = await DailyDashTracker.generateDailyDash(activeProfile.id);
        console.log('[DailyDash] Generated:', newDash);
        setDailyDashState(newDash);
      } catch (e) {
        console.error('[DailyDash] Failed to generate:', e);
        setDailyDashState(null);
      }
    };
    
    generateDashIfNeeded();
  }, [activeProfile?.id, existingDailyDash]);

  // Combine: use existing from DB or generated state
  const dailyDash = existingDailyDash ?? dailyDashState;
  const isDailyDashLoading = dailyDash === undefined;

  const handleGoalComplete = useCallback(() => {
    setShowGoalCelebration(true);
    // Auto-dismiss after 3 seconds
    setTimeout(() => setShowGoalCelebration(false), 3000);
  }, []);

  const handleStartDailyDash = useCallback(() => {
    router.push('/play/daily');
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Math Dash</h1>
          {activeProfile && (
            <div className={styles.headerActions}>
              <Link href="/settings" className={styles.iconButton} aria-label="Settings">
                <Settings size={20} />
              </Link>
              <button 
                onClick={handleLogout}
                className={styles.iconButton}
                aria-label="Log out"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
        
        {activeProfile && (
          <>
            <div className={styles.profileBanner}>
              <div className={styles.profileLeft}>
                <div className={styles.avatarLarge}>{activeProfile.avatarId}</div>
                <div className={styles.profileDetails}>
                  <span className={styles.greeting}>Hi, {activeProfile.displayName}!</span>
                  {activeProfile.playCode && (
                    <div className={styles.playCodeRow}>
                      <span className={styles.playCodeLabel}>Play Code:</span>
                      <PlayCodeDisplay code={activeProfile.playCode} compact />
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.profileRight}>
                <div className={styles.switcherWrapper}>
                  <span className={styles.switcherLabel}>Switch Player</span>
                  <ProfileChip size="md" showSwitcher={true} />
                </div>
              </div>
            </div>

            <div className={styles.freePlayCard}>
              <div className={styles.freePlayHeader}>
                <Zap className={styles.freePlayIcon} size={20} />
                <span className={styles.freePlayTitle}>Free Play</span>
                <span className={styles.freePlaySubtitle}>Jump in anytime</span>
              </div>
              <QuickPlay className={styles.quickPlayCard} />
              <div className={styles.freePlayButtons}>
                <Link href="/play" className={styles.buttonPrimary}>
                  <Rocket size={18} />
                  Solo Dash
                </Link>
                <Link href="/play/duel" className={styles.buttonSecondary}>
                  <Swords size={18} />
                  Duel Mode
                </Link>
              </div>
            </div>
          </>
        )}
      </header>

      <main className={styles.mainGrid}>
        {activeProfile && (
          <>
            {/* Daily Dash - Featured Section */}
            <section className={styles.dailyDashSection}>
              <h2 className={styles.sectionTitle}>Today&apos;s Challenge</h2>
              <DailyDashCard 
                dailyDash={dailyDash}
                loading={isDailyDashLoading}
                onStart={handleStartDailyDash}
              />
            </section>

            <section className={styles.engagementSection}>
              <h2 className={styles.sectionTitle}>Your Goals</h2>
              <div className={styles.engagementCards}>
                <WeeklyGoalDisplay 
                  weeklyGoal={weeklyGoal} 
                  onGoalComplete={handleGoalComplete}
                />
                <StreakDisplay streak={streakData} />
                <Link href="/achievements" className={styles.achievementsCard}>
                  <div className={styles.achievementsCardIcon}>
                    <Trophy size={28} />
                  </div>
                  <div className={styles.achievementsCardContent}>
                    <span className={styles.achievementsCardTitle}>Achievements</span>
                    <span className={styles.achievementsCardSubtitle}>View your badges</span>
                  </div>
                </Link>
              </div>
            </section>

            {/* Suggested Practice - Rule-based recommendations */}
            <section className={styles.suggestionsSection}>
              <SuggestedPractice 
                suggestions={suggestions ?? []} 
                loading={suggestions === undefined}
              />
            </section>
            
            <section>
              <h2 className={styles.sectionTitle}>Your Progress</h2>
              <SkillRadar data={radarData} />
            </section>
          </>
        )}
      </main>

      {/* Goal Celebration Toast */}
      {showGoalCelebration && (
        <div className={styles.celebrationToast}>
          <span className={styles.celebrationEmoji}>🎉</span>
          <span className={styles.celebrationText}>Weekly goal achieved!</span>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

