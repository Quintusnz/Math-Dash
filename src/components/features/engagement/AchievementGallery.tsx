"use client";

import { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Achievement, PlayerAchievement } from "@/lib/db";
import { EngagementManager } from "@/lib/game-engine/engagement-manager";
import styles from "./AchievementGallery.module.css";

type AchievementCategory = Achievement["category"] | "all";

interface AchievementWithStatus extends Achievement {
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number;
}

interface AchievementGalleryProps {
  profileId: string;
}

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  all: "All",
  milestone: "Milestones",
  volume: "Volume",
  streak: "Streaks",
  speed: "Speed",
  accuracy: "Accuracy",
  mastery: "Mastery",
};

const CATEGORY_ORDER: AchievementCategory[] = [
  "all",
  "milestone",
  "volume",
  "streak",
  "speed",
  "accuracy",
  "mastery",
];

export function AchievementGallery({ profileId }: AchievementGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory>("all");

  // Fetch all achievements
  const allAchievements = useLiveQuery(() => db.achievements.toArray(), []);

  // Fetch player's unlocked achievements
  const playerAchievements = useLiveQuery(
    () =>
      db.playerAchievements
        .where("profileId")
        .equals(profileId)
        .toArray(),
    [profileId]
  );

  // Fetch progress data
  const progressData = useLiveQuery(
    async () => {
      const progressMap = await EngagementManager.getAchievementProgress(profileId);
      return progressMap;
    },
    [profileId]
  );

  // Combine achievements with unlock status and progress
  const achievementsWithStatus: AchievementWithStatus[] = useMemo(() => {
    if (!allAchievements || !playerAchievements) return [];

    const unlockedMap = new Map<string, PlayerAchievement>();
    playerAchievements.forEach((pa) => unlockedMap.set(pa.achievementId, pa));

    return allAchievements.map((achievement) => {
      const unlock = unlockedMap.get(achievement.id);
      const progress = progressData?.get(achievement.id) ?? 0;

      return {
        ...achievement,
        isUnlocked: !!unlock,
        unlockedAt: unlock?.unlockedAt,
        progress,
      };
    });
  }, [allAchievements, playerAchievements, progressData]);

  // Filter by selected category
  const filteredAchievements = useMemo(() => {
    if (selectedCategory === "all") {
      return achievementsWithStatus;
    }
    return achievementsWithStatus.filter((a) => a.category === selectedCategory);
  }, [achievementsWithStatus, selectedCategory]);

  // Count achievements per category
  const categoryCounts = useMemo(() => {
    const counts: Record<AchievementCategory, { total: number; unlocked: number }> = {
      all: { total: 0, unlocked: 0 },
      milestone: { total: 0, unlocked: 0 },
      volume: { total: 0, unlocked: 0 },
      streak: { total: 0, unlocked: 0 },
      speed: { total: 0, unlocked: 0 },
      accuracy: { total: 0, unlocked: 0 },
      mastery: { total: 0, unlocked: 0 },
    };

    achievementsWithStatus.forEach((a) => {
      counts.all.total++;
      counts[a.category].total++;
      if (a.isUnlocked) {
        counts.all.unlocked++;
        counts[a.category].unlocked++;
      }
    });

    return counts;
  }, [achievementsWithStatus]);

  // Sort: unlocked first, then by progress percentage
  const sortedAchievements = useMemo(() => {
    return [...filteredAchievements].sort((a, b) => {
      // Unlocked achievements first
      if (a.isUnlocked && !b.isUnlocked) return -1;
      if (!a.isUnlocked && b.isUnlocked) return 1;
      
      // Among locked, sort by progress percentage (higher first)
      if (!a.isUnlocked && !b.isUnlocked) {
        const aProgress = a.condition.value > 0 ? a.progress / a.condition.value : 0;
        const bProgress = b.condition.value > 0 ? b.progress / b.condition.value : 0;
        return bProgress - aProgress;
      }
      
      // Among unlocked, sort by unlock date (most recent first)
      if (a.unlockedAt && b.unlockedAt) {
        return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
      }
      
      return 0;
    });
  }, [filteredAchievements]);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!allAchievements || !playerAchievements) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading achievements...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Summary */}
      <div className={styles.summary}>
        <div className={styles.summaryIcon}>🏆</div>
        <div className={styles.summaryText}>
          <span className={styles.summaryCount}>
            {categoryCounts.all.unlocked} / {categoryCounts.all.total}
          </span>
          <span className={styles.summaryLabel}>Achievements Unlocked</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className={styles.tabs} role="tablist" aria-label="Achievement categories">
        {CATEGORY_ORDER.map((category) => {
          const count = categoryCounts[category];
          return (
            <button
              key={category}
              role="tab"
              aria-selected={selectedCategory === category}
              className={`${styles.tab} ${selectedCategory === category ? styles.tabActive : ""}`}
              onClick={() => setSelectedCategory(category)}
            >
              <span className={styles.tabLabel}>{CATEGORY_LABELS[category]}</span>
              <span className={styles.tabCount}>
                {count.unlocked}/{count.total}
              </span>
            </button>
          );
        })}
      </div>

      {/* Achievement Grid */}
      <div className={styles.grid} role="tabpanel">
        {sortedAchievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            formatDate={formatDate}
          />
        ))}
      </div>

      {sortedAchievements.length === 0 && (
        <div className={styles.empty}>
          No achievements in this category yet.
        </div>
      )}
    </div>
  );
}

interface AchievementCardProps {
  achievement: AchievementWithStatus;
  formatDate: (date: string) => string;
}

function AchievementCard({ achievement, formatDate }: AchievementCardProps) {
  const { isUnlocked, unlockedAt, progress, condition, progressTrackable } = achievement;
  
  const progressPercent = condition.value > 0 
    ? Math.min(100, Math.round((progress / condition.value) * 100))
    : 0;

  const showProgress = !isUnlocked && progressTrackable && condition.value > 1;

  return (
    <div
      className={`${styles.card} ${isUnlocked ? styles.cardUnlocked : styles.cardLocked}`}
      aria-label={`${achievement.title}: ${isUnlocked ? "Unlocked" : "Locked"}`}
    >
      <div className={styles.cardIcon}>
        {isUnlocked ? (
          <span className={styles.icon} role="img" aria-hidden="true">
            {achievement.icon}
          </span>
        ) : (
          <span className={styles.iconLocked} aria-hidden="true">
            ?
          </span>
        )}
      </div>

      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>
          {isUnlocked ? achievement.title : achievement.title}
        </h3>
        <p className={styles.cardDescription}>{achievement.description}</p>

        {isUnlocked && unlockedAt && (
          <div className={styles.cardDate}>
            Earned {formatDate(unlockedAt)}
          </div>
        )}

        {showProgress && (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className={styles.progressText}>
              {progress} / {condition.value}
            </span>
          </div>
        )}
      </div>

      {isUnlocked && (
        <div className={styles.unlockedBadge} aria-hidden="true">
          ✓
        </div>
      )}
    </div>
  );
}
