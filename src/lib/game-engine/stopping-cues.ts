import { db } from '../db';
import { getTodayDate } from './weekly-goal-tracker';

/**
 * Stopping Cues System
 * 
 * Implements Healthy Habit Loop principles by providing context-aware
 * messaging that encourages healthy stopping after practice sessions.
 * 
 * Goals:
 * - Encourage consistent practice (3+ days/week)
 * - Prevent binge usage with gentle stopping cues
 * - Celebrate completion without pressuring more play
 */

export type SessionContext = 
  | 'first_session'      // First session of the day
  | 'daily_dash_complete' // Just completed Daily Dash
  | 'multiple_sessions'  // 2nd+ regular session today
  | 'extra_after_daily'  // Extra session after Daily Dash
  | 'default';           // Fallback

export interface StoppingCue {
  headline: string;       // Main encouragement message
  subtext: string;        // Supporting message
  footerText?: string;    // Optional footer message
  showBreakBadge: boolean; // Show "Break Earned" badge
  playAgainLabel: string; // Custom label for play again button
}

// Stopping cue messages by context
const STOPPING_CUES: Record<SessionContext, StoppingCue[]> = {
  first_session: [
    {
      headline: "Great start! 🌟",
      subtext: "You're building awesome math skills.",
      playAgainLabel: "Practice More",
      showBreakBadge: false,
    },
    {
      headline: "Nice work! 💪",
      subtext: "Your brain is getting stronger!",
      playAgainLabel: "Keep Going",
      showBreakBadge: false,
    },
    {
      headline: "Way to go! ⭐",
      subtext: "Every practice session counts.",
      playAgainLabel: "Continue",
      showBreakBadge: false,
    },
  ],
  daily_dash_complete: [
    {
      headline: "Daily Dash Complete! 🎉",
      subtext: "You've done your practice for today!",
      footerText: "See you tomorrow! 🌟",
      playAgainLabel: "Bonus Round",
      showBreakBadge: true,
    },
    {
      headline: "You did it! 🏆",
      subtext: "Today's Daily Dash is done.",
      footerText: "Same time tomorrow?",
      playAgainLabel: "Extra Practice",
      showBreakBadge: true,
    },
    {
      headline: "Champion! 🥇",
      subtext: "Daily challenge conquered!",
      footerText: "Your brain will thank you for the break.",
      playAgainLabel: "Play More",
      showBreakBadge: true,
    },
  ],
  multiple_sessions: [
    {
      headline: "Awesome effort! 🌈",
      subtext: "Nice extra practice! Time for a break?",
      footerText: "Go enjoy something else!",
      playAgainLabel: "One More",
      showBreakBadge: true,
    },
    {
      headline: "Super star! ⭐",
      subtext: "You're really working hard today!",
      footerText: "Your brain will thank you for the break.",
      playAgainLabel: "More Practice",
      showBreakBadge: true,
    },
    {
      headline: "Math machine! 🤖",
      subtext: "Great dedication! Rest is important too.",
      footerText: "That's a wrap for now!",
      playAgainLabel: "Continue",
      showBreakBadge: true,
    },
  ],
  extra_after_daily: [
    {
      headline: "Bonus round complete! 🎯",
      subtext: "Extra practice after your Daily Dash—impressive!",
      footerText: "Now go take a well-deserved break.",
      playAgainLabel: "Even More",
      showBreakBadge: true,
    },
    {
      headline: "Overachiever! 🌟",
      subtext: "You've gone above and beyond today.",
      footerText: "Time to recharge!",
      playAgainLabel: "Keep Going",
      showBreakBadge: true,
    },
  ],
  default: [
    {
      headline: "Well done! 👏",
      subtext: "Every bit of practice helps.",
      playAgainLabel: "Play Again",
      showBreakBadge: false,
    },
  ],
};

/**
 * Get the number of sessions completed today for a profile
 */
export async function getSessionsToday(profileId: string): Promise<number> {
  const today = getTodayDate();
  const todayStart = new Date(today).toISOString();
  const todayEnd = new Date(today + 'T23:59:59.999Z').toISOString();
  
  const sessions = await db.sessions
    .where('profileId')
    .equals(profileId)
    .filter(s => {
      const startedAt = s.startedAt;
      return startedAt >= todayStart && startedAt <= todayEnd && s.isCompleted;
    })
    .count();
  
  return sessions;
}

/**
 * Check if Daily Dash is completed today for a profile
 */
export async function isDailyDashComplete(profileId: string): Promise<boolean> {
  const today = getTodayDate();
  
  const dailyDash = await db.dailyDash
    .where('[profileId+date]')
    .equals([profileId, today])
    .first();
  
  return dailyDash?.completed ?? false;
}

/**
 * Determine the session context for stopping cues
 */
export async function getSessionContext(
  profileId: string,
  isDailyDashSession: boolean = false
): Promise<SessionContext> {
  const [sessionsToday, dailyDashComplete] = await Promise.all([
    getSessionsToday(profileId),
    isDailyDashComplete(profileId),
  ]);
  
  // If this was a Daily Dash session and it's now complete
  if (isDailyDashSession && dailyDashComplete) {
    return 'daily_dash_complete';
  }
  
  // Extra session after completing Daily Dash
  if (dailyDashComplete && sessionsToday > 1) {
    return 'extra_after_daily';
  }
  
  // Multiple sessions today (2nd+ session)
  if (sessionsToday > 1) {
    return 'multiple_sessions';
  }
  
  // First session of the day
  if (sessionsToday <= 1) {
    return 'first_session';
  }
  
  return 'default';
}

/**
 * Get a random stopping cue for the given context
 */
export function getStoppingCue(context: SessionContext): StoppingCue {
  const cues = STOPPING_CUES[context] || STOPPING_CUES.default;
  const randomIndex = Math.floor(Math.random() * cues.length);
  return cues[randomIndex];
}

/**
 * Get stopping cue data for the results screen
 */
export async function getStoppingCueData(
  profileId: string,
  isDailyDashSession: boolean = false
): Promise<{ context: SessionContext; cue: StoppingCue; sessionsToday: number }> {
  const context = await getSessionContext(profileId, isDailyDashSession);
  const cue = getStoppingCue(context);
  const sessionsToday = await getSessionsToday(profileId);
  
  return { context, cue, sessionsToday };
}
