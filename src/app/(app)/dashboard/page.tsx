"use client";

import { useState } from "react";
import { ProfileSwitcher } from "@/components/features/profiles/ProfileSwitcher";
import { ProfileCreator } from "@/components/features/profiles/ProfileCreator";
import { useUserStore } from "@/lib/stores/useUserStore";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { MasteryTracker } from "@/lib/game-engine/mastery-tracker";
import Link from "next/link";
import dynamic from "next/dynamic";
import styles from './page.module.css';

const SkillRadar = dynamic(
  () => import("@/components/features/analytics/SkillRadar").then((mod) => mod.SkillRadar),
  { 
    loading: () => <div className={styles.loadingPlaceholder} />,
    ssr: false 
  }
);

export default function DashboardPage() {
  const [isCreating, setIsCreating] = useState(false);

  const { activeProfileId } = useUserStore();
  
  const activeProfile = useLiveQuery(
    async () => activeProfileId ? await db.profiles.get(activeProfileId) : null,
    [activeProfileId]
  );

  const radarData = useLiveQuery(
    async () => activeProfileId ? await MasteryTracker.getRadarData(activeProfileId) : undefined,
    [activeProfileId]
  );

  if (isCreating) {
    return (
      <div className={styles.container}>
        <button 
          onClick={() => setIsCreating(false)}
          className={styles.backButton}
        >
          ← Back
        </button>
        <ProfileCreator onCreated={() => setIsCreating(false)} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Math Dash</h1>
        {activeProfile && (
          <div className={styles.userControls}>
            <span className={styles.greeting}>Hi, {activeProfile.displayName}!</span>
            <div className={styles.actionButtons}>
              <Link 
                href="/play" 
                className={styles.buttonPrimary}
              >
                Solo Dash
              </Link>
              <Link 
                href="/play/duel" 
                className={styles.buttonSecondary}
              >
                Duel Mode
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className={styles.mainGrid}>
        <section>
          <h2 className={styles.sectionTitle}>Profiles</h2>
          <ProfileSwitcher onCreateNew={() => setIsCreating(true)} />
        </section>

        {activeProfile && (
          <section>
             <h2 className={styles.sectionTitle}>Your Progress</h2>
             <SkillRadar data={radarData} />
          </section>
        )}
      </main>
    </div>
  );
}

