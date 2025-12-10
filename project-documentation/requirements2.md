# Ready Steady Math – Detailed Requirements Specification

> **Note:** Ready Steady Math was previously referred to as 'Math Dash' in earlier internal drafts.

> Version: 0.1-draft  
> Source PRD: `Docs/math-dash-prd-updated.md`  
> Scope: MVP + near-term P1 features as defined in PRD

---

## 0. Document Map

This specification is part of a broader documentation set:

- Product & UX context:
  - `Docs/product-overview.md` – product narrative and success metrics.
  - `Docs/user-personas.md` – primary users and their goals.
  - `Docs/user-flows.md` – end-to-end journeys for children, parents, and teachers.
  - `Docs/information-architecture.md` – navigation and content hierarchy.
- Design system & visual language:
  - `Docs/Math Dash Color Spec.txt` – full color palette and usage.
  - `design-documentation/design-system/overview.md` – layout, typography, core patterns.
  - `design-documentation/design-system/components.md` – key screens and component specs.
  - `design-documentation/design-system/tokens/colors.md` – color tokens for implementation.
  - `design-documentation/accessibility/guidelines.md` – accessibility standards and patterns.
- Technical & analytics:
  - `Docs/technical-architecture.md` – high-level client and backend architecture.
  - `Docs/analytics-spec.md` – event model and data principles.
- Requirements indices:
  - `Docs/acceptance-criteria-index.md` – centralised acceptance criteria.

This file focuses on implementation-ready functional and non-functional requirements.

---

## 1. Scope & Objectives

### 1.1 In-Scope (MVP)
- Core dash-style math gameplay (single-player, timed rounds).
- Topic & skill library (number facts for ages ~6–11).
- Basic game modes (timed, question-count, practice).
- Local player profiles (multiple children per device) with avatars.
- Per-child progress dashboard ("Skill Radar").
- Freemium access control and basic monetization hooks (no full payment integration spec here).
- Basic analytics events (for usage and learning metrics).

### 1.2 Near-Term (Post-MVP, Included for Design Readiness)
- Adaptive practice engine (per-child difficulty tuning).
- Engagement systems: streaks, daily/weekly goals, achievements.
- Optional adult accounts and class/teacher accounts (conceptual only, detailed spec later).
- Local multiplayer (Dash Duel) high-level requirements.

### 1.3 Out of Scope (This Document)
- Detailed backend architecture and deployment design.
- Full payment integration flows for every platform.
- Detailed legal/compliance documentation (COPPA, GDPR-K texts, privacy policy content).

---

## 2. Domain Model

### 2.1 Key Entities

- `PlayerProfile`
  - `id` (string/UUID) – unique per profile and device.
  - `displayName` (string, 1–20 chars, trimmed; no emojis required support).
  - `ageBand` (enum: `Y1-2`, `Y3-4`, `Y5-6`, `Other`).
  - `avatarId` (string/enum referencing a pre-defined avatar list).
  - `createdAt` (timestamp).
  - `lastActiveAt` (timestamp).
  - `preferences` (object):
    - `defaultMode` (enum: `Timed60`, `Question20`, `Practice`).
    - `defaultTopicId` (string; must resolve in Topic Library).
    - `soundEffectsEnabled` (boolean, default true).
    - `hintsEnabled` (boolean, default true for younger age bands).

- `Topic`
  - `id` (string; globally unique, e.g., `mul_2x`, `bonds_10`).
  - `name` (string; user-facing, e.g., "2x Table").
  - `category` (enum: `AdditionSubtractionFacts`, `MultiplicationFacts`, `DivisionFacts`, `DoublesHalves`, `SquareNumbers`, `Mixed`).
  - `ageBandRecommended` (enum or range; used for defaults, not hard constraints).
  - `isPremium` (boolean; true if locked behind paywall).
  - `description` (short string used in teacher/parent views).

- `SkillMetric`
  - Represents aggregated performance per `(playerId, topicId)`.
  - `playerId` (string).
  - `topicId` (string).
  - `questionsAnswered` (int, total across all time).
  - `correctAnswers` (int).
  - `bestScoreTimed60` (int; max correct in a 60s session).
  - `bestAccuracy` (float, 0–1) for any session with ≥10 questions.
  - `lastPlayedAt` (timestamp).
  - `proficiencyBand` (enum: `Weak`, `Developing`, `Secure`, `Advanced`).

- `GameSession`
  - `id` (string/UUID).
  - `playerId` (string).
  - `topicId` (string).
  - `mode` (enum: `Timed30`, `Timed60`, `Timed120`, `Question10`, `Question20`, `Practice`).
  - `startedAt` (timestamp).
  - `endedAt` (timestamp, nullable until completed/abandoned).
  - `durationSeconds` (int; actual time active, not wall clock).
  - `questionsTarget` (nullable int for question-count modes).
  - `questionsAnswered` (int).
  - `questionsCorrect` (int).
  - `isCompleted` (boolean – true when player reaches timer zero or question target, or explicitly ends).
  - `wasAbandoned` (boolean – true if app lost focus/closed without resume).

- `Question`
  - Generated, not stored persistently (except in `QuestionAttempt`).
  - `id` (string/UUID) – optional for analytics.
  - `prompt` (string; e.g., "7 × 8 = ?").
  - `correctAnswer` (int or string depending on type).
  - `options` (array of 3–6 answers, one and only one correct).
  - `topicId` (string; must reference `Topic`).

- `QuestionAttempt`
  - `id` (string/UUID).
  - `sessionId` (string).
  - `questionId` (string/UUID) or `questionSeed` if generated deterministically.
  - `topicId` (string).
  - `prompt` (string snapshot).
  - `selectedAnswer` (string or number).
  - `isCorrect` (boolean).
  - `respondedAt` (timestamp).
  - `responseTimeMs` (int; from question appearing to tap).

- `Achievement` (for engagement layer, P1)
  - `id` (string; `100_correct_answers`, `streak_7_days`, etc.).
  - `name` (string; user-facing).
  - `description` (string).
  - `category` (enum: `Volume`, `Accuracy`, `Streak`, `Mastery`).
  - `criteria` (structure defined by implementation – e.g., threshold, topic, streak length).

- `PlayerAchievement`
  - `playerId` (string).
  - `achievementId` (string).
  - `unlockedAt` (timestamp).

---

## 3. Functional Requirements by Feature

### 3.1 Feature 1 – Core Dash Round Gameplay (P0)

#### 3.1.1 User Stories
- As a child learner, I want to play short, timed math rounds with one question on screen at a time so I can build number fact fluency while having fun.
- As a parent/teacher, I want rounds to be simple to start and understand so that kids can play independently.

#### 3.1.2 Core Behaviour
- `FR-1.1` The system SHALL support starting a `GameSession` for a selected `PlayerProfile`, `Topic`, and `mode`.
- `FR-1.2` When a session starts, the system SHALL initialize a countdown timer for timed modes (`Timed30`, `Timed60`, `Timed120`) with the correct number of seconds.
- `FR-1.3` For question-count modes, the system SHALL initialize a `questionsTarget` and track remaining questions.
- `FR-1.4` The system SHALL continuously present exactly one `Question` at a time with 3–6 answer options.
- `FR-1.5` The system SHALL visually distinguish the selected option during tap and prevent double submissions.
- `FR-1.6` Upon answer selection, the system SHALL determine correctness and provide immediate feedback (≤ 150ms end-to-end on a mid-range device):
  - Correct: highlight correct answer in a positive color and optionally play a success sound.
  - Incorrect: highlight selected answer in error color and also highlight the correct answer for ≥ 0.6s.
- `FR-1.7` After feedback (≤ 1s for incorrect; ≤ 0.4s for correct), the system SHALL automatically proceed to the next question unless the session is completed.
- `FR-1.8` The timer SHALL continue running while feedback is displayed (unless design chooses to pause for fairness; decision must be consistent across all questions).
- `FR-1.9` When the timer reaches zero or the question count target is reached, the system SHALL immediately end the session and show a summary screen.
- `FR-1.10` The summary screen SHALL include at minimum:
  - Total questions answered.
  - Number and percentage correct.
  - Time played (for timed modes, the configured duration).
  - Personal best indicator (e.g., "New best score!" if `questionsCorrect` exceeds previous best for that topic+mode).
- `FR-1.11` The player SHALL be able to replay the same configuration or return to main menu from the summary screen.

#### 3.1.3 Question Generation
- `FR-1.12` Questions SHALL be generated according to the selected `Topic` rules (see 3.2 for Topic requirements).
- `FR-1.13` Every `Question` SHALL have exactly one correct answer and at least two incorrect distractors.
- `FR-1.14` Distractors SHALL be generated such that:
  - None equals the correct answer.
  - Distractors are plausible (e.g., within ±10 of correct answer for number fact questions) to avoid obvious guessing.
- `FR-1.15` The system SHOULD avoid presenting the exact same question-prompt and options combination twice in a row within a single session.

#### 3.1.4 Pausing, Backgrounding and Errors
- `FR-1.16` If the app loses focus (e.g., OS home button, tab change) during a session:
  - The session timer SHALL pause.
  - On return, the player SHALL be shown a modal offering "Resume" or "Restart".
- `FR-1.17` If the app is closed or crashes during a session, the session MAY be recorded as `wasAbandoned=true` and excluded from personal best calculations.
- `FR-1.18` Any network disconnection SHALL NOT prevent local gameplay; offline sessions SHALL be stored locally and synced later if cloud sync is enabled.

#### 3.1.5 Non-Functional (Gameplay-specific)
- `NFR-1.1` Touch input to visual feedback latency SHOULD be < 50ms on target devices.
- `NFR-1.2` The game loop SHOULD run at 60fps where possible; minimum 30fps in worst cases.
- `NFR-1.3` The question-to-question transition SHALL not exceed 500ms in normal conditions.

---

### 3.2 Feature 2 – Topic & Skill Library (P0)

#### 3.2.1 User Stories
- As a child, I want to easily choose which tables or number facts to practise so that I feel in control of my learning.
- As a parent/teacher, I want a clear list of topics so I can target specific areas (e.g., addition/subtraction facts, 7x table, make 10/20).

#### 3.2.2 Topic Catalogue
- `FR-2.1` The system SHALL expose a structured catalogue of `Topic` entries grouped by globally clear categories: Addition & Subtraction Facts (including number-bond style modes), Multiplication Facts (Times Tables), Division Facts, Doubles & Halves, and Square Numbers.
- `FR-2.2` For MVP, the minimum topics SHALL include:
  - Multiplication facts: `2x` through `12x` as separate topics and a mixed 1-12x mode.
  - Division facts: inverse of the above multiplication tables.
  - Addition & Subtraction facts: Make 10/20/50 (Number Bonds), Make 100, and missing-number facts to at least 20 (stretch to 100).
  - Doubles and halves: doubles/halves to 20 (stretch to 100).
  - Square numbers: squares up to at least `10x10` (stretch to `12x12`).
- `FR-2.2a` The free tier SHALL include at least the following starter topics:
  - Multiplication: 2x, 3x, and 4x tables (plus their division counterparts).
  - Addition & Subtraction: Make 10 (Number Bonds) and simple missing-number facts to 10.
  - Doubles/halves: simple doubles and halves up to at least 10.
- `FR-2.2b` The paid one-time upgrade SHALL unlock:
  - All remaining standard multiplication tables (5x–12x) and their division counterparts.
  - Extended number-bond style modes (e.g., Make 20/50/100) and extended doubles/halves ranges (to 100).
  - Square numbers to 10x10 or 12x12.
  - Any additional standard topics added post-MVP, unless explicitly designated as free.
- `FR-2.3` Each topic entry SHALL define generation rules, including:
  - Operand ranges (e.g., `2 x 1..12`).
  - Allowed operators (x, ÷, +, –).
  - Answer type (integer only for MVP).
- `FR-2.4` Topics marked `isPremium=true` SHALL appear visibly locked to free users with a consistent lock icon or badge.
- `FR-2.5` When a locked topic is tapped by a free user, the system SHALL show an upgrade teaser modal (see Monetization, section 3.10).
- `FR-2.6` Clarifying note: terms like "number bonds" and "doubles and halves" are surfaced as mode names or subtitles within the Addition & Subtraction Facts (or Doubles & Halves) categories so that parents and kids see globally clear headings first, while teachers still recognise the specialist terminology.

#### 3.2.3 Topic Selection and Defaults
- `FR-2.7` Topic selection UI SHALL show:
  - Topic name.
  - Simple visual category indicator (color or icon).
  - For players with history, a small indicator of progress (e.g., `Weak/OK/Strong`).
- `FR-2.8` When a new `PlayerProfile` is created, the system SHALL automatically suggest age-appropriate default topics (e.g., Make 10 for `Y1-2`, 2x–5x tables for `Y3-4`).
- `FR-2.9` The system SHALL remember the last selected topic per `PlayerProfile` and present it as the default on next visit.

---

### 3.3 Feature 3 – Game Modes (P0)

#### 3.3.1 User Stories
- As a child, I want different types of rounds (timed, fixed questions, practice) so that I can challenge myself in different ways.

#### 3.3.2 Modes & Behaviour
- `FR-3.1` The system SHALL support at least the following modes:
  - `Timed60` – 60-second countdown.
  - `Timed30` – 30-second countdown.
  - `Question10` – ends after 10 questions answered.
  - `Question20` – ends after 20 questions answered.
  - `Practice` – untimed endless mode.
- `FR-3.2` Mode selection SHALL be available on the pre-game configuration screen.
- `FR-3.3` The UI SHALL present at most 3 mode choices simultaneously for simplicity; additional mode variants can be tucked behind an "More Options" control.
- `FR-3.4` For `Practice` mode:
  - The system SHALL not show a countdown timer.
  - The system SHALL allow the player to end the session at any time via a clearly labeled button (e.g., "End practice").
  - A summary screen SHALL still be shown when ending.
- `FR-3.5` For `Timed` and `Question-count` modes, the summary screen SHALL clearly display which mode was used.

---

### 3.4 Feature 4 – Player Profiles & Avatars (P0)

#### 3.4.1 User Stories
- As a family with multiple children, I want separate profiles so that each child's progress is tracked independently.
- As a child, I want to pick a fun avatar so that the game feels personal.

#### 3.4.2 Profile Management
- `FR-4.1` The system SHALL support at least 8 `PlayerProfile` entries per device.
- `FR-4.2` On first app launch, if no profiles exist, the system SHALL prompt the user to create a profile before gameplay.
- `FR-4.3` Creating a profile SHALL require:
  - `displayName`.
  - `ageBand` selection.
  - Optional avatar selection (default avatar pre-selected).
- `FR-4.4` Profile creation SHALL validate:
  - Name is 1–20 characters after trimming whitespace.
  - Name does not consist solely of whitespace.
- `FR-4.5` The system SHOULD warn (but not hard-block) when a new profile name matches an existing one.

#### 3.4.3 Profile Selection
- `FR-4.6` On subsequent launches, the app home screen SHALL present a profile chooser when more than one profile exists.
- `FR-4.7` For a single profile, the system MAY auto-select it and show a quick play CTA (e.g., "Play").
- `FR-4.8` Profile tiles SHALL show:
  - Avatar.
  - Name.
  - Simple progress summary (e.g., most-played topic and proficiency band).

#### 3.4.4 Profile Deletion & Data Handling
- `FR-4.9` A profile management screen SHALL allow deletion of a profile.
- `FR-4.10` Deleting a profile SHALL require a confirmation step with a clear warning that all progress will be removed from that device.
- `FR-4.11` On deletion, all related `GameSession`, `QuestionAttempt`, `SkillMetric`, and `PlayerAchievement` data MUST be deleted from local storage.

---

### 3.5 Feature 5 – Progress Dashboard (Skill Radar) (P0)

#### 3.5.1 User Stories
- As a parent/teacher, I want a quick visual summary of a child’s strengths and weaknesses (e.g., 2x vs 7x tables, make-10/20 facts) so I can focus practice time.
- As a child, I want to see my progress so that I stay motivated.

#### 3.5.2 Dashboard Overview
- `FR-5.1` The system SHALL provide a "My Progress" screen per `PlayerProfile`.
- `FR-5.2` This screen SHALL show a list or grid of topics relevant to that profile.
- `FR-5.3` For each topic, the UI SHALL display:
  - Topic name.
  - `proficiencyBand` (Weak, Developing, Secure, Advanced) represented via simple color or icon.
  - Optional small sparkline or arrow indicating recent trend (improving, stable, declining).
- `FR-5.4` The system SHALL compute `proficiencyBand` using at least:
  - Accuracy over the last N (`≥ 30`) recent questions.
  - Volume of questions attempted.
  - Optional speed metric (average `responseTimeMs`).
- Suggested default thresholds (implementation may tune):
  - `Weak`: < 60% accuracy OR < 30 questions answered.
  - `Developing`: 60–80% accuracy and ≥ 30 questions.
  - `Secure`: 80–95% accuracy and ≥ 50 questions.
  - `Advanced`: > 95% accuracy and ≥ 100 questions.

#### 3.5.3 Topic Detail View
- `FR-5.5` Tapping a topic entry SHALL open a topic detail view showing:
  - Best score for key mode (e.g., `Timed60`).
  - Recent scores (e.g., last 5 sessions for that topic).
  - Accuracy trend (e.g., line chart or bar chart).
  - Last played date/time.
- `FR-5.6` If insufficient data exists (e.g., < 10 questions answered), the view SHALL show an encouraging empty state (e.g., "You haven’t practised this yet. Try a 60s round!").

#### 3.5.4 Data Integrity
- `FR-5.7` Only completed sessions (`isCompleted=true` and `wasAbandoned=false`) SHALL contribute to personal best and key progress metrics.
- `FR-5.8` Abandoned or extremely short sessions (e.g., < 3 questions answered) SHOULD be excluded from trend calculations by default.

---

### 3.6 Feature 6 – Adaptive Practice Mode (P1)

#### 3.6.1 User Stories
- As a child, I want the game to get harder when I do well and easier when I struggle so that I stay in the sweet spot of challenge.
- As a parent/teacher, I want practice sessions to emphasize a child’s weak facts without me configuring them manually.

#### 3.6.2 Core Behaviour
- `FR-6.1` The system SHALL provide an "Adaptive" mode (e.g., "Smart Dash") available from the play screen.
- `FR-6.2` Phase-one adaptivity SHALL be implemented using simple, transparent heuristics rather than complex machine-learning models.
- `FR-6.3` When starting an adaptive session, the system SHALL:
  - Identify topics where `proficiencyBand` is `Weak` or `Developing`.
  - For each selected topic, identify specific facts (e.g., 7×8) with low accuracy or no attempts using recent history (e.g., last 50–100 attempts) and simple counters.
- `FR-6.4` Questions in adaptive mode SHALL:
  - Appear more frequently for weak or unseen facts.
  - Appear less frequently for facts already `Secure` or `Advanced`.
- `FR-6.5` The question selection algorithm SHALL:
  - Use tunable weightings per mastery band (e.g., 60% weak, 30% developing, 10% secure) expressed as simple probability weights or frequencies.
  - Guarantee some variety so that the player still sees a mix of facts.

#### 3.6.3 Fallback Behaviour
- `FR-6.6` If a player has insufficient history (e.g., < 50 total questions across topics), adaptive mode SHALL fall back to a default topic mix based on age band.
- `FR-6.7` The UI SHALL clearly indicate adaptive mode is "learning about you" during early use.

---

### 3.7 Feature 7 – Engagement Layer (Streaks, Goals, Achievements) (P1)

#### 3.7.1 User Stories
- As a child, I want streaks and achievements so that I feel rewarded for regular practice.
- As a parent, I want simple daily/weekly goals so that practice becomes a habit.

#### 3.7.2 Daily/Weekly Goals
- `FR-7.1` The system SHALL support a per-profile daily goal defined in terms of "questions answered" (default: 50 questions/day).
- `FR-7.2` Optionally, a weekly goal MAY be computed automatically (e.g., dailyGoal × 5 days).
- `FR-7.3` Progress towards goals SHALL update in real time during play (e.g., progress bar on summary screen or home screen card).

#### 3.7.3 Streaks
- `FR-7.4` A "streak day" SHALL be counted when a player answers at least X questions (default 30) in any sessions on a local calendar day.
- `FR-7.5` A streak SHALL be defined as consecutive streak days with no gaps.
- `FR-7.6` The system SHALL store `currentStreak` and `bestStreak` per profile.
- `FR-7.7` Local device date SHALL be used; if date changes while app is running, logic MUST handle boundary cases (e.g., play across midnight).
- `FR-7.8` Timezone changes or manual date changes SHOULD NOT be exploited to game streaks; conservative logic (only increasing streak once per real day) SHOULD be applied where feasible.

#### 3.7.4 Achievements
- `FR-7.9` The system SHALL define a small initial set of achievements, e.g.:
  - "First session".
  - "100 correct answers".
  - "5-day streak".
  - "Mastered 2× table" (e.g., `Secure` or better with ≥100 questions answered).
- `FR-7.10` Achievements SHALL be unlocked when criteria are met and stored as `PlayerAchievement` records.
- `FR-7.11` Unlocking an achievement SHALL trigger an in-app celebration (popup, confetti, etc.) that does not interrupt in-flight gameplay excessively.
- `FR-7.12` An "Achievements" section in the profile or progress view SHALL list unlocked achievements and optionally some locked ones, with clear labels.

---

### 3.8 Feature 8 – Local Multiplayer "Dash Duel" (P2)

High-level only; detailed spec can extend this.

- `FR-8.1` The system SHALL support a two-player mode where two `PlayerProfile`s compete simultaneously on one device.
- `FR-8.2` Screen SHALL be split into two vertical halves (or equivalent) with independent questions, timers, and answer buttons.
- `FR-8.3` Each player’s questions SHALL be based on their selected topic/mode (or a shared configuration if chosen by adults).
- `FR-8.4` The mode SHALL end when a shared timer expires or a shared number of questions has been reached.
- `FR-8.5` The winner SHALL be determined by correct answers (with tie-handling UI).
- `FR-8.6` Optionally, a "handicap" parameter MAY reduce the difficulty or extend the time for a weaker player.

---

### 3.9 Feature 9 – Accounts & Cloud Sync (P1–P2, High-Level)

- `FR-9.1` The system SHALL support optional adult accounts that can aggregate multiple child `PlayerProfile`s across devices.
- `FR-9.2` For teachers, the system SHALL support creating a simple `Class` entity with a `classCode` that pupils use to join.
- `FR-9.3` When signed in, `GameSession`, `QuestionAttempt`, `SkillMetric`, and engagement data SHALL be synced to a backend service.
- `FR-9.4` Sync MUST be conflict-aware: local play during offline periods SHALL be reconciled with server state using timestamps and additive merges where possible.
- `FR-9.5` User PII SHALL be minimized; child profiles SHALL not require surnames or email addresses.

---

### 3.10 Feature 10 – Monetization & Access Control (Freemium) (P0)

#### 3.10.1 User Stories
- As a parent, I want to understand clearly what is free and what is paid so that I can decide whether to upgrade without pressure.
- As a business, we want a clear path from free usage to a reasonable paid tier.

#### 3.10.2 Free vs Paid Content
- `FR-10.1` The product SHALL define a core set of free topics and modes (e.g., some times tables, practice mode) available without payment or login.
- `FR-10.2` Premium content MAY include additional topics, adaptive mode, Dash Duel, advanced analytics, or advanced achievements.
- `FR-10.3` All locked content SHALL be visually marked with a consistent lock icon/badge.

#### 3.10.3 Upgrade Flow
- `FR-10.4` When a user taps a locked item, the system SHALL show an upgrade modal containing:
  - Simple explanation of what the premium plan unlocks.
  - Clear pricing and billing period (once integrated with payments).
  - A "Not now" or close option that returns to previous context.
- `FR-10.5` Upgrade flows MUST be adult-gated. Examples:
  - A simple arithmetic question adults answer.
  - A permission gate requiring reading and holding a button.
- `FR-10.6` Payment interactions SHALL hand off to platform-native payments (e.g., browser Stripe checkout, App Store/Play Billing) rather than custom card fields inside the core child UX.

#### 3.10.4 AI Credit Packs (Post-MVP, Non-Core)

The following requirements describe an optional, post-MVP AI add-on that is purchased as **credit packs**. These are not part of the initial MVP scope but should be considered in the architecture.

- `FR-10.7` The system SHALL support an optional AI credit balance per adult account (home or teacher) representing a count of available AI-powered analyses.
- `FR-10.8` Each AI-powered action (e.g., generating a tailored practice plan based on recent performance, or analysing a class’s results) SHALL consume exactly one or more credits, as defined by product configuration.
- `FR-10.9` When a user has AI credits available, eligible AI-enhanced actions (e.g., "Ask AI to analyse this progress") SHALL be visibly available from relevant views (such as a child’s progress screen or a teacher’s class dashboard).
- `FR-10.10` When an AI-enhanced action is invoked and completes successfully, the system SHALL decrement the credit balance accordingly and persist the result (e.g., practice plan or analysis summary) so it remains viewable even after credits are exhausted.
- `FR-10.11` When a user attempts an AI-enhanced action with insufficient credits, the system SHALL show a non-blocking prompt explaining that AI credits are empty and offering a route to purchase additional credit packs (subject to adult gating and platform payment policies).
- `FR-10.12` Purchase of AI credit packs SHALL follow the same adult-gated upgrade rules as core monetization (see `FR-10.4`–`FR-10.6`), and must not be accessible directly from child-only flows.

---

## 4. Cross-Cutting Functional Requirements

### 4.1 Analytics & Telemetry
- `FR-A.1` The system SHALL log key events for aggregate analytics, including:
  - App opened / closed.
  - Profile created/deleted.
  - Session started/ended (with topic, mode, duration, results).
  - Achievement unlocked.
  - Upgrade modal shown / upgrade started / upgrade completed.
- `FR-A.2` Event payloads SHALL avoid storing PII beyond pseudonymous IDs and user-provided profile names.
- `FR-A.3` An opt-out mechanism for analytics SHOULD be provided in adult settings.

### 4.2 Offline Behaviour
- `FR-O.1` Core gameplay (all free single-player modes) MUST be fully functional offline.
- `FR-O.2` Data created offline SHALL be persisted locally and marked for sync.
- `FR-O.3` If sync fails, the app SHALL retry gracefully without blocking gameplay.

### 4.3 Error Handling
- `FR-E.1` For recoverable errors (e.g., analytics failure, sync failure), the app SHALL: 
  - Log error locally.
  - Show non-intrusive feedback (e.g., small toast) only when necessary.
- `FR-E.2` For non-recoverable errors (e.g., corrupted local data), the system SHALL:
  - Attempt safe fallback (e.g., reset profile or specific datasets).
  - Inform adult users through the grown-ups area, not in the core child flow where possible.

---

## 5. Non-Functional Requirements (NFR)

### 5.1 Performance
- `NFR-P.1` Time-to-interactive for initial load SHOULD be ≤ 3 seconds on a mid-range mobile device over 4G.
- `NFR-P.2` Navigating from home screen to starting a session SHOULD take ≤ 1 second after first load.
- `NFR-P.3` Progress dashboard queries and rendering SHOULD complete within 500ms for typical datasets.

### 5.2 Scalability
- `NFR-S.1` Client-side storage design SHALL support at least:
  - 8 profiles.
  - 10,000 `GameSession` records per device.
- `NFR-S.2` If cloud sync is implemented, backend MUST support at least 100k MAU with typical math fluency usage patterns.

### 5.3 Security & Privacy
- `NFR-Sec.1` All network communication involving user data MUST be encrypted (HTTPS/TLS 1.2+).
- `NFR-Sec.2` Minimal PII SHALL be collected by default; child emails or surnames are not required.
- `NFR-Sec.3` Local storage SHOULD be obfuscated to make casual tampering harder, while recognizing that full cheating prevention is not a goal.
- `NFR-Sec.4` A clear "Delete all data" option for a profile or account MUST be provided.

### 5.4 Accessibility
- `NFR-A11y.1` The UI SHALL meet WCAG 2.1 AA contrast guidelines for text and key interactive elements.
- `NFR-A11y.2` All tappable controls SHALL have a target size of at least 44 × 44 px.
- `NFR-A11y.3` Screen reader labels SHALL be provided for all buttons and key icons.
- `NFR-A11y.4` Non-essential animations SHOULD be subtle and avoid rapid flashing.

### 5.5 Internationalisation
- `NFR-I18n.1` The product SHALL support at least English initially and be architected to support multiple languages in the future.
- `NFR-I18n.2` All user-facing strings SHALL be managed via a localization system, not hard-coded in logic.

---

## 6. UX & Information Architecture

### 6.1 Top-Level Navigation

Minimum navigation structure:
- `Play` – start a quick session with last-used configuration.
- `Topics` – choose/change topic and mode.
- `My Progress` – per-profile dashboard.
- `Grown-Ups` – adult-only settings, goals, upgrade, and account management.
- `Settings` – sound, accessibility, app info (may live inside Grown-Ups on some platforms).

### 6.2 Progressive Disclosure
- Child-facing screens SHALL show only essential options (topic, mode, play).
- Advanced options such as custom goals, class codes, and analytics opt-out SHALL live behind the `Grown-Ups` section.

### 6.3 Error Prevention & Feedback
- Destructive actions (profile deletion, data reset) MUST require explicit confirmation.
- Locked content MUST be visually distinct so children do not experience repeated rejections.
- Immediate feedback for correct/incorrect answers MUST be clear and consistent.
- Summary screens SHOULD offer short, encouraging messages based on performance (e.g., "Great job! You beat your best score").

---

## 7. Open Questions & Risks

- **Adaptive algorithm tuning**: exact thresholds, decay functions, and per-topic weighting need empirical tuning; initial defaults may be naive.
- **Streak integrity**: preventing streaks from being gamed without complex backend time validation may be challenging; we accept some risk for MVP.
- **Freemium boundaries**: which specific topics/modes are free vs paid remains a product/monetization decision.
- **Teacher features**: classroom analytics and roster management will need a separate, deeper spec once MVP adoption validates demand.

---

## 8. Success Metrics Mapping

- Increased correct answers/minute and reduced error rate → derived from `GameSession` + `QuestionAttempt` logs.
- Engagement metrics (3+ days/week play, median streak) → derived from streak data and session timestamps.
- Business metrics (conversion, classrooms) → derived from upgrade events and class account usage once implemented.

This requirements document is intended to be implementation-ready for the MVP scope (Features 1–5, 10) and design-ready for subsequent P1 features (6–7, 9, 8 at high level).
