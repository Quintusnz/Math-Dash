"use client";

import Link from "next/link";
import { useProfileStore } from "@/lib/stores/useProfileStore";
import { AuthGuard } from "@/components/features/auth";
import { AchievementGallery } from "@/components/features/engagement";
import { ArrowLeft } from "lucide-react";
import styles from "./page.module.css";

function AchievementsContent() {
  const { activeProfile } = useProfileStore();

  if (!activeProfile) {
    return null;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.backButton} aria-label="Back to dashboard">
          <ArrowLeft size={20} />
          <span>Back</span>
        </Link>
        <h1 className={styles.title}>Achievements</h1>
      </header>

      <main className={styles.main}>
        <AchievementGallery profileId={activeProfile.id} />
      </main>
    </div>
  );
}

export default function AchievementsPage() {
  return (
    <AuthGuard>
      <AchievementsContent />
    </AuthGuard>
  );
}
