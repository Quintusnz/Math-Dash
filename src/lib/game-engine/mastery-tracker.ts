import { db, MasteryRecord } from '../db';
import { Question, TopicType, Operation } from '../stores/useGameStore';

/**
 * Maps special topics to their underlying operation for database storage
 * Special topics are stored as 'addition' since they're variations of addition/complement finding
 */
function getOperationForStorage(topicType: TopicType): Operation {
  switch (topicType) {
    case 'addition':
    case 'subtraction':
    case 'multiplication':
    case 'division':
      return topicType;
    case 'number-bonds-10':
    case 'number-bonds-20':
    case 'number-bonds-50':
    case 'number-bonds-100':
    case 'doubles':
      return 'addition';
    case 'halves':
      return 'division';
    case 'squares':
      return 'multiplication';
    default:
      return 'addition';
  }
}

export class MasteryTracker {
  
  static async recordAttempt(
    profileId: string, 
    sessionId: string,
    question: Question, 
    isCorrect: boolean, 
    timeMs: number,
    givenAnswer?: number
  ) {
    const operation = getOperationForStorage(question.type);
    
    // 1. Log the raw attempt with the actual answer given
    await db.attempts.add({
      sessionId,
      questionId: question.id,
      fact: question.fact,
      operation,
      isCorrect,
      responseTimeMs: timeMs,
      timestamp: new Date().toISOString(),
      givenAnswer
    });

    // 2. Update the aggregated mastery record
    // We use a compound index or just filter in memory if needed, but [profileId+fact] is best.
    // Since we added [profileId+fact] index in db/index.ts, we can use it.
    
    const existing = await db.mastery
      .where({ profileId: profileId, fact: question.fact })
      .first();
    
    if (existing) {
      const newAttempts = existing.attempts + 1;
      const newCorrect = existing.correct + (isCorrect ? 1 : 0);
      // Simple moving average for response time
      const newAvgTime = ((existing.avgResponseTime * existing.attempts) + timeMs) / newAttempts;
      
      // Update status/weight logic
      let status = existing.status;
      let weight = existing.weight;
      
      // Logic: If correct and fast, reduce weight (mastered). If wrong, increase weight (needs practice).
      if (isCorrect) {
        if (newAttempts > 3 && newAvgTime < 3000) {
           status = 'mastered';
           weight = Math.max(1, weight - 2); 
        } else {
           weight = Math.max(1, weight - 1);
        }
      } else {
         status = 'learning';
         weight = Math.min(existing.weight + 3, 20); // Cap weight at 20
      }

      await db.mastery.update(existing.id!, {
        attempts: newAttempts,
        correct: newCorrect,
        avgResponseTime: newAvgTime,
        lastAttemptAt: new Date().toISOString(),
        status,
        weight
      });
    } else {
      await db.mastery.add({
        profileId,
        fact: question.fact,
        operation,
        attempts: 1,
        correct: isCorrect ? 1 : 0,
        avgResponseTime: timeMs,
        lastAttemptAt: new Date().toISOString(),
        status: 'learning',
        weight: isCorrect ? 5 : 10 // Start with high weight if wrong
      });
    }
  }

  static async getWeakFacts(profileId: string, limit = 5): Promise<MasteryRecord[]> {
    // Get items with high weight
    return db.mastery
      .where('profileId').equals(profileId)
      .filter(r => r.weight >= 7) // Threshold for "weak"
      .limit(limit)
      .toArray();
  }
  
  static async getMasteryStats(profileId: string) {
    const all = await db.mastery.where('profileId').equals(profileId).toArray();
    return {
      totalMastered: all.filter(r => r.status === 'mastered').length,
      totalLearning: all.filter(r => r.status === 'learning').length,
      weakestOperation: this.calculateWeakestOperation(all)
    };
  }

  static async getRadarData(profileId: string, startDate?: Date) {
    const all = await db.mastery.where('profileId').equals(profileId).toArray();
    const filtered = startDate
      ? all.filter((r) => !r.lastAttemptAt || new Date(r.lastAttemptAt) >= startDate)
      : all;
    
    const ops = ['addition', 'subtraction', 'multiplication', 'division'];
    const data = ops.map(op => {
      const records = filtered.filter(r => r.operation === op);
      if (records.length === 0) return { subject: op.charAt(0).toUpperCase() + op.slice(1), score: 0, fullMark: 100 };
      
      const totalAttempts = records.reduce((sum, r) => sum + r.attempts, 0);
      const totalCorrect = records.reduce((sum, r) => sum + r.correct, 0);
      const score = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
      
      return { subject: op.charAt(0).toUpperCase() + op.slice(1), score, fullMark: 100 };
    });

    // Calculate Global Accuracy
    const totalAttempts = filtered.reduce((sum, r) => sum + r.attempts, 0);
    const totalCorrect = filtered.reduce((sum, r) => sum + r.correct, 0);
    const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    data.push({ subject: 'Accuracy', score: accuracy, fullMark: 100 });

    // Calculate Speed Score (Arbitrary mapping: <1s = 100, >5s = 0)
    const avgTime = filtered.length > 0 
      ? filtered.reduce((sum, r) => sum + r.avgResponseTime, 0) / filtered.length 
      : 5000;
    
    // Map 1000ms -> 100, 5000ms -> 0
    let speedScore = 0;
    if (avgTime <= 1000) speedScore = 100;
    else if (avgTime >= 5000) speedScore = 0;
    else speedScore = Math.round(100 - ((avgTime - 1000) / 4000) * 100);

    data.push({ subject: 'Speed', score: speedScore, fullMark: 100 });

    return data;
  }

  private static calculateWeakestOperation(records: MasteryRecord[]) {
    const ops: Record<string, { total: number, correct: number }> = {};
    
    records.forEach(r => {
      if (!ops[r.operation]) ops[r.operation] = { total: 0, correct: 0 };
      ops[r.operation].total += r.attempts;
      ops[r.operation].correct += r.correct;
    });

    let weakest = null;
    let minRate = 1.1;

    Object.entries(ops).forEach(([op, stats]) => {
      const rate = stats.correct / stats.total;
      if (rate < minRate) {
        minRate = rate;
        weakest = op;
      }
    });

    return weakest;
  }
}
