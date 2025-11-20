import { db, GameSession, Achievement } from "@/lib/db";
import { SyncManager } from "@/lib/sync/sync-manager";
import { EngagementManager } from "./engagement-manager";

export async function saveGameSession(stats: {
  sessionId?: string;
  profileId?: string;
  score: number;
  questionsAnswered: number;
  questionsCorrect: number;
  mode: string;
  durationSeconds?: number;
}): Promise<{ session: GameSession, newAchievements: Achievement[] }> {
  
  const duration = stats.durationSeconds || 60;

  const session: GameSession = {
    id: stats.sessionId || crypto.randomUUID(),
    profileId: stats.profileId || 'guest',
    topicId: 'mixed', // TODO: Use actual topic
    mode: stats.mode,
    startedAt: new Date(Date.now() - (duration * 1000)).toISOString(),
    endedAt: new Date().toISOString(),
    score: stats.score,
    questionsAnswered: stats.questionsAnswered,
    questionsCorrect: stats.questionsCorrect,
    isCompleted: true,
    synced: 0
  };

  await db.sessions.add(session);
  
  // Queue for sync
  await SyncManager.addToQueue('SESSION_UPLOAD', session);

  let newAchievements: Achievement[] = [];

  if (stats.profileId && stats.profileId !== 'guest') {
    // 1. Update Stats
    await EngagementManager.updateStats(stats.profileId, {
      correct: stats.questionsCorrect,
      total: stats.questionsAnswered
    });

    // 2. Update Streak
    await EngagementManager.updateStreak(stats.profileId);

    // 3. Check Achievements
    newAchievements = await EngagementManager.checkAchievements(stats.profileId, {
      correct: stats.questionsCorrect,
      total: stats.questionsAnswered,
      durationSeconds: duration
    });
  }
  
  return { session, newAchievements };
}
