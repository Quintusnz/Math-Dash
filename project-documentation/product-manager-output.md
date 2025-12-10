# Ready Steady Math – Product Management Output

> **Note:** Ready Steady Math was previously referred to as 'Math Dash' in earlier internal drafts.

## Executive Summary

- **Elevator Pitch**: Ready Steady Math is a fast, fun browser game where kids race the clock answering math questions to master number facts a little more every day.
- **Problem Statement**: Children 6–11 need automatic recall of number facts (times tables, number bonds, etc.) to succeed in later math. Existing tools drill facts but often lack adaptivity, clear insight for adults, and modern engagement loops, leading to boredom and inconsistent practice. Teachers and parents need a simple, modern, kid-friendly tool that keeps practice going and makes strengths and weaknesses obvious at a glance.
- **Target Audience**:
  - Kids 6–11 (primary school, years 1–6 / KS1–KS2) using tablets, Chromebooks, or shared family devices.
  - Parents/caregivers (30–55) seeking short, effective math practice with clear progress.
  - Primary teachers needing a low-friction math fluency warm-up and basic analytics per pupil.
- **Unique Selling Proposition**:
  - Adaptive practice tuned per child, automatically.
  - Simple visual proficiency dashboard ("skill radar") for parents/teachers.
  - Light, modern engagement layer (streaks, goals, achievements) without over-gamification.
  - Web-first, cross-device experience (ideal for home and classroom Chromebooks).
  - Built from day one with classroom usage and multi-child households in mind.
- **Success Metrics**:
  - ≥ 60% of active children practise 3+ days/week after 4 weeks.
  - Median correct answers per 60s improves by ≥ 30% after 6 weeks of typical use.
  - NPS ≥ 40 from parent and teacher surveys.
  - ≥ 5% free-to-paid conversion in the first 3 months in a mature cohort.
  - ≥ 50 active classrooms (weekly use) in year one.

---

## Feature Specifications

Below: key features with user stories, acceptance criteria, priorities, dependencies, constraints, and UX considerations.

### Feature 1 – Core Dash Round Gameplay (P0)

- **User Story**: As a child learner, I want to play short, timed math rounds (one question at a time with quick taps) so I can build number fact fluency in a fun, low-friction way.
- **Acceptance Criteria**:
  - Given a selected profile, topic, and mode, when the player taps "Play", then a new session starts with a visible countdown (for timed modes) or question counter (for count modes).
  - Given a question on screen, when the player selects an answer, then the system immediately shows whether it is correct, highlights the correct answer, and moves to the next question after a short delay.
  - Given the timer reaches zero (timed) or the required number of questions is answered (count modes), when the session ends, then a summary screen appears showing total questions answered, correct/incorrect count, percentage accuracy, and whether this is a new personal best for that topic+mode.
  - Given the device loses focus (home button, tab change) during a round, when the player returns, then the system offers to resume or restart the session, with the timer paused during inactivity.
  - Given the app is offline, when the player starts or completes a round, then gameplay remains fully functional and the session is stored locally for later sync.
- **Priority**: P0 – Core to the product value; no MVP without this.
- **Dependencies**: Question generation engine, Topic library, basic state management, local storage, minimal analytics.
- **Technical Constraints**:
  - Target tap-to-feedback latency < 50ms; question transition < 500ms.
  - Must function reliably on mid-range Android tablets and Chromebooks.
- **UX Considerations**:
  - Large, clearly separated buttons appropriate for small hands.
  - Minimal text, playful but not distracting visuals.
  - Consistent positive/negative color scheme for correct/incorrect.
  - Encouraging micro-copy on results screens.

### Feature 2 – Topic & Skill Library (P0)

- **User Story**: As a parent/teacher, I want a library of topics (addition/subtraction facts, multiplication/division facts, number-bond style make-10/20/50 modes, doubles/halves, squares) so that I can target the areas my child or class needs to practise.
- **Acceptance Criteria**:
  - Given the user opens the Topics screen, when viewing the library, then topics are grouped by globally clear categories (Addition & Subtraction Facts, Multiplication Facts/Times Tables, Division Facts, Doubles & Halves, Square Numbers) with clear labels and optional teacher-friendly subtitles (e.g., “Make 10 (Number Bonds)” under Addition & Subtraction).
  - Given a topic is selected, when a round is started, then all questions follow the rules for that topic (e.g., 2× table uses multipliers 1-12 and factor 2; “Make 10 (Number Bonds)” uses pairs that total 10).
  - Given some topics are premium-only, when a free user sees the list, then premium topics are visibly locked and tapping them triggers an upgrade teaser instead of starting a round.
  - Given a new profile is created, when the Topics screen is first shown, then age-appropriate topics are suggested or pre-highlighted by default.
- **Priority**: P0 – Essential for targeting practice and future monetization boundaries.
- **Dependencies**: Core gameplay, topic generation logic, monetization flags.
- **Technical Constraints**:
  - Topics must be data-driven (configurable) rather than hard-coded, to allow expansion.
- **UX Considerations**:
  - Simple, scrollable list/grid; no dense tables.
  - Visual cues for difficulty and progress per topic.

### Feature 3 – Game Modes (P0)

- **User Story**: As a child, I want different modes (timed, fixed questions, practice) so I can choose how I want to be challenged.
- **Acceptance Criteria**:
  - Given the player is on the pre-game configuration screen, when choosing a mode, then the options include at least a 60s timed round, a shorter timed round, a fixed-question mode, and an untimed practice mode.
  - Given practice mode is selected, when the round is active, then there is no countdown timer and the player can end at any time with a clear "End" button.
  - Given a session completes, when the summary appears, then it indicates which mode was used.
- **Priority**: P0 – Part of the expected value and variety for MVP.
- **Dependencies**: Core gameplay, timer and counter logic.
- **Technical Constraints**: Modes must share as much code as possible to avoid fragmentation.
- **UX Considerations**:
  - Mode choice should not overwhelm; consider 2–3 main choices with advanced options behind a "More" link.

### Feature 4 – Player Profiles & Avatars (P0)

- **User Story**: As a family with more than one child, I want separate profiles so each child’s progress and streaks are tracked independently.
- **Acceptance Criteria**:
  - Given first app launch, when no profiles exist, then the user is prompted to create a profile before starting a game.
  - Given multiple profiles exist, when the app is opened, then a simple profile picker is shown with each profile’s avatar, name, and minimal progress snippet.
  - Given a profile is deleted from the grown-ups area, when the deletion is confirmed, then all associated progress, sessions, and achievements for that profile are removed from local storage.
- **Priority**: P0 – Critical for households and classrooms.
- **Dependencies**: Local storage, basic grown-ups section for profile management.
- **Technical Constraints**: Support at least 8 profiles per device; avoid performance issues from large data sets.
- **UX Considerations**:
  - Avatars should be simple and inclusive; no in-app purchases tied to avatars in MVP.
  - Deletion flow requires a clear warning and, ideally, adult gate.

### Feature 5 – Progress Dashboard (Skill Radar) (P0)

- **User Story**: As a parent/teacher, I want a visual summary of a child’s proficiency across topics so I can quickly see strengths and gaps.
- **Acceptance Criteria**:
  - Given a profile is selected, when navigating to "My Progress", then a grid/list of topics is displayed with a simple proficiency indicator (e.g., Weak/Developing/Secure/Advanced).
  - Given the child has enough history in a topic, when viewing that topic detail, then I see recent scores, best score, accuracy percentage, and last played date.
  - Given there is little or no data for a topic, when opening its detail view, then I see an empty-state message explaining that more practice is needed before accurate insight is available.
- **Priority**: P0 – Core differentiator and parent/teacher value.
- **Dependencies**: Game session logging, skill aggregation logic, profile system.
- **Technical Constraints**:
  - Aggregations must remain performant as local history grows.
- **UX Considerations**:
  - Visualisation should be clear, not overly complex; radar chart optional, simple bars or tiles acceptable.
  - Language kept simple for kids and clear for adults.

### Feature 6 – Adaptive Practice Mode (P1)

- **User Story**: As a child, I want the game to focus on the facts I find hardest so I can improve faster without configuring anything myself.
- **Acceptance Criteria**:
  - Given an adaptive mode is selected, when a round starts, then question selection is biased towards facts/topics where the child’s proficiency is below "Secure".
  - Given the child’s performance improves over time, when they continue using adaptive mode, then the distribution of questions gradually shifts to new weak areas or maintains variety once mastery is achieved.
  - Given the child has very little history, when adaptive mode is first used, then it behaves like a reasonable default sequence based on age band rather than failing or showing an error.
- **Priority**: P1 – Important differentiator but not MVP blocker.
- **Dependencies**: Progress data, topic/fact-level metrics, core gameplay.
- **Technical Constraints**: Algorithm must run locally, fast, and without complex backend dependencies for MVP.
- **UX Considerations**:
  - Labelled clearly (e.g., "Smart Dash") with a short explanation for adults.

### Feature 7 – Engagement Layer (Streaks, Goals, Achievements) (P1)

- **User Story**: As a child, I want streaks and badges so regular play feels rewarding; as a parent, I want simple daily goals to encourage consistent practice.
- **Acceptance Criteria**:
  - Given daily goals are enabled, when a child answers questions during the day, then their goal progress visibly fills up and reaching the goal triggers a simple celebration.
  - Given a child plays at least X questions on consecutive days, when checking their profile, then their streak count increases, with clear messaging when streaks are started or broken.
  - Given specific milestones are met (e.g., 100 correct answers total), when they occur, then achievements are unlocked and communicated via tasteful popups/badges.
- **Priority**: P1 – Drives retention and differentiation.
- **Dependencies**: Session logging, local date/time handling, profile system.
- **Technical Constraints**: Time-based logic must be robust to offline use and minor clock inconsistencies.
- **UX Considerations**:
  - Avoid pressuring or shaming language when streaks break.
  - Keep celebrations short and skippable.

### Feature 8 – Local Multiplayer "Dash Duel" (P2)

- **User Story**: As two siblings or classmates, we want to compete in quick head-to-head math races on the same device so practice feels more fun.
- **Acceptance Criteria** (high-level):
  - Given two profiles are selected, when Dash Duel is started, then each player sees their own questions, score, and timer on their half of the screen.
  - Given the duel ends, when the result screen appears, then it clearly indicates the winner or a tie.
- **Priority**: P2 – Nice-to-have; can significantly boost engagement but not required for MVP.
- **Dependencies**: Core gameplay, profile system, possibly premium gating.
- **Technical Constraints**: UI responsiveness with two active input zones; device screen size limits.

### Feature 9 – Accounts & Cloud Sync (P1–P2)

- **User Story**: As a parent or teacher, I want to access my child’s or class’s data across devices and over time so progress is not tied to a single tablet.
- **Acceptance Criteria** (concept-level):
  - Given an adult signs in or creates an account, when they link local profiles, then further sessions and progress sync to their account.
  - Given another device logs into the same adult account, when it loads, then the linked profiles and their progress become available after sync.
- **Priority**: P1–P2 depending on go-to-market; not mandatory for earliest MVP.
- **Dependencies**: Backend auth/storage, privacy and consent flows.

### Feature 10 – Monetization & Access Control (P0)

- **User Story**: As a parent, I want to clearly understand which content is free, what the one‑time upgrade unlocks, and how much it costs so I can make a quick, almost "no‑brainer" purchase decision.
- **Acceptance Criteria**:
  - Given the user browses topics or features, when some are premium, then they are consistently marked as locked and do not start without going through an adult-gated upgrade flow.
  - Given a free user is on the Topics screen, when they view multiplication facts, then tables 2, 3, and 4 are fully playable and higher tables (5-12) are visibly locked as part of the paid upgrade.
  - Given a free user browses other categories (division facts, addition/subtraction facts including Make 10/20/50 number bonds, doubles/halves), when they open them, then at least one starter topic in each category is free and the remainder are marked as part of the paid upgrade.
  - Given a parent opens the upgrade screen, when it loads, then it clearly communicates that the core upgrade is a low-cost, one-time unlock of all standard content/features (all tables, all basic topics, adaptive mode, Dash Duel, teacher tools for a limited number of classes, etc.).
  - Given AI-powered features are introduced in future, when a parent views those options, then they are clearly separated as an optional, low-cost recurring subscription layered on top of the one-time core app purchase.
  - Given a child is using the app, when they encounter premium content, then they cannot complete payment flows without adult gate completion.
- **Priority**: P0 – Required for a freemium, low-price/high-volume business model.
- **Dependencies**: Topic library, feature flags, payment integration, AI services (for future subscription layer).

---

## Requirements Documentation Structure

### 1. Functional Requirements

- **User Flows**:
  - First-time setup: choose/create profile → age band → default topic/mode → first round.
  - Returning child: profile select → quick play (last topic/mode) → results → suggested next action.
  - Parent: from home or Grown-Ups → select child → view progress dashboard → optionally adjust goals or explore premium.
  - Teacher (post-MVP): sign up → create class code → distribute to pupils → view class-level and per-pupil summaries.
  - Upgrade: attempt to access locked content → adult gate → upgrade explanation → optional payment → unlock and confirmation.

- **State Management Needs**:
  - Persistent local store for profiles, sessions, attempts, streaks, and achievements.
  - In-memory session state for current round (topic, mode, timer, questions answered).
  - Sync state (if accounts enabled) tracking what has been pushed/pulled.

- **Data Validation Rules**:
  - Profile names 1–20 chars, trimmed.
  - Age band must be in a defined set.
  - Each generated question must have exactly one correct answer and no duplicate options.
  - Streak calculation uses calendar days with a minimum question threshold.

- **Integration Points**:
  - Analytics (event logging) for usage and learning outcomes.
  - Payment providers (Stripe / app stores) for premium unlock.
  - Authentication and storage APIs for cloud sync.

### 2. Non-Functional Requirements

- **Performance Targets**:
  - Initial load ≤ 3s on mid-range mobile over 4G.
  - Tap-to-feedback latency < 50ms; session summary display < 1s.
- **Scalability Needs**:
  - Client storage to handle thousands of sessions per device.
  - Backend that scales to 10k–100k MAU without rearchitecture.
  - Cost structure that supports a low-price, high-volume one-time purchase model for core features, with margins protected by gating expensive AI workloads behind **discrete, paid credit packs** instead of a mandatory subscription.
- **Security Requirements**:
  - HTTPS for all network traffic; no plain HTTP.
  - Minimal PII collection; no required child email/surname.
  - Data deletion options for parents/teachers (per profile, per account).
- **Accessibility Standards**:
  - Target WCAG 2.1 AA for contrast and control sizes.
  - Screen reader labels for key actions.
  - No rapid flashing or potentially harmful animations.

### 3. User Experience Requirements

- **Information Architecture**:
  - Top nav/structure: Play, Topics, My Progress, Grown-Ups, Settings.
  - Child-only flows avoid exposing account/payment details.

- **Progressive Disclosure Strategy**:
  - Child-facing main path: Play → Round → Summary; optional topic/mode change.
  - Adult features (goals, upgrades, analytics opt-out, class management) behind Grown-Ups section with gate.

- **Error Prevention Mechanisms**:
  - Confirmation dialogs for destructive actions (profile delete, data reset).
  - Visual differentiation of locked features to prevent frustrating dead ends.
  - Safe defaults for new users (age-appropriate topics, simple mode).

- **Feedback Patterns**:
  - Immediate, consistent visual and audio feedback on answers.
  - Encouraging result summaries with reference to progress (e.g., "You improved your accuracy" or "New best score").
  - Lightweight toasts or banners for sync/payment success or failure.

---

## Critical Questions Checklist

- [x] **Existing solutions were improving upon?**
  - Hit the Button, TTRS, Mathletics, Sumdog, etc. Ready Steady Math focuses on being lighter, more adaptive, and more transparent about progress.
- [x] **Minimum viable version?**
  - Core gameplay (single-player timed and practice modes), topic library (key tables, bonds, doubles/halves), basic profiles, simple progress dashboard, and a clear but minimal freemium boundary.
- [x] **Potential risks or unintended consequences?**
  - Over-gamification overshadowing learning.
  - Streaks creating anxiety when broken.
  - Misconfigured adaptivity frustrating learners.
  - Data and privacy concerns for children.
- [x] **Platform-specific requirements?**
  - Must perform well in Chrome on Chromebooks and mobile browsers.
  - Future native wrappers must comply with app store policies for children’s apps.
- [x] **Gaps needing more clarity from stakeholders?**
  - Exact free vs paid topic and feature split. **(Updated)**: Free tier includes full access to a small starter set in each category (e.g., multiplication tables 2, 3, 4; one starter division topic; Make 10 number bonds and simple missing-number facts; basic doubles/halves). The paid one-time upgrade unlocks all remaining standard topics (5–12 tables, broader division facts, Make 20/50/100 and other addition/subtraction facts, higher doubles/halves), adaptive mode, Dash Duel, and teacher tooling for a limited number of classes.
  - Target markets (home first vs school first) and pricing model. **(Updated)**: Initial target is both home and school in parallel (parents and primary teachers), with a low-cost, one-time purchase for the core app aimed at being a "no-brainer" decision. AI-powered features, if/when launched, will sit on top as an optional, low-cost **credit pack model** (e.g., bundles of AI analyses) to cover ongoing AI and infra costs without requiring a recurring subscription.
  - Prioritisation of teacher features vs consumer features for early releases. **(Partially answered)**: MVP must not lag on home use; early teacher support should focus on easy wins (class codes, simple dashboards) while keeping the core child/parent experience first-class.
  - Level of sophistication desired for adaptivity in phase 1. **(Updated)**: Phase-one adaptivity should be heuristic-based (e.g., simple rules using recent accuracy and volume per fact/topic) and run entirely client-side—no complex ML models or heavy backend requirements initially.

---

## Pricing & Packaging Proposal (Draft)

- **Core Positioning**:
  - Low-friction, low-cost **one-time purchase** for all core non-AI features (all standard topics, modes, teacher tools for a small number of classes).
  - Optional **AI add-on subscription** for advanced insights and personalised support, priced to cover ongoing AI and hosting costs.

- **Home (Family) License – Core App**:
  - Target Tier 1 markets (US/UK/EU/AU/NZ) reference prices as a one-time purchase:
    - **USD $6.99** (United States)
    - **GBP £5.99** (United Kingdom)
    - **EUR €6.99** (Eurozone)
    - **AUD A$10.99** (Australia)
    - **NZD NZ$11.99** (New Zealand)
  - License covers all child profiles in a household across devices tied to the same store account/email.
  - Lower-income regions can later be supported with regional prices at roughly 50–70% of Tier 1 levels.

- **Teacher / Small-School License – Core App**:
  - Simple per-teacher license (Tier 1 markets) as a one-time purchase:
    - **USD $19.99** (United States)
    - **GBP £17.99** (United Kingdom)
    - **EUR €19.99** (Eurozone)
    - **AUD A$29.99** (Australia)
    - **NZD NZ$32.99** (New Zealand)
  - Unlocks teacher features (class codes, class dashboards) for a limited number of classes (e.g., 2–3 classes, ~60–90 pupils).
  - Future: add volume discounts or site licenses once demand from larger schools is validated.

- **AI Add-On (Future) – Credit Packs**:
  - Instead of a recurring subscription, AI-powered features are unlocked via **credit packs** (e.g., 5, 10, 25 AI analyses per pack) that can be used over time.
  - Each "credit" represents one AI action such as: analysing a child’s recent performance and generating a tailored practice plan; or performing a deeper class-level analysis for a teacher.
  - Pricing can start with low-cost packs (e.g., a small one-time add-on for a handful of analyses) to keep the decision lightweight and aligned with the one-time purchase philosophy.
  - Once credits are exhausted, users can continue using the full non-AI experience and choose to top up when they want more AI support.

- **Launch & Trial Strategy**:
  - Consider a **launch discount** (e.g., 20–30% off the one-time core price for first 3–6 months) to reduce friction.
  - Provide a **small number of free AI credits** to early adopters so they can experience AI-powered analyses before deciding whether to buy additional packs.

- **Business Model Alignment**:
  - Core app: aimed at **high volume, low price**, making it an almost "no-brainer" purchase for parents and teachers.
  - AI: fenced behind optional credit packs so AI compute costs scale with revenue on a per-use basis, without committing users to a subscription.

---

This document is intended as a product-facing companion to the implementation-ready requirements in `requirements2.md`. It can be used with designers and engineers to align on scope, priorities, and UX principles for Ready Steady Math's MVP and early iterations.
