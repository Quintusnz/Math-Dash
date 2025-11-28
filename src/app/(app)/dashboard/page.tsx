"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProfileStore } from "@/lib/stores/useProfileStore";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { MasteryTracker } from "@/lib/game-engine/mastery-tracker";
import { WeeklyGoalTracker } from "@/lib/game-engine/weekly-goal-tracker";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AuthGuard, PlayCodeDisplay } from "@/components/features/auth";
import { StreakDisplay, WeeklyGoalDisplay } from "@/components/features/engagement";
import { Settings, LogOut } from "lucide-react";
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

  const handleGoalComplete = useCallback(() => {
    setShowGoalCelebration(true);
    // Auto-dismiss after 3 seconds
    setTimeout(() => setShowGoalCelebration(false), 3000);
  }, []);

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
          <div className={styles.profileBanner}>
            <div className={styles.profileInfo}>
              <span className={styles.avatar}>{activeProfile.avatarId}</span>
              <div className={styles.profileText}>
                <span className={styles.greeting}>Hi, {activeProfile.displayName}!</span>
                {activeProfile.playCode && (
                  <PlayCodeDisplay code={activeProfile.playCode} compact />
                )}
              </div>
            </div>
            <div className={styles.actionButtons}>
              <Link 
                href="/play" 
                className={styles.buttonPrimary}
              >
                🚀 Solo Dash
              </Link>
              <Link 
                href="/play/duel" 
                className={styles.buttonSecondary}
              >
                ⚔️ Duel Mode
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className={styles.mainGrid}>
        {activeProfile && (
          <>
            <section className={styles.engagementSection}>
              <h2 className={styles.sectionTitle}>Your Goals</h2>
              <div className={styles.engagementCards}>
                <WeeklyGoalDisplay 
                  weeklyGoal={weeklyGoal} 
                  onGoalComplete={handleGoalComplete}
                />
                <StreakDisplay streak={activeProfile.streak} />
              </div>
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

