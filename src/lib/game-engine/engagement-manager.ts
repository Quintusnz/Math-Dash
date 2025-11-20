import { db, Profile, Achievement } from '../db';

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Complete your first session',
    category: 'volume',
    icon: '🏁',
    condition: { type: 'TOTAL_SESSIONS', value: 1 }
  },
  {
    id: 'high_five',
    title: 'High Five',
    description: 'Answer 50 questions correctly',
    category: 'volume',
    icon: '🖐️',
    condition: { type: 'TOTAL_CORRECT', value: 50 }
  },
  {
    id: 'century_club',
    title: 'Century Club',
    description: 'Answer 100 questions correctly',
    category: 'volume',
    icon: '💯',
    condition: { type: 'TOTAL_CORRECT', value: 100 }
  },
  {
    id: 'streak_3',
    title: 'Hat Trick',
    description: 'Play for 3 days in a row',
    category: 'streak',
    icon: '🔥',
    condition: { type: 'STREAK', value: 3 }
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Play for 7 days in a row',
    category: 'streak',
    icon: '📅',
    condition: { type: 'STREAK', value: 7 }
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Answer 20 questions in 60 seconds',
    category: 'speed',
    icon: '⚡',
    condition: { type: 'SPEED_RPM', value: 20 } // RPM = Rounds Per Minute (Questions per minute)
  }
];

export class EngagementManager {
  
  static async initialize() {
    // Seed achievements if empty
    const count = await db.achievements.count();
    if (count === 0) {
      await db.achievements.bulkAdd(DEFAULT_ACHIEVEMENTS);
    }
  }

  static async updateStreak(profileId: string): Promise<boolean> {
    const profile = await db.profiles.get(profileId);
    if (!profile) return false;

    const today = new Date().toISOString().split('T')[0];
    const lastActive = profile.streak?.lastActiveDate;
    
    let currentStreak = profile.streak?.current || 0;
    let bestStreak = profile.streak?.best || 0;

    if (lastActive === today) {
      // Already played today, no streak change
      return false;
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (lastActive === yesterday) {
      // Played yesterday, increment streak
      currentStreak++;
    } else {
      // Missed a day (or first time), reset to 1
      currentStreak = 1;
    }

    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }

    await db.profiles.update(profileId, {
      streak: {
        current: currentStreak,
        best: bestStreak,
        lastActiveDate: today
      }
    });

    return true; // Streak updated
  }

  static async updateStats(profileId: string, sessionStats: { correct: number, total: number }) {
    const profile = await db.profiles.get(profileId);
    if (!profile) return;

    const currentStats = profile.stats || { totalQuestions: 0, totalCorrect: 0, totalSessions: 0 };

    await db.profiles.update(profileId, {
      stats: {
        totalQuestions: currentStats.totalQuestions + sessionStats.total,
        totalCorrect: currentStats.totalCorrect + sessionStats.correct,
        totalSessions: currentStats.totalSessions + 1
      }
    });
  }

  static async checkAchievements(profileId: string, sessionStats: { 
    correct: number, 
    total: number, 
    durationSeconds: number 
  }): Promise<Achievement[]> {
    const profile = await db.profiles.get(profileId);
    if (!profile || !profile.stats || !profile.streak) return [];

    const unlocked: Achievement[] = [];
    const allAchievements = await db.achievements.toArray();
    const existingUnlocks = await db.playerAchievements
      .where('profileId').equals(profileId)
      .toArray();
    
    const unlockedIds = new Set(existingUnlocks.map(u => u.achievementId));

    for (const achievement of allAchievements) {
      if (unlockedIds.has(achievement.id)) continue;

      let isMet = false;
      const { type, value } = achievement.condition;

      switch (type) {
        case 'TOTAL_SESSIONS':
          isMet = profile.stats.totalSessions >= value;
          break;
        case 'TOTAL_CORRECT':
          isMet = profile.stats.totalCorrect >= value;
          break;
        case 'STREAK':
          isMet = profile.streak.current >= value;
          break;
        case 'SPEED_RPM':
          // Calculate RPM for this session
          const rpm = (sessionStats.correct / sessionStats.durationSeconds) * 60;
          isMet = rpm >= value && sessionStats.durationSeconds >= 30; // Min 30s session
          break;
      }

      if (isMet) {
        await db.playerAchievements.add({
          profileId,
          achievementId: achievement.id,
          unlockedAt: new Date().toISOString(),
          synced: 0
        });
        unlocked.push(achievement);
      }
    }

    return unlocked;
  }
}
