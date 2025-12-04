import { db, Profile, Achievement } from '../db';

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  // ==================== MILESTONE ACHIEVEMENTS ====================
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Complete your first session',
    category: 'milestone',
    icon: '🏁',
    condition: { type: 'TOTAL_SESSIONS', value: 1 }
  },
  {
    id: 'getting_started',
    title: 'Getting Started',
    description: 'Complete 10 sessions',
    category: 'milestone',
    icon: '🌱',
    condition: { type: 'TOTAL_SESSIONS', value: 10 },
    progressTrackable: true
  },
  {
    id: 'dedicated_learner',
    title: 'Dedicated Learner',
    description: 'Complete 50 sessions',
    category: 'milestone',
    icon: '📚',
    condition: { type: 'TOTAL_SESSIONS', value: 50 },
    progressTrackable: true
  },
  {
    id: 'math_explorer',
    title: 'Math Explorer',
    description: 'Complete 100 sessions',
    category: 'milestone',
    icon: '🧭',
    condition: { type: 'TOTAL_SESSIONS', value: 100 },
    progressTrackable: true
  },

  // ==================== VOLUME ACHIEVEMENTS ====================
  {
    id: 'high_five',
    title: 'High Five',
    description: 'Answer 50 questions correctly',
    category: 'volume',
    icon: '🖐️',
    condition: { type: 'TOTAL_CORRECT', value: 50 },
    progressTrackable: true
  },
  {
    id: 'century_club',
    title: 'Century Club',
    description: 'Answer 100 questions correctly',
    category: 'volume',
    icon: '💯',
    condition: { type: 'TOTAL_CORRECT', value: 100 },
    progressTrackable: true
  },
  {
    id: 'five_hundred',
    title: 'High Fiver',
    description: 'Answer 500 questions correctly',
    category: 'volume',
    icon: '🎯',
    condition: { type: 'TOTAL_CORRECT', value: 500 },
    progressTrackable: true
  },
  {
    id: 'thousand_club',
    title: 'Thousand Club',
    description: 'Answer 1,000 questions correctly',
    category: 'volume',
    icon: '🏆',
    condition: { type: 'TOTAL_CORRECT', value: 1000 },
    progressTrackable: true
  },

  // ==================== STREAK ACHIEVEMENTS ====================
  {
    id: 'streak_3',
    title: 'Hat Trick',
    description: 'Play for 3 days in a row',
    category: 'streak',
    icon: '🔥',
    condition: { type: 'STREAK', value: 3 },
    progressTrackable: true
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Play for 7 days in a row',
    category: 'streak',
    icon: '📅',
    condition: { type: 'STREAK', value: 7 },
    progressTrackable: true
  },
  {
    id: 'streak_14',
    title: 'Fortnight Fighter',
    description: 'Play for 14 days in a row',
    category: 'streak',
    icon: '⚔️',
    condition: { type: 'STREAK', value: 14 },
    progressTrackable: true
  },
  {
    id: 'streak_30',
    title: 'Monthly Master',
    description: 'Play for 30 days in a row',
    category: 'streak',
    icon: '🌟',
    condition: { type: 'STREAK', value: 30 },
    progressTrackable: true
  },

  // ==================== SPEED ACHIEVEMENTS ====================
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Answer 20 questions per minute',
    category: 'speed',
    icon: '⚡',
    condition: { type: 'SPEED_RPM', value: 20 }
  },
  {
    id: 'lightning_fast',
    title: 'Lightning Fast',
    description: 'Answer 30 questions per minute',
    category: 'speed',
    icon: '🌩️',
    condition: { type: 'SPEED_RPM', value: 30 }
  },
  {
    id: 'supersonic',
    title: 'Supersonic',
    description: 'Answer 40 questions per minute',
    category: 'speed',
    icon: '🚀',
    condition: { type: 'SPEED_RPM', value: 40 }
  },

  // ==================== ACCURACY ACHIEVEMENTS ====================
  {
    id: 'sharp_shooter',
    title: 'Sharp Shooter',
    description: 'Complete a session with 100% accuracy',
    category: 'accuracy',
    icon: '🎯',
    condition: { type: 'PERFECT_SESSION', value: 1 }
  },
  {
    id: 'precision_player',
    title: 'Precision Player',
    description: 'Complete 5 sessions with 100% accuracy',
    category: 'accuracy',
    icon: '💎',
    condition: { type: 'PERFECT_SESSION', value: 5 },
    progressTrackable: true
  },
  {
    id: 'flawless',
    title: 'Flawless',
    description: 'Complete 10 sessions with 100% accuracy',
    category: 'accuracy',
    icon: '✨',
    condition: { type: 'PERFECT_SESSION', value: 10 },
    progressTrackable: true
  },

  // ==================== MASTERY ACHIEVEMENTS ====================
  {
    id: 'fact_finder',
    title: 'Fact Finder',
    description: 'Master your first math fact',
    category: 'mastery',
    icon: '🔍',
    condition: { type: 'MASTERY_COUNT', value: 1 }
  },
  {
    id: 'fact_collector',
    title: 'Fact Collector',
    description: 'Master 10 math facts',
    category: 'mastery',
    icon: '📦',
    condition: { type: 'MASTERY_COUNT', value: 10 },
    progressTrackable: true
  },
  {
    id: 'fact_master',
    title: 'Fact Master',
    description: 'Master 50 math facts',
    category: 'mastery',
    icon: '🧠',
    condition: { type: 'MASTERY_COUNT', value: 50 },
    progressTrackable: true
  },
  {
    id: 'math_wizard',
    title: 'Math Wizard',
    description: 'Master 100 math facts',
    category: 'mastery',
    icon: '🧙',
    condition: { type: 'MASTERY_COUNT', value: 100 },
    progressTrackable: true
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

    // Get mastery count for mastery achievements
    const masteredFacts = await db.mastery
      .where('profileId').equals(profileId)
      .filter(m => m.status === 'mastered')
      .count();

    // Get perfect sessions count for accuracy achievements
    const perfectSessions = await db.sessions
      .where('profileId').equals(profileId)
      .filter(s => s.isCompleted && s.questionsCorrect === s.questionsAnswered && s.questionsAnswered > 0)
      .count();

    // Check if this session was perfect
    const isCurrentSessionPerfect = sessionStats.correct === sessionStats.total && sessionStats.total > 0;

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
        case 'PERFECT_SESSION':
          // Count includes current session if perfect
          const totalPerfect = perfectSessions + (isCurrentSessionPerfect ? 1 : 0);
          isMet = totalPerfect >= value;
          break;
        case 'MASTERY_COUNT':
          isMet = masteredFacts >= value;
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

  /**
   * Get progress data for all achievements for a given profile.
   * Returns current progress toward each achievement's condition.
   */
  static async getAchievementProgress(profileId: string): Promise<Map<string, number>> {
    const profile = await db.profiles.get(profileId);
    const progressMap = new Map<string, number>();

    if (!profile) return progressMap;

    const stats = profile.stats || { totalQuestions: 0, totalCorrect: 0, totalSessions: 0 };
    const streak = profile.streak || { current: 0, best: 0, lastActiveDate: '' };

    // Get mastery count
    const masteredFacts = await db.mastery
      .where('profileId').equals(profileId)
      .filter(m => m.status === 'mastered')
      .count();

    // Get perfect sessions count
    const perfectSessions = await db.sessions
      .where('profileId').equals(profileId)
      .filter(s => s.isCompleted && s.questionsCorrect === s.questionsAnswered && s.questionsAnswered > 0)
      .count();

    // Map progress for each condition type
    const allAchievements = await db.achievements.toArray();
    
    for (const achievement of allAchievements) {
      const { type } = achievement.condition;
      let progress = 0;

      switch (type) {
        case 'TOTAL_SESSIONS':
          progress = stats.totalSessions;
          break;
        case 'TOTAL_CORRECT':
          progress = stats.totalCorrect;
          break;
        case 'STREAK':
          progress = Math.max(streak.current, streak.best);
          break;
        case 'PERFECT_SESSION':
          progress = perfectSessions;
          break;
        case 'MASTERY_COUNT':
          progress = masteredFacts;
          break;
        // Speed achievements don't have trackable progress
        case 'SPEED_RPM':
          progress = 0;
          break;
      }

      progressMap.set(achievement.id, progress);
    }

    return progressMap;
  }
}
