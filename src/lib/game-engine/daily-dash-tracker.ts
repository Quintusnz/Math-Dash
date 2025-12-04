import { db, DailyDash, MasteryRecord } from '../db';
import { Operation, NumberRange, NUMBER_RANGE_PRESETS, RangePreset } from '../stores/useGameStore';
import { getTodayDate, getCurrentWeekStart } from './weekly-goal-tracker';
import { MasteryTracker } from './mastery-tracker';

/**
 * Daily Dash Tracker
 * 
 * Generates and manages daily practice challenges:
 * - Rule-based topic selection (not AI)
 * - Prioritizes weak facts and unrecent operations
 * - Ensures variety across operations
 * - Tracks completion and integrates with weekly goals
 */

export interface DailyDashConfig {
  operations: Operation[];
  selectedNumbers: number[];
  numberRange: NumberRange;
  focusFacts: string[];
}

// Default configuration for number range
const DEFAULT_NUMBER_RANGE: NumberRange = {
  preset: 'starter',
  min: 0,
  max: 10,
  rangeType: 'operand',
  allowNegatives: false,
};

export class DailyDashTracker {
  
  /**
   * Get or generate today's Daily Dash for a profile
   */
  static async getTodaysDash(profileId: string): Promise<DailyDash> {
    const today = getTodayDate();
    
    try {
      // Check if we already have a dash for today using compound index
      const existing = await db.dailyDash
        .where('[profileId+date]')
        .equals([profileId, today])
        .first();
      
      if (existing) {
        return existing;
      }
      
      // Generate a new daily dash
      return await this.generateDailyDash(profileId);
    } catch (error) {
      console.error('Error fetching daily dash:', error);
      // Fallback: generate a new one
      return await this.generateDailyDash(profileId);
    }
  }

  /**
   * Generate a new Daily Dash based on profile's history and weak areas
   */
  static async generateDailyDash(profileId: string): Promise<DailyDash> {
    const today = getTodayDate();
    
    // 1. Get mastery data to find weak areas
    const masteryRecords = await db.mastery
      .where('profileId')
      .equals(profileId)
      .toArray();
    
    // 2. Get recent sessions to find unrecent operations
    const recentSessions = await db.sessions
      .where('profileId')
      .equals(profileId)
      .reverse()
      .limit(10)
      .toArray();
    
    // 3. Analyze and select operations
    const selectedOperations = this.selectOperations(masteryRecords, recentSessions);
    
    // 4. Select numbers/range based on operations
    const { selectedNumbers, numberRangePreset } = this.selectNumbersAndRange(
      selectedOperations, 
      masteryRecords
    );
    
    // 5. Get focus facts (weak facts for these operations)
    const focusFacts = await this.getFocusFacts(profileId, selectedOperations);
    
    // 6. Create and save the daily dash
    const dailyDash: DailyDash = {
      profileId,
      date: today,
      operations: selectedOperations,
      selectedNumbers,
      numberRangePreset,
      focusFacts,
      completed: false,
    };
    
    const id = await db.dailyDash.add(dailyDash);
    return { ...dailyDash, id };
  }

  /**
   * Select operations based on mastery data and recent activity
   * Prioritizes: weak operations, then unrecent operations, then variety
   */
  private static selectOperations(
    masteryRecords: MasteryRecord[],
    recentSessions: { config?: { operations: string[] } }[]
  ): Operation[] {
    const allOperations: Operation[] = ['addition', 'subtraction', 'multiplication', 'division'];
    
    // Calculate operation stats
    const opStats: Record<Operation, { attempts: number; correct: number; lastUsed: number }> = {
      addition: { attempts: 0, correct: 0, lastUsed: -1 },
      subtraction: { attempts: 0, correct: 0, lastUsed: -1 },
      multiplication: { attempts: 0, correct: 0, lastUsed: -1 },
      division: { attempts: 0, correct: 0, lastUsed: -1 },
    };
    
    // Aggregate mastery data
    masteryRecords.forEach(r => {
      if (r.operation in opStats) {
        opStats[r.operation].attempts += r.attempts;
        opStats[r.operation].correct += r.correct;
      }
    });
    
    // Find when each operation was last used
    recentSessions.forEach((session, idx) => {
      session.config?.operations?.forEach(op => {
        if (op in opStats && opStats[op as Operation].lastUsed === -1) {
          opStats[op as Operation].lastUsed = idx;
        }
      });
    });
    
    // Score each operation (lower = should prioritize)
    // Factors: accuracy (lower is worse), recency (not used recently = prioritize)
    const scored = allOperations.map(op => {
      const stats = opStats[op];
      const accuracy = stats.attempts > 0 ? stats.correct / stats.attempts : 0.5;
      const recencyPenalty = stats.lastUsed === -1 ? 0 : stats.lastUsed * 0.05; // More recent = higher penalty
      const experienceFactor = stats.attempts < 10 ? 0.2 : 0; // Bonus for operations with little practice
      
      // Score: lower accuracy = lower score, not recent = lower score
      const score = accuracy - recencyPenalty - experienceFactor;
      
      return { op, score, accuracy, attempts: stats.attempts };
    });
    
    // Sort by score (ascending = worst first)
    scored.sort((a, b) => a.score - b.score);
    
    // Select 1-2 operations based on variety
    // If user has very weak areas (accuracy < 60%), focus on 1 operation
    // Otherwise, pick 2 for variety
    const weakOps = scored.filter(s => s.accuracy < 0.6 && s.attempts >= 5);
    
    if (weakOps.length > 0) {
      // Focus on 1-2 weak operations
      return weakOps.slice(0, 2).map(s => s.op);
    }
    
    // Otherwise, pick 2 operations prioritizing less practiced
    return scored.slice(0, 2).map(s => s.op);
  }

  /**
   * Select appropriate numbers or number range based on operations
   */
  private static selectNumbersAndRange(
    operations: Operation[],
    masteryRecords: MasteryRecord[]
  ): { selectedNumbers: number[]; numberRangePreset: string } {
    // Check if we're doing mult/div (need selected numbers) or add/sub (need range)
    const hasMultDiv = operations.some(op => op === 'multiplication' || op === 'division');
    const hasAddSub = operations.some(op => op === 'addition' || op === 'subtraction');
    
    let selectedNumbers: number[] = [];
    let numberRangePreset: RangePreset = 'starter';
    
    if (hasMultDiv) {
      // Find weak times tables
      const multDivRecords = masteryRecords.filter(
        r => r.operation === 'multiplication' || r.operation === 'division'
      );
      
      // Extract numbers from facts (e.g., "7×8" -> [7, 8])
      const numberCounts: Record<number, { attempts: number; correct: number }> = {};
      
      multDivRecords.forEach(r => {
        const match = r.fact.match(/(\d+)[×÷](\d+)/);
        if (match) {
          [parseInt(match[1]), parseInt(match[2])].forEach(num => {
            if (num >= 1 && num <= 12) {
              if (!numberCounts[num]) numberCounts[num] = { attempts: 0, correct: 0 };
              numberCounts[num].attempts += r.attempts;
              numberCounts[num].correct += r.correct;
            }
          });
        }
      });
      
      // Select 2-3 numbers with lowest accuracy (or least practiced)
      const numbered = Object.entries(numberCounts).map(([n, stats]) => ({
        num: parseInt(n),
        accuracy: stats.attempts > 0 ? stats.correct / stats.attempts : 0.5,
        attempts: stats.attempts,
      }));
      
      numbered.sort((a, b) => {
        // Prioritize low accuracy, then low attempts
        if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
        return a.attempts - b.attempts;
      });
      
      if (numbered.length >= 2) {
        selectedNumbers = numbered.slice(0, 3).map(n => n.num);
      } else {
        // Default to common trouble tables
        selectedNumbers = [6, 7, 8];
      }
    }
    
    if (hasAddSub) {
      // Determine appropriate range based on mastery
      const addSubRecords = masteryRecords.filter(
        r => r.operation === 'addition' || r.operation === 'subtraction'
      );
      
      const totalAttempts = addSubRecords.reduce((sum, r) => sum + r.attempts, 0);
      const totalCorrect = addSubRecords.reduce((sum, r) => sum + r.correct, 0);
      const accuracy = totalAttempts > 0 ? totalCorrect / totalAttempts : 0.5;
      
      // Progress through ranges based on experience and accuracy
      if (totalAttempts < 30 || accuracy < 0.6) {
        numberRangePreset = 'starter'; // 0-10
      } else if (totalAttempts < 100 || accuracy < 0.75) {
        numberRangePreset = 'builder'; // 0-20
      } else if (accuracy < 0.85) {
        numberRangePreset = 'challenge'; // 0-50
      } else {
        numberRangePreset = 'pro'; // 0-100
      }
    }
    
    return { selectedNumbers, numberRangePreset };
  }

  /**
   * Get weak facts to focus on during this daily dash
   */
  private static async getFocusFacts(
    profileId: string,
    operations: Operation[]
  ): Promise<string[]> {
    const weakFacts = await MasteryTracker.getWeakFacts(profileId, 10);
    
    // Filter to facts matching selected operations
    const relevantFacts = weakFacts.filter(f => operations.includes(f.operation));
    
    return relevantFacts.slice(0, 5).map(f => f.fact);
  }

  /**
   * Mark today's Daily Dash as completed
   */
  static async completeDailyDash(
    profileId: string,
    sessionId: string,
    score: number
  ): Promise<DailyDash | null> {
    const today = getTodayDate();
    
    const existing = await db.dailyDash
      .where('[profileId+date]')
      .equals([profileId, today])
      .first();
    
    if (!existing || existing.completed) {
      return existing || null;
    }
    
    await db.dailyDash.update(existing.id!, {
      completed: true,
      completedAt: new Date().toISOString(),
      sessionId,
      score,
    });
    
    return { ...existing, completed: true, completedAt: new Date().toISOString(), sessionId, score };
  }

  /**
   * Check if today's Daily Dash is completed
   */
  static async isCompletedToday(profileId: string): Promise<boolean> {
    const today = getTodayDate();
    
    const existing = await db.dailyDash
      .where('[profileId+date]')
      .equals([profileId, today])
      .first();
    
    return existing?.completed ?? false;
  }

  /**
   * Get the game configuration for a Daily Dash
   */
  static getDashConfig(dailyDash: DailyDash): DailyDashConfig {
    const hasMultDiv = dailyDash.operations.some(
      op => op === 'multiplication' || op === 'division'
    );
    
    // Build number range from preset
    const presetKey = dailyDash.numberRangePreset as Exclude<RangePreset, 'custom'>;
    const preset = NUMBER_RANGE_PRESETS[presetKey] ?? NUMBER_RANGE_PRESETS.starter;
    
    const numberRange: NumberRange = {
      preset: presetKey,
      min: preset.min,
      max: preset.max,
      rangeType: 'operand',
      allowNegatives: false,
    };
    
    return {
      operations: dailyDash.operations,
      selectedNumbers: hasMultDiv ? dailyDash.selectedNumbers : [],
      numberRange,
      focusFacts: dailyDash.focusFacts,
    };
  }

  /**
   * Get streak of consecutive days with completed Daily Dash
   */
  static async getDailyDashStreak(profileId: string): Promise<number> {
    const dashes = await db.dailyDash
      .where('profileId')
      .equals(profileId)
      .filter(d => d.completed)
      .reverse()
      .toArray();
    
    if (dashes.length === 0) return 0;
    
    // Sort by date descending
    dashes.sort((a, b) => b.date.localeCompare(a.date));
    
    // Check if today or yesterday is completed (streak must be recent)
    const today = getTodayDate();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (dashes[0].date !== today && dashes[0].date !== yesterdayStr) {
      return 0; // Streak broken
    }
    
    // Count consecutive days
    let streak = 1;
    for (let i = 1; i < dashes.length; i++) {
      const prevDate = new Date(dashes[i - 1].date);
      const currDate = new Date(dashes[i].date);
      
      // Check if dates are consecutive
      const diffDays = Math.round((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  /**
   * Get a human-readable description of today's dash
   */
  static getDashDescription(dailyDash: DailyDash): string {
    const opNames: Record<Operation, string> = {
      addition: 'Addition',
      subtraction: 'Subtraction',
      multiplication: 'Times Tables',
      division: 'Division',
    };
    
    const ops = dailyDash.operations.map(op => opNames[op]);
    
    if (ops.length === 1) {
      return ops[0];
    }
    
    return ops.join(' & ');
  }

  /**
   * Get detailed info for display on the dashboard card
   */
  static getDashDisplayInfo(dailyDash: DailyDash): {
    title: string;
    subtitle: string;
    emoji: string;
    details: string[];
  } {
    const hasMultDiv = dailyDash.operations.some(
      op => op === 'multiplication' || op === 'division'
    );
    
    const opEmojis: Record<Operation, string> = {
      addition: '➕',
      subtraction: '➖',
      multiplication: '✖️',
      division: '➗',
    };
    
    const emoji = opEmojis[dailyDash.operations[0]] || '🔢';
    const title = this.getDashDescription(dailyDash);
    
    const details: string[] = [];
    
    if (hasMultDiv && dailyDash.selectedNumbers.length > 0) {
      details.push(`Tables: ${dailyDash.selectedNumbers.join(', ')}`);
    }
    
    if (!hasMultDiv) {
      const presetKey = dailyDash.numberRangePreset as keyof typeof NUMBER_RANGE_PRESETS;
      const preset = NUMBER_RANGE_PRESETS[presetKey];
      if (preset) {
        details.push(`Numbers: ${preset.min}-${preset.max}`);
      }
    }
    
    if (dailyDash.focusFacts.length > 0) {
      details.push(`Focus: ${dailyDash.focusFacts.length} weak facts`);
    }
    
    const subtitle = dailyDash.completed 
      ? `Score: ${dailyDash.score ?? 0} points` 
      : 'Ready for today\'s challenge!';
    
    return { title, subtitle, emoji, details };
  }
}
