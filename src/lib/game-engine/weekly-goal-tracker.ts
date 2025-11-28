import { db, Profile, WeeklyGoal } from '../db';

/**
 * Weekly Goal Tracker
 * 
 * Manages weekly goal tracking for engagement:
 * - Default target: 3 days per week
 * - Weeks reset every Monday
 * - Tracks which days the user practiced
 * - Triggers celebration when goal is achieved
 */

export const DEFAULT_WEEKLY_GOAL_TARGET = 3;

/**
 * Get the Monday of the current week (YYYY-MM-DD)
 */
export function getCurrentWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  // Sunday is 0, Monday is 1, etc. We want Monday as start
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysToSubtract);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Initialize or reset weekly goal for a profile
 */
export function createDefaultWeeklyGoal(targetDays: number = DEFAULT_WEEKLY_GOAL_TARGET): WeeklyGoal {
  return {
    targetDays,
    currentDays: 0,
    weekStart: getCurrentWeekStart(),
    practicedDates: [],
    lastCompletedWeek: undefined,
  };
}

export class WeeklyGoalTracker {
  
  /**
   * Check if the weekly goal needs to be reset (new week started)
   */
  static needsReset(weeklyGoal: WeeklyGoal | undefined): boolean {
    if (!weeklyGoal) return true;
    
    const currentWeekStart = getCurrentWeekStart();
    return weeklyGoal.weekStart !== currentWeekStart;
  }

  /**
   * Reset the weekly goal for a new week, preserving target and last completed
   */
  static resetForNewWeek(previousGoal: WeeklyGoal | undefined): WeeklyGoal {
    const targetDays = previousGoal?.targetDays ?? DEFAULT_WEEKLY_GOAL_TARGET;
    const lastCompletedWeek = previousGoal?.lastCompletedWeek;
    
    return {
      targetDays,
      currentDays: 0,
      weekStart: getCurrentWeekStart(),
      practicedDates: [],
      lastCompletedWeek,
    };
  }

  /**
   * Record a practice day for the profile.
   * Returns an object indicating if this was a new day and if the goal was just completed.
   */
  static async recordPracticeDay(profileId: string): Promise<{
    recorded: boolean;
    isNewDay: boolean;
    goalJustCompleted: boolean;
    weeklyGoal: WeeklyGoal;
  }> {
    const profile = await db.profiles.get(profileId);
    if (!profile) {
      throw new Error(`Profile not found: ${profileId}`);
    }

    const today = getTodayDate();
    let weeklyGoal = profile.weeklyGoal;
    let isNewDay = false;
    let goalJustCompleted = false;

    // Initialize or reset if needed
    if (!weeklyGoal || this.needsReset(weeklyGoal)) {
      weeklyGoal = this.resetForNewWeek(weeklyGoal);
    }

    // Check if we already recorded today
    if (!weeklyGoal.practicedDates.includes(today)) {
      isNewDay = true;
      const wasComplete = weeklyGoal.currentDays >= weeklyGoal.targetDays;
      
      weeklyGoal = {
        ...weeklyGoal,
        currentDays: weeklyGoal.currentDays + 1,
        practicedDates: [...weeklyGoal.practicedDates, today],
      };

      // Check if goal was just completed
      if (!wasComplete && weeklyGoal.currentDays >= weeklyGoal.targetDays) {
        goalJustCompleted = true;
        weeklyGoal.lastCompletedWeek = weeklyGoal.weekStart;
      }

      // Save to database
      await db.profiles.update(profileId, {
        weeklyGoal,
        updatedAt: new Date().toISOString(),
      });
    }

    return {
      recorded: true,
      isNewDay,
      goalJustCompleted,
      weeklyGoal,
    };
  }

  /**
   * Get the current weekly goal for a profile, initializing if needed
   */
  static async getWeeklyGoal(profileId: string): Promise<WeeklyGoal> {
    const profile = await db.profiles.get(profileId);
    if (!profile) {
      throw new Error(`Profile not found: ${profileId}`);
    }

    let weeklyGoal = profile.weeklyGoal;

    // Initialize or reset if needed
    if (!weeklyGoal || this.needsReset(weeklyGoal)) {
      weeklyGoal = this.resetForNewWeek(weeklyGoal);
      await db.profiles.update(profileId, {
        weeklyGoal,
        updatedAt: new Date().toISOString(),
      });
    }

    return weeklyGoal;
  }

  /**
   * Update the weekly goal target (for parent configuration)
   */
  static async updateGoalTarget(profileId: string, targetDays: number): Promise<WeeklyGoal> {
    if (targetDays < 1 || targetDays > 7) {
      throw new Error('Target days must be between 1 and 7');
    }

    const profile = await db.profiles.get(profileId);
    if (!profile) {
      throw new Error(`Profile not found: ${profileId}`);
    }

    let weeklyGoal = profile.weeklyGoal;

    // Initialize or reset if needed
    if (!weeklyGoal || this.needsReset(weeklyGoal)) {
      weeklyGoal = this.resetForNewWeek(weeklyGoal);
    }

    // Update target
    weeklyGoal = {
      ...weeklyGoal,
      targetDays,
    };

    // Check if goal is now complete with new target
    if (weeklyGoal.currentDays >= targetDays && !weeklyGoal.lastCompletedWeek) {
      weeklyGoal.lastCompletedWeek = weeklyGoal.weekStart;
    }

    await db.profiles.update(profileId, {
      weeklyGoal,
      updatedAt: new Date().toISOString(),
    });

    return weeklyGoal;
  }

  /**
   * Check if the goal is complete for the current week
   */
  static isGoalComplete(weeklyGoal: WeeklyGoal | undefined): boolean {
    if (!weeklyGoal) return false;
    
    // Make sure we're looking at the current week
    if (this.needsReset(weeklyGoal)) return false;
    
    return weeklyGoal.currentDays >= weeklyGoal.targetDays;
  }

  /**
   * Get days remaining to meet the goal
   */
  static getDaysRemaining(weeklyGoal: WeeklyGoal | undefined): number {
    if (!weeklyGoal) return DEFAULT_WEEKLY_GOAL_TARGET;
    if (this.needsReset(weeklyGoal)) return weeklyGoal.targetDays;
    
    const remaining = weeklyGoal.targetDays - weeklyGoal.currentDays;
    return Math.max(0, remaining);
  }

  /**
   * Get progress percentage (0-100)
   */
  static getProgressPercent(weeklyGoal: WeeklyGoal | undefined): number {
    if (!weeklyGoal || weeklyGoal.targetDays === 0) return 0;
    if (this.needsReset(weeklyGoal)) return 0;
    
    const percent = (weeklyGoal.currentDays / weeklyGoal.targetDays) * 100;
    return Math.min(100, Math.round(percent));
  }
}
