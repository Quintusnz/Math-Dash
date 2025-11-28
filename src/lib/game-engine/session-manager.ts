import { db, GameSession, Achievement } from "@/lib/db";
import { SyncManager } from "@/lib/sync/sync-manager";
import { EngagementManager } from "./engagement-manager";

export interface SessionConfig {
  operations: string[];
  selectedNumbers: number[];
  difficulty: string;
  inputMethod: string;
  targetDuration?: number;
  targetQuestions?: number;
}

export async function saveGameSession(stats: {
  sessionId?: string;
  profileId?: string;
  score: number;
  questionsAnswered: number;
  questionsCorrect: number;
  mode: string;
  durationSeconds?: number;
  // New fields for proper tracking
  topicId?: string;
  config?: SessionConfig;
  totalResponseTimeMs?: number;
}): Promise<{ session: GameSession, newAchievements: Achievement[] }> {
  
  const duration = stats.durationSeconds || 60;
  
  // Calculate metrics
  const accuracyPercent = stats.questionsAnswered > 0 
    ? Math.round((stats.questionsCorrect / stats.questionsAnswered) * 100) 
    : 0;
  const avgResponseTimeMs = stats.totalResponseTimeMs && stats.questionsAnswered > 0
    ? Math.round(stats.totalResponseTimeMs / stats.questionsAnswered)
    : undefined;

  // Derive topicId from config if not provided
  let topicId = stats.topicId || 'mixed';
  if (!stats.topicId && stats.config?.operations?.length === 1) {
    const op = stats.config.operations[0];
    const nums = stats.config.selectedNumbers;
    if (nums && nums.length > 0 && nums.length <= 3) {
      topicId = `${op}-${nums.join('-')}`;
    } else {
      topicId = op;
    }
  }

  const session: GameSession = {
    id: stats.sessionId || crypto.randomUUID(),
    profileId: stats.profileId || 'guest',
    topicId,
    mode: stats.mode,
    startedAt: new Date(Date.now() - (duration * 1000)).toISOString(),
    endedAt: new Date().toISOString(),
    score: stats.score,
    questionsAnswered: stats.questionsAnswered,
    questionsCorrect: stats.questionsCorrect,
    isCompleted: true,
    synced: 0,
    config: stats.config,
    accuracyPercent,
    avgResponseTimeMs
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
