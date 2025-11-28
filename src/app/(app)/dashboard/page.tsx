"use client";

import { useState } from "react";
import { useProfileStore } from "@/lib/stores/useProfileStore";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { MasteryTracker } from "@/lib/game-engine/mastery-tracker";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AuthGuard, PlayCodeDisplay } from "@/components/features/auth";
import { StreakDisplay } from "@/components/features/engagement";
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
  const { activeProfile, logout, setAuthStep } = useProfileStore();
  
  const radarData = useLiveQuery(
    async () => activeProfile?.id ? await MasteryTracker.getRadarData(activeProfile.id) : undefined,
    [activeProfile?.id]
  );

  const handleSwitchProfile = () => {
    setAuthStep('profile-select');
    logout();
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
                onClick={handleSwitchProfile}
                className={styles.iconButton}
                aria-label="Switch player"
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
              <h2 className={styles.sectionTitle}>Daily Streak</h2>
              <StreakDisplay streak={activeProfile.streak} />
            </section>
            
            <section>
              <h2 className={styles.sectionTitle}>Your Progress</h2>
              <SkillRadar data={radarData} />
            </section>
          </>
        )}
      </main>
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

