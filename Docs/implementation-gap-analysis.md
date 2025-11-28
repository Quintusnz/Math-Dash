# Math Dash - Implementation Gap Analysis

**Version:** 1.2  
**Created:** November 2025  
**Last Updated:** November 28, 2025  
**Purpose:** Identify gaps between PRD/User Flows and current implementation to guide development priorities

---

## Executive Summary

This document compares the Math Dash PRD (v2.1) and documented User Flows (v2.1) against the current codebase implementation. The analysis is organized by user flow categories to provide a clear roadmap of what has been built and what remains.

**Overall Status:**
- ✅ **Core gameplay loop** is functional (Solo Dash, Duel Mode)
- ✅ **Basic authentication** (Play Code system) is working
- ✅ **Progress tracking** foundation exists (Dexie DB, mastery tracking)
- ✅ **Number Range Selection** for Add/Sub implemented (Nov 2025)
- ✅ **Streak Display** on dashboard implemented (Nov 2025)
- ⚠️ **Parent/Grown-Up features** are partially implemented
- ❌ **Monetization** needs completion (pricing discrepancy, Coach subscription)
- ⚠️ **Engagement layer** partially implemented (Streaks done, Goals not started)
- ❌ **Teacher features** not started

---

## 1. Kid/Player Flows

### 1.1 Authentication & Profile Management

| Feature | Status | Notes |
|---------|--------|-------|
| Welcome Screen | ✅ Complete | Three-option landing (Create, Enter Code, Guest) |
| Create Player Flow | ✅ Complete | Name → Avatar → Age → Code reveal |
| Play Code System | ✅ Complete | DASH-XXXX format, stored in IndexedDB |
| Enter Code Flow | ✅ Complete | Local device lookup working |
| Guest Play | ✅ Complete | Temporary profile created |
| Profile Switching | ✅ Complete | Profile selector with multiple profiles |
| Profile Deletion | ⚠️ Partial | UI exists in Grown-Ups but confirmation flow needs polish |

**Remaining Tasks:**
- [ ] Add more robust profile deletion confirmation with adult gate
- [ ] Cloud-based code lookup (Future - requires account system)
- [ ] Guest-to-full-profile conversion flow

### 1.2 Dashboard / Home Screen

| Feature | Status | Notes |
|---------|--------|-------|
| Profile Banner | ✅ Complete | Avatar, name, Play Code display |
| Solo Dash Button | ✅ Complete | Routes to /play |
| Duel Mode Button | ✅ Complete | Routes to /play/duel |
| Skill Radar Preview | ✅ Complete | Shows mastery visualization |
| Settings Access | ✅ Complete | Settings icon in header |
| Logout/Switch Player | ✅ Complete | Logout icon in header |

**Remaining Tasks:**
- [ ] **Quick Play**: One-tap replay with last config (PRD mentions this)
- [ ] **Topic Suggestions**: AI-driven "try this next" recommendations post-game
- [x] ~~**Streak Display**: Show current streak prominently on dashboard~~ ✅ **Implemented Nov 2025**
- [ ] **Weekly Goals Progress**: Visual progress toward practice goals

### 1.3 Game Setup Wizard

| Feature | Status | Notes |
|---------|--------|-------|
| Operation Selection | ✅ Complete | Add/Sub/Mul/Div cards |
| Number Selection (Mul/Div) | ✅ Complete | 1-12 grid works for times tables |
| Number Range Selection (Add/Sub) | ✅ Complete | Preset zones (Starter/Builder/Challenge/Pro) + custom range panel |
| Mode Selection | ✅ Complete | Dash Blitz, Sprint, Zen Practice |
| Input Method Selection | ✅ Complete | Numpad, Multiple Choice, Voice |
| Settings Adjustment | ✅ Complete | Duration/question count sliders |
| Ready Screen | ✅ Complete | Summary + animated mascot |
| Voice Model Loading | ✅ Complete | Vosk download with progress |

**Remaining Tasks:**
- [x] ~~**Addition/Subtraction Setup Flow**: Design and implement Number Range Selection~~ ✅ **Implemented Nov 2025**
  - 4 preset zones: Starter (0-10), Builder (0-20), Challenge (0-50), Pro (0-100)
  - Custom range panel with min/max, operand/answer range type, negative result toggle
  - Example problems display per zone
  - Question generator updated to use number range config
- [ ] **Age-Based Defaults**: Auto-suggest topics based on age band (PRD Feature)
- [ ] **Locked Topics Indicators**: Visual lock icons for premium content
- [ ] **Remember Last Config**: Pre-fill with last used settings per profile

### 1.4 Core Gameplay

| Feature | Status | Notes |
|---------|--------|-------|
| Timed Mode (Dash Blitz) | ✅ Complete | Countdown timer, score tracking |
| Sprint Mode | ✅ Complete | Question count target |
| Practice/Zen Mode | ✅ Complete | Untimed, manual end |
| Numpad Input | ✅ Complete | On-screen + keyboard support |
| Multiple Choice Input | ✅ Complete | 5 options with feedback |
| Voice Input | ✅ Complete | Vosk-based speech recognition |
| Correct/Incorrect Feedback | ✅ Complete | Visual + audio + haptic |
| Timer Bar | ✅ Complete | Visual countdown indicator |
| Score Tracking | ✅ Complete | Points + streak multiplier |
| High Score Detection | ✅ Complete | Celebrates new personal bests |

**Remaining Tasks:**
- [ ] **Session Pause/Resume**: Detect focus loss and offer resume modal (PRD edge case)
- [ ] **Offline Indicator**: Show clear status when offline
- [ ] **End Practice Button**: More prominent in Zen mode (currently subtle)

### 1.5 Results Screen

| Feature | Status | Notes |
|---------|--------|-------|
| Score Display | ✅ Complete | Points shown prominently |
| Accuracy Display | ✅ Complete | Correct/Total and percentage |
| Achievement Unlocks | ✅ Complete | Shows newly earned badges |
| High Score Celebration | ✅ Complete | Bouncing mascot animation |
| Play Again | ✅ Complete | Restarts with same config |
| New Game | ✅ Complete | Returns to setup wizard |
| Home Button | ✅ Complete | Returns to dashboard |
| Session History | ✅ Complete | List of recent games below results |

**Remaining Tasks:**
- [ ] **Topic Suggestions**: "Great job on 5x! Ready to try 6x?" recommendations
- [ ] **Share Results**: Social sharing capability (low priority)

### 1.6 Dash Duel (Local Multiplayer)

| Feature | Status | Notes |
|---------|--------|-------|
| Duel Setup Screen | ✅ Complete | P1/P2 difficulty selection |
| VS Badge | ✅ Complete | Visual separator |
| Split-Screen Gameplay | ✅ Complete | DuelLayout + PlayerLane components |
| Independent Scoring | ✅ Complete | Each player has own score |
| Shared Timer | ✅ Complete | 60s countdown |
| Results Screen | ✅ Complete | Winner announcement + stats |
| Rematch | ✅ Complete | Quick restart |
| Change Settings | ✅ Complete | Return to setup |

**Remaining Tasks:**
- [ ] **Operation Selection**: Duel currently uses difficulty only, not topic selection
- [ ] **Handicap System**: Optional difficulty balancing for mixed abilities
- [ ] **Portrait/Landscape Modes**: Responsive split-screen layout

---

## 2. Parent/Grown-Up Flows

### 2.1 Accessing Grown-Ups Area

| Feature | Status | Notes |
|---------|--------|-------|
| Navigation Entry | ✅ Complete | /grown-ups route exists |
| Adult Gate | ✅ Complete | AdultGate component enforced in layout |
| Sidebar Navigation | ✅ Complete | Profiles/Progress/Premium/Settings tabs |

**Remaining Tasks:**
- [x] ~~**Enforce Adult Gate**: Add gate before entering Grown-Ups area~~ ✅ Already implemented
- Adult gate uses math question verification

### 2.2 Profiles Tab

| Feature | Status | Notes |
|---------|--------|-------|
| Profile List | ✅ Complete | Shows all profiles on device |
| Profile Avatar/Name | ✅ Complete | Display in list |
| Add New Profile | ⚠️ Partial | Button exists but flow unclear |
| Edit Profile | ⚠️ Partial | Basic editing, needs polish |
| Delete Profile | ⚠️ Partial | Works but confirmation needs improvement |
| Play Code Display | ⚠️ Partial | Not prominently shown per profile |

**Remaining Tasks:**
- [ ] **Profile Edit Flow**: Clean modal for editing name/avatar
- [ ] **Play Code Management**: Show codes, explain their purpose
- [ ] **Last Active Date**: Display when each profile last played
- [ ] **Profile Limits**: Enforce limits for shared school devices

### 2.3 Progress Tab

| Feature | Status | Notes |
|---------|--------|-------|
| Profile Selector Tabs | ✅ Complete | Horizontal profile selection |
| Summary Stats | ✅ Complete | Sessions, Questions, Accuracy |
| Skill Radar | ✅ Complete | Recharts radar visualization |
| Needs Practice / Weak Facts | ✅ Complete | Lists facts with low accuracy |
| Recent Activity | ✅ Complete | Last 5 sessions with details |

**Remaining Tasks:**
- [ ] **Detailed Skill Breakdown**: Tap skill on radar for per-fact details
- [ ] **Progress Over Time**: Trend charts showing improvement
- [ ] **Export Progress Report**: PDF/email summary for parents

### 2.4 Premium Tab / Upgrade Flow

| Feature | Status | Notes |
|---------|--------|-------|
| Upgrade Card | ✅ Complete | Benefits list + CTA |
| Stripe Integration | ✅ Complete | /api/checkout endpoint |
| Success Handling | ✅ Complete | ?success=true flag handling |
| Premium Flag | ✅ Complete | isPremium in globalSettings |

**Remaining Tasks:**
- [ ] **Price Correction**: Shows $7.99, PRD says $6.99
- [ ] **Locked Content UI**: Show lock icons on premium topics in game setup
- [ ] **Adult Gate on Purchase**: Verify adult before payment flow
- [ ] **Regional Pricing**: Support GBP, EUR tiers

### 2.5 Math Dash Coach (Subscription) ❌ NOT STARTED

This is a **major missing feature** from PRD v2.0:

| Feature | Status | Notes |
|---------|--------|-------|
| Coach Upsell Prompt | ❌ Not Built | Should appear after several sessions |
| Coach Benefits Screen | ❌ Not Built | Skill snapshot, practice plans, etc. |
| Coach Subscription Flow | ❌ Not Built | $2.99/mo or $23.99/yr |
| Coach Dashboard | ❌ Not Built | Per-child AI-generated insights |
| Skill Snapshot | ❌ Not Built | Visual proficiency overview |
| Guided Practice Plan | ❌ Not Built | AI-generated weekly recommendations |
| Progress Over Time | ❌ Not Built | Timeline of mastery improvements |
| Coach Reports | ❌ Not Built | Monthly/termly summaries |
| Email Notifications | ❌ Not Built | Optional progress emails |

**Remaining Tasks (Coach - Full Feature):**
- [ ] Design Coach dashboard UI
- [ ] Implement Coach subscription (Stripe recurring)
- [ ] Build AI integration for practice plan generation
- [ ] Create skill snapshot visualization (distinct from Skill Radar)
- [ ] Build progress timeline component
- [ ] Implement Coach report generation
- [ ] Add Coach upsell triggers in parent flow
- [ ] Optional email delivery system

### 2.6 Settings Tab

| Feature | Status | Notes |
|---------|--------|-------|
| Export Data Button | ⚠️ Partial | UI exists, functionality unclear |
| Reset App Button | ⚠️ Partial | UI exists, needs confirmation |
| Notification Preferences | ❌ Not Built | PRD requires parent-controlled reminders |
| Theme Selection | ❌ Not Built | Placeholder in schema |
| Sound/Haptics Defaults | ❌ Not Built | Per-profile preferences exist but no UI |

**Remaining Tasks:**
- [ ] **Working Export**: JSON export of all profile data
- [ ] **Safe Reset**: Multi-step confirmation before data wipe
- [ ] **Notification Settings**: Push reminder configuration (opt-in)
- [ ] **Theme/Sound Settings**: Functional preferences UI

---

## 3. Engagement Layer Flows

### 3.1 Streaks

| Feature | Status | Notes |
|---------|--------|-------|
| Streak Calculation | ✅ Complete | EngagementManager.updateStreak() |
| Streak Storage | ✅ Complete | Profile.streak object in DB |
| Streak Display | ✅ Complete | Dashboard StreakDisplay component (Nov 2025) |
| Streak Break Handling | ⚠️ Partial | Resets silently, no messaging |

**Remaining Tasks:**
- [x] ~~**Streak Badge on Dashboard**: Show current streak prominently~~ ✅ **Implemented Nov 2025**
  - StreakDisplay component in `src/components/features/engagement/`
  - Visual states: no streak, active streak, milestones, new records
  - Week dots visualization showing recent progress
  - Progress hints to next milestone
- [x] ~~**Streak Celebration**: Animate streak milestones (3, 7, 14, 30 days)~~ ✅ **Implemented Nov 2025**
  - Milestone detection with special styling/messaging
  - Gold accent colors per design system
  - Trophy icon for new records
- [x] ~~**Gentle Streak Messaging**: Per PRD ethics, no harsh "lost streak" language~~ ✅ **Implemented Nov 2025**
  - Encouraging messages: "Start your streak today!" for zero streaks
  - Positive milestone messages without negative framing

### 3.2 Weekly Goals

| Feature | Status | Notes |
|---------|--------|-------|
| Goal Definition | ❌ Not Built | "Practice N days per week" |
| Goal Progress UI | ❌ Not Built | Visual orbs/checkmarks |
| Goal Completion Celebration | ❌ Not Built | Weekly milestone rewards |
| Goal Configuration (Parent) | ❌ Not Built | Set in Grown-Ups area |

**Remaining Tasks:**
- [ ] **Weekly Goals System**: Define goal structure in DB
- [ ] **Dashboard Goal Widget**: Visual progress indicator
- [ ] **Goal Settings in Grown-Ups**: Parent can set/adjust goals
- [ ] **Goal Achievement**: Celebrate weekly completion

### 3.3 Achievements / Badges

| Feature | Status | Notes |
|---------|--------|-------|
| Achievement Definitions | ✅ Complete | DEFAULT_ACHIEVEMENTS array |
| Achievement Unlocking | ✅ Complete | EngagementManager.checkAchievements() |
| Achievement Display (Results) | ✅ Complete | Shows on results screen |
| Achievement Gallery | ❌ Not Built | View all earned/available badges |
| Achievement Notifications | ⚠️ Partial | Sound plays, no persistent UI |

**Remaining Tasks:**
- [ ] **Achievement Gallery Page**: View all badges, locked/unlocked state
- [ ] **Dashboard Achievement Preview**: Show recent unlocks
- [ ] **More Achievements**: Expand beyond the 6 default badges
- [ ] **Mastery Achievements**: "Mastered 5x table" type badges

### 3.4 Daily Dash Challenge ❌ NOT STARTED

| Feature | Status | Notes |
|---------|--------|-------|
| Daily Challenge Card | ❌ Not Built | "Today's Dash" recommendations |
| Challenge Completion | ❌ Not Built | Track daily challenge done |
| Challenge Variety | ❌ Not Built | Mix of topics per day |

**Remaining Tasks:**
- [ ] **Daily Dash System**: Generate daily recommended practice
- [ ] **Challenge Card UI**: Prominent on dashboard
- [ ] **Challenge Tracking**: Mark daily challenge as complete

---

## 4. Topic & Skill Library Flows

### 4.1 Topic Organization

| Feature | Status | Notes |
|---------|--------|-------|
| Four Operations | ✅ Complete | Add/Sub/Mul/Div in setup |
| Times Tables 1-12 | ✅ Complete | Number selection grid |
| Division Facts | ✅ Complete | Derived from times tables |

**Missing Topic Categories (PRD specifies):**
| Topic | Status | Notes |
|-------|--------|-------|
| Make 10 Number Bonds | ❌ Not Built | Addition facts that make 10 |
| Make 20 Number Bonds | ❌ Not Built | Addition facts that make 20 |
| Make 100 | ❌ Not Built | Complements to 100 |
| Doubles | ❌ Not Built | Fast addition by 2 |
| Halves | ❌ Not Built | Division by 2 |
| Square Numbers | ❌ Not Built | n×n up to 12×12 |

**Remaining Tasks:**
- [ ] **Expand Topic Library**: Add number bonds, doubles, halves, squares
- [ ] **Topic Category UI**: Reorganize setup to show topic categories
- [ ] **Per-Topic Proficiency**: Track mastery by specific topic
- [ ] **Recent Topics**: Remember and suggest recently practiced topics

### 4.2 Mastery Tracking

| Feature | Status | Notes |
|---------|--------|-------|
| Per-Fact Tracking | ✅ Complete | MasteryRecord in DB |
| Accuracy Calculation | ✅ Complete | correct/attempts ratio |
| Response Time Tracking | ✅ Complete | avgResponseTime stored |
| Status Classification | ✅ Complete | new/learning/mastered |
| Weak Fact Identification | ✅ Complete | getWeakFacts() method |
| Weak Fact Integration | ✅ Complete | 30% chance to show weak facts |

**Remaining Tasks:**
- [ ] **Mastery Thresholds**: Define clear criteria for mastered status
- [ ] **Mastery UI**: Show per-fact mastery in detail views
- [ ] **Spaced Repetition**: Implement proper SR algorithm for weak facts

---

## 5. Analytics & Data Capture for AI Features

The PRD Section 13 specifies detailed analytics requirements to support Math Dash Coach AI features and ethical engagement metrics. This section audits what's currently captured versus what's needed.

### 5.1 Current Data Capture

**What's Being Tracked:**

| Data Point | Status | Location | Notes |
|------------|--------|----------|-------|
| Question ID | ✅ Captured | QuestionAttempt | Per-question UUID |
| Fact string | ✅ Captured | QuestionAttempt | e.g., "7×8" |
| Operation type | ✅ Captured | QuestionAttempt | add/sub/mul/div |
| Is Correct | ✅ Captured | QuestionAttempt | Boolean |
| Response Time (ms) | ✅ Captured | QuestionAttempt | Time to answer |
| Timestamp | ✅ Captured | QuestionAttempt | ISO string |
| Session ID | ✅ Captured | GameSession | Links attempts to session |
| Session Score | ✅ Captured | GameSession | Final score |
| Questions Answered | ✅ Captured | GameSession | Total count |
| Questions Correct | ✅ Captured | GameSession | Correct count |
| Mode | ✅ Captured | GameSession | timed/sprint/practice |
| Start/End Time | ✅ Captured | GameSession | Session duration derivable |
| Profile ID | ✅ Captured | GameSession | Links to player |
| Mastery Status | ✅ Captured | MasteryRecord | new/learning/mastered |
| Mastery Weight | ✅ Captured | MasteryRecord | For weak fact prioritization |
| Avg Response Time | ✅ Captured | MasteryRecord | Per-fact average |
| Current Streak | ✅ Captured | Profile.streak | Days in a row |
| Best Streak | ✅ Captured | Profile.streak | All-time best |
| Last Active Date | ✅ Captured | Profile.streak | For streak calculation |
| Total Sessions | ✅ Captured | Profile.stats | Lifetime count |
| Total Questions | ✅ Captured | Profile.stats | Lifetime count |
| Total Correct | ✅ Captured | Profile.stats | Lifetime count |

### 5.2 Missing Data for Coach AI (PRD Section 13.2-13.3)

**Session-Level Gaps:**

| Data Point | Status | PRD Requirement | Impact |
|------------|--------|-----------------|--------|
| Topic/Skill Cluster | ✅ Fixed | Track which skill category | Now derived from config.operations |
| Selected Numbers | ✅ Fixed | What numbers were practiced | Now saved in config snapshot |
| Input Method Used | ✅ Fixed | numpad/choice/voice | Now saved in config snapshot |
| Difficulty Setting | ✅ Fixed | easy/medium/hard | Now saved in config snapshot |
| Session Duration (actual) | ⚠️ Derived | Precise playtime | Calculated from start/end, but not precise for sprint/practice |
| Pause Count/Duration | ❌ Not Captured | Time spent paused | Can't measure focus vs distraction |

**Practice Pattern Gaps:**

| Data Point | Status | PRD Requirement | Impact |
|------------|--------|-----------------|--------|
| Sessions Per Day | ⚠️ Derivable | Daily session count | Need to query, not pre-aggregated |
| Active Days Per Week | ⚠️ Derivable | Weekly engagement | PRD primary engagement metric |
| Time of Day Patterns | ⚠️ Derivable | When child plays | Need to analyze timestamps |
| Session Length Distribution | ⚠️ Derivable | Are sessions 5-10 min? | PRD ethical metric |
| Topic Progression Over Time | ❌ Not Built | What topics over weeks | Need trend analysis |

**Coach-Specific Events (PRD 13.2):**

| Event | Status | Notes |
|-------|--------|-------|
| COACH_SUBSCRIBED | ❌ Not Built | Subscription system not implemented |
| COACH_CANCELLED | ❌ Not Built | " |
| PRACTICE_PLAN_GENERATED | ❌ Not Built | AI features not implemented |
| PRACTICE_PLAN_SESSION_STARTED | ❌ Not Built | " |
| PRACTICE_PLAN_SESSION_COMPLETED | ❌ Not Built | " |
| COACH_REPORT_GENERATED | ❌ Not Built | " |
| COACH_REPORT_VIEWED | ❌ Not Built | " |

### 5.3 Data Structure Improvements Needed

**Current Issues:**

1. ~~**topicId is hardcoded**: `session-manager.ts` always saves `topicId: 'mixed'` instead of actual topic~~ ✅ **Fixed** - Now derives topicId from operations array
2. ~~**No config snapshot**: We don't save what settings the user chose (numbers, difficulty, input method)~~ ✅ **Fixed** - Config now saved with each session
3. **No derived aggregates**: Weekly/monthly stats must be calculated on-demand
4. ~~**Missing error patterns**: We track if wrong, but not what the wrong answer was~~ ✅ **Fixed** - givenAnswer now captured

**Recommended Schema Additions:**

```typescript
// Enhance GameSession
interface GameSession {
  // ... existing fields ...
  
  // ADD: Configuration snapshot
  config: {
    operations: string[];
    selectedNumbers: number[];
    difficulty: string;
    inputMethod: string;
    targetDuration?: number;  // For timed mode
    targetQuestions?: number; // For sprint mode
  };
  
  // ADD: Computed metrics
  accuracyPercent: number;
  avgResponseTimeMs: number;
  questionsPerMinute: number;
}

// Enhance QuestionAttempt
interface QuestionAttempt {
  // ... existing fields ...
  
  // ADD: Wrong answer tracking
  givenAnswer: number | null;  // What the user entered (null if timeout)
  expectedAnswer: number;
  
  // ADD: Context
  questionIndex: number;  // Position in session (1st, 2nd, etc.)
  streakAtTime: number;   // Streak when answered (for momentum analysis)
}

// NEW: Daily/Weekly Aggregates (for fast Coach queries)
interface DailyAggregate {
  id?: number;
  profileId: string;
  date: string;  // YYYY-MM-DD
  sessionsCount: number;
  totalQuestions: number;
  totalCorrect: number;
  totalTimeMs: number;
  operationBreakdown: Record<string, { attempts: number; correct: number }>;
}

// NEW: Skill Trend (for progress over time)
interface SkillTrend {
  id?: number;
  profileId: string;
  skillCluster: string;  // e.g., "multiplication-7", "addition-bonds-10"
  weekStart: string;     // YYYY-MM-DD (Monday)
  accuracy: number;
  avgResponseTimeMs: number;
  attemptCount: number;
}
```

### 5.4 AI Input/Output Requirements (PRD 13.3)

**Required AI Inputs (not yet structured):**

| Input | Current State | Action Needed |
|-------|---------------|---------------|
| Anonymized performance data | ⚠️ Exists but not formatted | Create AI-ready export function |
| Historical session data | ✅ Available | Need aggregation layer |
| Current skill proficiency | ✅ MasteryRecord | Need per-skill-cluster rollup |
| Age band | ✅ In Profile | Need to include in AI context |
| Trend data (improving/declining) | ❌ Not calculated | Build trend analysis |
| Comparison to age-band expectations | ❌ No benchmark data | Define expected benchmarks |

**Required AI Outputs (not yet implemented):**

| Output | Status | Notes |
|--------|--------|-------|
| Skill snapshot descriptions | ❌ Not Built | "Strong on 5x, struggling with 7x" |
| Progress narratives | ❌ Not Built | "Improved 20% this month" |
| Weekly practice plan | ❌ Not Built | "Focus on 7x and 8x this week" |
| Recommended session duration | ❌ Not Built | "3 sessions of 8 minutes" |
| Topic priority ordering | ❌ Not Built | Which topics to practice first |

### 5.5 Ethical Engagement Metrics (PRD 8.10)

**Primary Metric - Days Per Week:**

| Requirement | Status | Notes |
|-------------|--------|-------|
| Active days per week per child | ⚠️ Derivable | Need dedicated query/view |
| Target: 3+ days/week | ❌ No tracking | No goal system implemented |
| Weekly goal progress UI | ❌ Not Built | PRD Section 8.3.2 |

**Secondary Metrics:**

| Metric | Status | Notes |
|--------|--------|-------|
| Average session length | ⚠️ Derivable | Target 5-10 minutes |
| Accuracy improvement over time | ❌ Not calculated | Need trend comparison |
| Speed improvement over time | ❌ Not calculated | Need trend comparison |
| Late-night usage detection | ❌ Not built | PRD says should be rare |
| Sessions per day distribution | ⚠️ Derivable | Check for binge patterns |

### 5.6 Remaining Tasks - Data & Analytics

**P0 - Critical Fixes:**
- [x] **Save actual topicId**: ~~Fix session-manager to save real topic, not 'mixed'~~ ✅ Done
- [x] **Capture session config**: ~~Store operations, selectedNumbers, difficulty, inputMethod~~ ✅ Done
- [x] **Track given answers**: ~~Save what user entered, not just right/wrong~~ ✅ Done

**P1 - Coach Foundation:**
- [ ] **Daily aggregates table**: Pre-compute daily stats for fast queries
- [ ] **Skill trend tracking**: Weekly snapshots per skill cluster
- [ ] **AI export function**: Format data for AI consumption
- [ ] **Age-band benchmarks**: Define expected proficiency by age

**P2 - Engagement Analytics:**
- [ ] **Weekly goal tracking**: Days practiced this week
- [ ] **Session length monitoring**: Ensure 5-10 min target
- [ ] **Time-of-day analysis**: When does child typically play
- [ ] **Trend calculations**: Is accuracy/speed improving?

**P3 - Coach Events:**
- [ ] Implement all COACH_* event types when subscription built
- [ ] Track practice plan adherence
- [ ] Track report generation and viewing

---

## 6. Adaptive Practice Mode ⚠️ PARTIAL

| Feature | Status | Notes |
|---------|--------|-------|
| Difficulty Levels | ✅ Complete | Easy/Medium/Hard in generator |
| Weak Fact Prioritization | ✅ Complete | 30% chance for weak facts |
| Dynamic Difficulty Adjustment | ❌ Not Built | Adjust mid-session based on performance |
| Smart Topic Suggestions | ❌ Not Built | Recommend topics based on gaps |
| "Smart Mode" in Setup | ❌ Not Built | Dedicated adaptive mode option |

**Remaining Tasks:**
- [ ] **Smart Mode Toggle**: Add "Adaptive" option in mode selection
- [ ] **In-Session Adjustment**: Increase/decrease difficulty dynamically
- [ ] **Coach Integration**: Use AI analysis to drive adaptivity

---

## 7. Monetization & Premium Flows

### 6.1 Core Unlock (One-Time Purchase)

| Feature | Status | Notes |
|---------|--------|-------|
| Stripe Integration | ✅ Complete | /api/checkout route |
| Premium Flag | ✅ Complete | isPremium in globalSettings |
| Upgrade Card UI | ✅ Complete | Benefits + CTA |
| Success Redirect | ✅ Complete | Handles ?success=true |

**Issues to Fix:**
- [x] **Price Discrepancy**: ~~Shows $7.99, PRD says $6.99~~ ✅ Fixed to $6.99
- [ ] **Locked Content**: No actual content locking implemented
- [ ] **Adult Gate**: No verification before purchase

**Remaining Tasks:**
- [x] Fix pricing to $6.99 ✅
- [ ] Implement topic locking for free tier
- [ ] Add adult verification before payment
- [ ] Support regional pricing (GBP £5.99, EUR €6.99)
- [ ] Teacher unlock tier ($19.99) - separate SKU

### 6.2 Coach Subscription ❌ NOT STARTED

| Feature | Status | Notes |
|---------|--------|-------|
| Subscription Product | ❌ Not Built | Stripe recurring billing |
| Monthly Plan | ❌ Not Built | $2.99/month |
| Annual Plan | ❌ Not Built | $23.99/year |
| Subscription Management | ❌ Not Built | Cancel, view status |
| Coach Features Gate | ❌ Not Built | Restrict Coach dashboard |

**Remaining Tasks:**
- [ ] Create Stripe subscription products
- [ ] Build subscription checkout flow
- [ ] Implement subscription status tracking
- [ ] Gate Coach features behind subscription
- [ ] Handle subscription lifecycle (trial, cancel, reactivate)

### 6.3 AI Credit Packs (Optional - Low Priority)

| Feature | Status | Notes |
|---------|--------|-------|
| Credit Pack Products | ❌ Not Built | $4.99 parent / $14.99 teacher |
| Credit Balance | ❌ Not Built | Track remaining credits |
| Credit Usage | ❌ Not Built | Deduct on AI analysis |

**Note:** PRD indicates credit packs are secondary to Coach subscription. Consider deferring.

---

## 8. Free/Core vs Coach Subscription Experience

This section clarifies **what guidance and progression features are available at each tier**, ensuring we design distinct experiences for non-subscribers vs Coach subscribers.

### 8.1 Experience Tiers Overview

| Tier | Price | Target User | Key Value |
|------|-------|-------------|-----------|
| **Free** | $0 | Trial users | Limited topics, basic progress |
| **Core Unlock** | $6.99 one-time | Families | All topics, full progress dashboard |
| **Core + Coach** | $6.99 + $2.99/mo | Engaged parents | AI-powered guidance & practice plans |

### 8.2 Guidance & Progression by Tier

#### Free Tier (No Purchase)

| Feature | Included | Notes |
|---------|----------|-------|
| Limited topics | ✅ | 2×, 3×, 4× tables; bonds to 10; basic doubles |
| Basic gameplay | ✅ | All modes (Dash Blitz, Sprint, Zen) |
| Session history | ✅ | View recent games |
| Simple score tracking | ✅ | Points, accuracy per session |
| Skill Radar | ❌ | Teaser only, upgrade prompt |
| Mastery tracking | ⚠️ Limited | Track but don't surface detailed insights |
| Weekly goals | ⚠️ Basic | "Practice X days" without smart recommendations |
| Streak display | ✅ | Simple current streak |
| Achievements | ⚠️ Limited | Basic badges only |
| Topic suggestions | ❌ | No "what to practice next" |

**Progression Experience (Free):**
- Kid sees: Score, basic streak, limited achievements
- Parent sees: Upgrade prompts, preview of what's available
- No personalized guidance

#### Core Unlock ($6.99 one-time)

| Feature | Included | Notes |
|---------|----------|-------|
| All topics | ✅ | Full times tables, bonds, doubles, halves, squares |
| Skill Radar | ✅ | Full visualization in Grown-Ups area |
| Mastery tracking | ✅ | Per-fact status (new/learning/mastered) |
| Weak facts identification | ✅ | "Needs Practice" list |
| Weekly goals | ✅ | Visual progress (3 orbs for 3 days) |
| Streak display | ✅ | Current + best streak |
| Full achievements | ✅ | All badge categories |
| Session history | ✅ | Full history with details |
| Basic topic suggestions | ⚠️ Rule-based | "You haven't practiced 7× recently" |
| Dash Path progression | ✅ | Visual journey advancement |
| Daily Dash | ✅ | Curated session (rule-based selection) |

**Progression Experience (Core):**
- Kid sees: Full progress, achievements, Dash Path, Daily Dash suggestions
- Parent sees: Skill Radar, weak facts, session history, weekly goal progress
- Guidance is **rule-based** (not AI): "Practice your weak areas" without specific plans

#### Coach Subscription ($2.99/mo on top of Core)

| Feature | Included | Notes |
|---------|----------|-------|
| Everything in Core | ✅ | Prerequisite |
| **AI Skill Snapshot** | ✅ | "Strong on 5×, struggling with 7×8 and 8×7" |
| **AI Practice Plans** | ✅ | "This week: 3 sessions focusing on 7× and 8×" |
| **Progress Narratives** | ✅ | "Emma improved 20% on division this month" |
| **Trend Analysis** | ✅ | "Speed improving, accuracy steady" |
| **Age-Band Comparison** | ✅ | "Ahead of typical Year 3 in multiplication" |
| **Monthly Coach Reports** | ✅ | Downloadable/emailable summaries |
| **Smart Daily Dash** | ✅ | AI-curated session based on gaps + plan |
| **Parent Explanations** | ✅ | "Here's why we're focusing on 7×..." |
| **Actionable Recommendations** | ✅ | "Start this practice" buttons in plan |

**Progression Experience (Coach):**
- Kid sees: Same as Core (we don't overwhelm kids with AI insights)
- Parent sees: Rich AI dashboard with specific guidance, clear next steps
- Guidance is **AI-powered**: Personalized, adaptive, explained in plain language

### 8.3 Feature Gating Implementation

| Gate Point | Free | Core | Coach |
|------------|------|------|-------|
| Topic selection | 🔒 Limited | ✅ All | ✅ All |
| Grown-Ups → Progress | 🔒 Upgrade prompt | ✅ Full | ✅ Full + Coach tab |
| Grown-Ups → Coach | 🔒 N/A | 🔒 Upsell | ✅ Full dashboard |
| Daily Dash content | Basic | Rule-based | AI-curated |
| "What to practice" | ❌ None | ⚠️ Simple rules | ✅ AI plan |
| Reports/exports | ❌ None | ⚠️ Basic | ✅ AI reports |

### 8.4 Remaining Tasks - Tier Differentiation

**P0 - Core vs Free:**
- [ ] Implement topic locking for free tier
- [ ] Add upgrade prompts at gate points
- [ ] Define exactly which topics are free vs premium

**P1 - Core Experience (Non-AI Guidance):**
- [ ] Build rule-based "what to practice" suggestions (no AI needed)
- [ ] Implement Daily Dash with rule-based topic selection
- [ ] Add "You haven't practiced X recently" nudges
- [ ] Weekly goal system with visual progress

**P2 - Coach vs Core:**
- [ ] Gate Coach dashboard behind subscription check
- [ ] Design Coach upsell prompts in Grown-Ups area
- [ ] Differentiate Daily Dash: rule-based (Core) vs AI-curated (Coach)
- [ ] Build AI practice plan UI (Coach only)
- [ ] Build AI reports/exports (Coach only)

### 8.5 UX Principle: Don't Paywall the Kid's Experience

**Important:** The child-facing experience should be largely the same across Core and Coach tiers. The AI features are **parent-facing**. Kids should not feel they're missing out because their parent didn't subscribe to Coach.

| What Kids See | Free | Core | Coach |
|---------------|------|------|-------|
| Gameplay | ✅ Same | ✅ Same | ✅ Same |
| Daily Dash | ✅ Available | ✅ Available | ✅ Available |
| Achievements | ⚠️ Limited | ✅ Full | ✅ Full |
| Progress visuals | ⚠️ Basic | ✅ Full | ✅ Full |
| AI messaging | ❌ None | ❌ None | ❌ None (parent-only) |

---

## 9. Healthy Habit Loop Implementation Review

This section tracks an upcoming comprehensive review of our engagement patterns against the **Healthy Habit Loop** principles documented in `Docs/Healthy-Habit-Loop-Prompt.md`.

### 9.1 Review Purpose

The Healthy Habit Loop review will audit our current implementation against child wellbeing principles:
- Short, contained sessions (~5-10 minutes)
- Consistency over binge usage (days-per-week, not total minutes)
- Mastery and confidence focus
- Positive, non-punitive engagement
- Calm, predictable rewards
- Parent/teacher control

### 9.2 Key Mechanics to Review

| Mechanic | Current State | Likely Gaps |
|----------|---------------|-------------|
| **Daily Dash Session** | ❌ Not implemented | No guided "daily session" concept |
| **Weekly Practice Goals** | ❌ Not implemented | No weekly goal UI or tracking |
| **Dash Path / Checkpoint Trail** | ❌ Not implemented | No visual journey/progression path |
| **Skill Mastery Indicators** | ⚠️ Partial | MasteryRecord exists but no child-facing visualization |
| **Session Summary & Stopping Cue** | ⚠️ Partial | Results screen exists but lacks "done for today" messaging |
| **Optional Extra Play** | ⚠️ Needs review | "Play Again" exists but may need copy/UX refinement |
| **Achievements & Badges** | ⚠️ Partial | Basic achievements exist, need audit for determinism |
| **Parent/Teacher Reminders** | ❌ Not implemented | No notification system |
| **Analytics for Habit Metrics** | ⚠️ Partial | Data captured but not aggregated for habit analysis |

### 9.3 Preliminary Gap Observations

Based on the Healthy Habit Loop prompt requirements, these are the major gaps already visible:

**Missing Entirely:**
- [ ] **Daily Dash concept**: No single "do your daily practice" entry point
- [ ] **Weekly goals UI**: No "practice 3 days this week" visual
- [ ] **Dash Path**: No visual journey that advances with each session
- [ ] **Stopping cue copy**: No "you're done for today" messaging
- [ ] **Reminder system**: No parent-configured notifications

**Needs Refinement:**
- [ ] **Streak handling**: Current streak resets silently - need gentler approach
- [ ] **Results screen copy**: Add encouragement to take a break
- [ ] **"Play Again" positioning**: Ensure it's not pressuring continued play
- [ ] **Achievement criteria**: Audit for determinism (no random rewards)

**Analytics Alignment:**
- [ ] **Primary metric**: Need "days practiced per week" as key metric
- [ ] **Session length tracking**: Ensure we're monitoring 5-10 min target
- [ ] **Binge detection**: Flag if kids play excessively long sessions

### 9.4 Review Deliverables (Upcoming)

When we execute the Healthy Habit Loop review, we will produce:

1. **Alignment Report**: Current state vs each mechanic requirement
2. **Change Plan**: Prioritized list of changes (P0/P1/P2)
3. **Copy & UX Suggestions**: Specific text and layout recommendations
4. **Validation Checklist**: QA checklist for habit loop compliance

### 9.5 Integration with Gap Analysis

After the Healthy Habit Loop review is complete, findings should be merged into this gap analysis:
- New tasks added to relevant sections
- Priority adjustments based on wellbeing impact
- Copy/UX recommendations documented

**Estimated Priority Impact:**
- Daily Dash + Weekly Goals likely **P1** (core engagement)
- Stopping cues + copy refinement likely **P1** (quick wins)
- Dash Path likely **P2** (visual polish)
- Reminder system likely **P2** (requires infrastructure)

---

## 10. Teacher Flows ❌ NOT STARTED

The entire teacher flow is not implemented:

| Feature | Status | Notes |
|---------|--------|-------|
| Teacher Account | ❌ Not Built | Separate account type |
| Teacher Core Unlock | ❌ Not Built | $19.99 one-time |
| Class Creation | ❌ Not Built | Create class with name/year |
| Class Code Generation | ❌ Not Built | Pupils join via code |
| Pupil Join Flow | ❌ Not Built | Enter class code |
| Class Dashboard | ❌ Not Built | Aggregate progress view |
| Per-Pupil Tracking | ❌ Not Built | Individual progress drill-down |
| Class Progress Export | ❌ Not Built | Reports for teachers |

**Remaining Tasks (Teacher Flow - Entire Feature):**
- [ ] Design teacher account structure
- [ ] Teacher registration flow
- [ ] Class management UI
- [ ] Class code system (distinct from Play Codes)
- [ ] Pupil linking to classes
- [ ] Teacher dashboard with class analytics
- [ ] Export/reporting tools

---

## 11. Accounts & Cloud Sync ❌ NOT STARTED

| Feature | Status | Notes |
|---------|--------|-------|
| User Account Registration | ❌ Not Built | Email/password or OAuth |
| Account Linking | ❌ Not Built | Link profiles to account |
| Cross-Device Sync | ❌ Not Built | Sync profiles/progress to cloud |
| Sync Queue | ⚠️ Schema Only | SyncQueueItem exists but unused |
| Conflict Resolution | ❌ Not Built | Last-write-wins strategy |
| Data Export | ⚠️ Partial | UI exists, needs implementation |

**Remaining Tasks:**
- [ ] Choose auth provider (Supabase, Firebase, custom)
- [ ] Design sync architecture
- [ ] Implement background sync queue processing
- [ ] Cross-device Play Code resolution
- [ ] Account settings management

---

## 12. Parent Email & Communication ❌ CRITICAL GAP

### 12.1 Current State

**We currently do NOT capture parent email addresses.** This creates significant limitations:

| Capability | Status | Impact |
|------------|--------|--------|
| Parent email capture | ❌ Not Built | No way to contact parents |
| Email verification | ❌ Not Built | Can't verify parent identity |
| Marketing emails | ❌ Blocked | Can't inform about new features |
| Coach report delivery | ❌ Blocked | Can't send monthly/termly reports |
| Password reset | ❌ Blocked | No account recovery mechanism |
| Purchase receipts | ⚠️ Stripe Only | Only through Stripe, not our system |
| Notification preferences | ❌ Not Built | Can't configure email preferences |

### 12.2 Why This Matters

**For Coach Subscription (PRD Section 12.5.3):**
- Monthly Coach reports should be optionally emailed
- "New report ready for Emma" notifications
- Practice plan reminders
- Progress milestone celebrations

**For Marketing & Retention:**
- Announce new features (e.g., "New topic: Square Numbers!")
- Re-engagement campaigns for lapsed users
- Upgrade prompts for free users
- Coach upsell for Core users
- Seasonal promotions (back to school, etc.)

**For Account Management:**
- Password reset / account recovery
- Purchase confirmation and receipts
- Subscription renewal reminders
- Payment failure notifications

**For Compliance & Trust:**
- GDPR data export requests
- Account deletion confirmations
- Terms of service updates
- Privacy policy changes

### 12.3 Email Capture Points

We need to identify **when and where** to capture parent email:

| Touchpoint | Priority | Notes |
|------------|----------|-------|
| Core Unlock Purchase | P0 | Natural point - paying customer |
| Coach Subscription | P0 | Required for report delivery |
| Account Creation (Future) | P1 | When we add cloud sync |
| Grown-Ups Area First Visit | P2 | Optional prompt, may feel intrusive |
| Post-Purchase Prompt | P1 | "Get progress updates by email" |
| Coach Report Opt-In | P0 | Required for Coach email features |

**Recommended Primary Capture Point:** During purchase flow
- "Enter email for your receipt and progress updates"
- Clear value exchange
- Natural expectation at checkout
- Links to Stripe customer record

### 12.4 Data Model Implications

**Current Schema:**
```typescript
// GlobalSettings has optional parentEmail
interface GlobalSettings {
  id: string;
  isPremium: boolean;
  parentEmail?: string;  // ← Exists but never populated
  updatedAt: string;
}
```

**Needed Additions:**
```typescript
interface ParentAccount {
  id: string;
  email: string;
  emailVerified: boolean;
  stripeCustomerId?: string;
  
  // Communication preferences
  preferences: {
    marketingEmails: boolean;      // Feature announcements
    coachReports: boolean;         // Monthly summaries (Coach only)
    progressMilestones: boolean;   // "Emma mastered 7× table!"
    practiceReminders: boolean;    // "Time for Math Dash?"
  };
  
  // Consent tracking (GDPR)
  consents: {
    termsAcceptedAt: string;
    privacyAcceptedAt: string;
    marketingConsentAt?: string;
  };
  
  createdAt: string;
  updatedAt: string;
}

// Link profiles to parent account
interface Profile {
  // ... existing fields ...
  parentAccountId?: string;  // NEW: Link to parent
}
```

### 12.5 Email Service Requirements

| Capability | Service Options | Notes |
|------------|-----------------|-------|
| Transactional emails | SendGrid, Postmark, AWS SES | Receipts, password reset |
| Marketing emails | Mailchimp, ConvertKit, Loops | Feature announcements |
| Automated reports | Custom + transactional service | Coach monthly reports |
| Email templates | Service-provided or custom | Branded, mobile-friendly |

**Recommended:** Start with a single service (e.g., SendGrid or Postmark) that handles both transactional and marketing, then split if volume requires.

### 12.6 Privacy & Compliance Considerations

| Requirement | Implementation |
|-------------|----------------|
| GDPR consent | Explicit opt-in checkboxes, separate from T&C |
| CAN-SPAM compliance | Unsubscribe link in every email |
| COPPA | Email is parent's, not child's |
| Data minimization | Only collect what's needed |
| Right to erasure | Delete email on account deletion |
| Preference center | Let parents manage email types |

### 12.7 Remaining Tasks - Email & Communication

**P0 - Critical Foundation:**
- [ ] Add email capture to Stripe checkout flow
- [ ] Store parent email in database (link to Stripe customer)
- [ ] Basic email preference capture (marketing opt-in checkbox)
- [ ] Implement unsubscribe mechanism

**P1 - Transactional Emails:**
- [ ] Set up email service (SendGrid/Postmark)
- [ ] Purchase confirmation email
- [ ] Email verification flow
- [ ] Password reset (when accounts added)

**P2 - Coach Email Features:**
- [ ] Coach report email delivery
- [ ] "New report ready" notification
- [ ] Progress milestone emails
- [ ] Practice reminder emails (parent-configured)

**P3 - Marketing & Growth:**
- [ ] Email preference center UI
- [ ] Feature announcement capability
- [ ] Re-engagement campaigns
- [ ] Upgrade/upsell emails

---

## 13. Settings & Preferences

### 13.1 User Settings Page (/settings)

| Feature | Status | Notes |
|---------|--------|-------|
| Settings Route | ✅ Complete | /settings page exists |
| Settings UI | ❌ Placeholder | Just shows "Settings" heading |

**Remaining Tasks:**
- [ ] **Sound Toggle**: Enable/disable game sounds
- [ ] **Haptics Toggle**: Enable/disable vibration feedback
- [ ] **Theme Selection**: Light/dark/auto
- [ ] **About/Version**: App info display
- [ ] **Help/Support**: Links to documentation

### 13.2 Profile Preferences

| Feature | Status | Notes |
|---------|--------|-------|
| Per-Profile Preferences | ⚠️ Schema Only | preferences object in Profile |
| Sound Preference | ❌ Not Used | Schema exists, not in UI |
| Haptics Preference | ❌ Not Used | Schema exists, not in UI |
| Theme Preference | ❌ Not Used | Schema exists, not in UI |

**Remaining Tasks:**
- [ ] Build preferences UI per profile
- [ ] Apply preferences during gameplay
- [ ] Sync preferences with profile

---

## 14. Marketing & Public Pages

### 10.1 Landing Page

| Feature | Status | Notes |
|---------|--------|-------|
| Hero Section | ✅ Complete | Tagline, CTA, mascot |
| Operations Marquee | ✅ Complete | Animated operations display |
| Trust Badges | ✅ Complete | No Ads, Kid-Safe, etc. |
| Cohort Cards | ✅ Complete | Kids, Parents, Teachers links |
| CTA Section | ✅ Complete | "Ready to dash?" |

**Issues:**
- [x] ~~**Price Discrepancy**: Shows $4.99, PRD says $6.99~~ ✅ Fixed to $6.99
- [ ] **Student Count**: Shows "10,000+ Students" - verify this is accurate

### 10.2 Audience Pages

| Page | Status | Notes |
|------|--------|-------|
| /kids | ⚠️ Exists | Content needs review |
| /parents | ⚠️ Exists | Content needs review |
| /teachers | ⚠️ Exists | Content needs review |
| /how-it-works | ⚠️ Exists | Content needs review |
| /pricing | ⚠️ Exists | Content needs review |
| /about | ⚠️ Exists | Content needs review |

**Remaining Tasks:**
- [ ] Review all marketing page content for accuracy
- [ ] Ensure pricing matches PRD
- [ ] Add Coach subscription info to pricing page

---

## 15. Accessibility & Ethics

### 15.1 Accessibility (WCAG 2.1 AA)

| Feature | Status | Notes |
|---------|--------|-------|
| Keyboard Navigation | ⚠️ Partial | Numpad supports keyboard |
| Screen Reader Labels | ⚠️ Partial | Some aria-labels present |
| Color Contrast | ⚠️ Unknown | Needs audit |
| No Harmful Flashing | ✅ Assumed | No rapid animations |

**Remaining Tasks:**
- [ ] Full accessibility audit
- [ ] Add missing aria-labels
- [ ] Verify color contrast ratios
- [ ] Test with screen readers

### 15.2 Ethical Engagement (PRD Section 8)

| Principle | Status | Notes |
|-----------|--------|-------|
| No Harsh Streak Messaging | ✅ Aligned | Streaks reset silently |
| No Gambling-Like Rewards | ✅ Aligned | No loot boxes or spin wheels |
| No FOMO Mechanics | ✅ Aligned | No time-limited offers |
| Parent-Controlled Notifications | ❌ Not Built | Notification system not implemented |
| Session Length ~5-10 min | ⚠️ Soft | Not enforced, but natural length |
| Positive Feedback Only | ✅ Aligned | Encouraging messaging |

**Remaining Tasks:**
- [ ] Implement parent notification controls
- [ ] Add end-of-session "take a break" messaging
- [ ] Review all copy for ethical compliance

---

## Priority Recommendations

### P0 - Critical for MVP Completion
1. ~~**Fix pricing discrepancies** across all surfaces ($6.99 not $7.99 or $4.99)~~ ✅ **DONE**
2. ~~**Addition/Subtraction setup flow** - current number grid only works for multiplication/division~~ ✅ **DONE** - Number Range Selection implemented with 4 preset zones + custom range panel
3. ~~**Fix data capture gaps**~~ ✅ **DONE**:
   - ~~Save actual topicId (not hardcoded 'mixed')~~ ✅
   - ~~Capture session config (operations, numbers, difficulty, input method)~~ ✅
   - ~~Track given answers (not just right/wrong)~~ ✅
4. ~~**Add streak display** on dashboard~~ ✅ **DONE** - StreakDisplay component with milestones, animations, encouraging messaging
5. **Parent email capture** - add to checkout flow, critical for Coach and marketing
6. **Implement content locking** for free tier limitations
7. ~~**Enforce adult gate** before Grown-Ups area~~ ✅ **DONE** (already implemented)
8. **Complete Settings page** with sound/haptics toggles

### P1 - Important for Core Experience
1. **Weekly goals system** - key engagement feature (Healthy Habit Loop)
2. **Daily Dash concept** - guided daily session entry point
3. **Achievement gallery** - view all badges
4. **Quick Play** - one-tap replay
5. **Topic expansion** - number bonds, doubles, halves, squares
6. **Session pause/resume** - handle focus loss
7. **Rule-based topic suggestions** - "You haven't practiced 7× recently" (non-AI)
8. **Session summary copy refinement** - add "done for today" stopping cues

### P2 - Math Dash Coach (Full Feature)
1. **Data infrastructure for AI**:
   - Daily aggregates table for fast queries
   - Skill trend tracking (weekly snapshots)
   - AI data export function
   - Age-band benchmark definitions
2. Coach subscription infrastructure
3. Coach dashboard UI
4. AI integration for practice plan generation
5. Skill snapshot and progress timeline
6. Coach reports

### P3 - Advanced Features
1. **Dash Path / Checkpoint Trail** - visual journey progression
2. **Parent reminder system** - notification infrastructure
3. Teacher account system
4. Cloud sync and accounts
5. Adaptive "Smart Mode"
6. Class management

---

## Implementation Order Suggestion

**Phase 1: Polish MVP Core (1-2 weeks)**
- ~~Fix pricing~~ ✅ Done
- ~~Design & implement addition/subtraction setup flow (distinct from times tables grid)~~ ✅ Done - Number Range Selection
- ~~Fix data capture: save actual topic, config snapshot, given answers~~ ✅ Done
- Add parent email capture to checkout flow
- Set up basic email service (transactional)
- Add content locking
- ~~Enforce adult gate~~ ✅ Already implemented
- Complete settings
- ~~Add streak/goal UI shells~~ ✅ Streak UI complete

**Phase 2: Engagement Layer (1-2 weeks)**
- Weekly goals system (visual orbs for days practiced)
- Daily Dash entry point and guided session
- Achievement gallery
- Daily Dash challenge
- ~~Streak celebrations~~ ✅ Done - StreakDisplay handles milestones
- Session summary copy (stopping cues, encouragement)
- Rule-based "what to practice next" (non-AI)

**Phase 3: Topic & Content (1 week)**
- Number bonds modes
- Doubles/halves
- Square numbers
- Topic organization UI

**Phase 4: Coach Subscription (2-3 weeks)**
- Build data aggregation layer (daily stats, skill trends)
- Define age-band benchmarks for AI comparison
- Subscription infrastructure
- Coach dashboard
- AI integration
- Practice plans
- Coach report email delivery
- Email preference center

**Phase 5: Teacher & Sync (Future)**
- Dash Path visual journey
- Parent reminder/notification system
- Teacher accounts
- Class management
- Cloud sync
- Cross-device support

**Phase 6: Healthy Habit Loop Refinements (Ongoing)**
- Execute full Healthy Habit Loop review
- Implement copy/UX changes from review
- Analytics alignment with wellbeing metrics
- A/B testing for engagement patterns

---

*This document should be updated as features are completed. Use it to track progress and prioritize development work.*
