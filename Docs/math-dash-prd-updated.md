# Ready Steady Math - Product Requirements & Specification

> **Note:** Ready Steady Math was previously referred to as 'Math Dash' in earlier internal drafts.

**Version:** 2.2  
**Last Updated:** December 2025  
**Status:** Active

---

## Document Change Log

This section summarises the major changes and additions made in this version of the PRD.

### Changes & Additions (December 2025 - v2.2)

1. **New Feature: Curriculum Alignment & Progress Tracking (Section 4, Feature 10)** – New feature
   - Added comprehensive curriculum alignment feature specification
   - Enables parents/teachers to see child's progress vs local curriculum expectations
   - Supports 5 countries: New Zealand, Australia, UK, USA, Canada
   - Profile includes optional country and year/grade selection
   - Dashboard displays "On Track", "Ahead", or "Needs Focus" status
   - Grown-Ups area shows detailed skill-by-skill curriculum progress
   - Data-driven architecture allows easy addition of new countries

2. **Ready Steady Math Coach – Curriculum-Aligned Insights (Section 12.3.5)** – New subsection
   - Coach now references curriculum benchmarks in insights and recommendations
   - Country-specific messaging using local terminology
   - Curriculum progress included in monthly Coach reports
   - Celebrates skills ahead of expectations, gently highlights priority areas

3. **Analytics – Curriculum-Specific Events (Section 13.3)** – New subsection
   - Added curriculum-related analytics events
   - CURRICULUM_COUNTRY_SET, CURRICULUM_PROGRESS_VIEWED, CURRICULUM_STATUS_CHANGED
   - Track curriculum skill progression for validation

4. **Supporting Documentation**
   - Created `Docs/curriculum-alignment-implementation-plan.md` – Full technical implementation plan
   - Created `Docs/curriculum-linear-issues.md` – Work breakdown for Linear
   - Referenced `Docs/Cirriculum` – Curriculum research and skill framework

### Changes & Additions (November 2025 - v2.1)

1. **Ethical Engagement & Child Wellbeing (Section 8)** – New section
   - Added comprehensive ethical design framework for engagement mechanics
   - Defined core design principles: learning-first, short sessions, consistency over binge usage
   - Specified allowed engagement mechanics (mastery indicators, weekly goals, personal bests)
   - Listed prohibited patterns (gambling-like rewards, harsh streaks, FOMO, public leaderboards)
   - Added session structure requirements (5-10 minute "Daily Dash" target)
   - Defined notification constraints (parent-controlled, opt-in only)
   - Established copy and tone guidelines for child-facing content
   - Aligned analytics metrics with wellbeing goals

### Changes & Additions (November 2025 - v2.0)

1. **Business Model & Pricing (Section 11)** – Complete rewrite
   - Clarified the three-tier monetisation model: Free tier → One-time Core unlock → Optional "Ready Steady Math Coach" subscription
   - Updated Home/Family Core unlock price to **US$6.99** (one-time)
   - Confirmed Teacher Core unlock price at **US$19.99** (one-time)
   - Added **Ready Steady Math Coach** parent subscription: **US$2.99/month** or **US$23.99/year**
   - Documented AI credit packs as a secondary, optional path for subscription-averse parents
   - Added hybrid monetisation approach with medium-term review strategy

2. **New Feature: Ready Steady Math Coach (Section 12)** – New section
   - Complete feature specification for the parent AI subscription
   - Defined target user, value proposition, and job-to-be-done
   - Specified V1 core capabilities: skill snapshot, guided practice plan, progress over time, parent-facing explanations
   - Defined non-goals for V1
   - Added user flows for Coach upgrade and dashboard

3. **Analytics, Data & AI Requirements (Section 13)** – Extended
   - Added Coach-specific data capture requirements
   - Defined AI interaction requirements for generating parent-facing summaries and practice plans
   - Specified safety and tone requirements for AI-generated content

4. **KPIs & Success Metrics (Section 14)** – Extended
   - Added subscription-specific KPIs: Coach attach rate, retention/churn, ARPU, MRR
   - Added upgrade funnel metrics
   - Added engagement impact metrics for Coach subscribers

5. **Business Model Viability (Section 15)** – New subsection
   - Summarised financial impact of Coach subscription on 5-year projections
   - Referenced external financial model for detailed analysis

6. **Future Roadmap & Open Questions (Section 16)** – Updated
   - Added questions about AI credit pack sunset strategy
   - Added potential Teacher/School Coach subscription
   - Added deeper adaptive difficulty and curriculum-aligned proficiency paths

---

## 1. Problem-First Framing

### 1.1 Problem Analysis

**Core problem:**
Children aged ~5-11 need fast, engaging ways to build automatic recall of number facts (addition, subtraction, multiplication, division). Existing tools like Hit the Button are effective but have gaps:

- Limited adaptivity – difficulty does not automatically adjust to the child.
- Progress insight is shallow – hard for parents/teachers to see where a child struggles at a glance.
- Engagement is static – few modern game mechanics (streaks, quests, progression).
- Little personalization – content and goals are not tailored to each child.
- Weak classroom features – teachers have limited tools to manage groups and track progress.

**Who feels this most:**
- **Primary:** Kids 6-11 who get bored easily and need a simple, fun loop to keep practising.
- **Secondary:** Parents who want to see clear evidence of progress and focus practice on weak areas.
- **Secondary:** Primary school teachers who need quick, reliable fluency practice with simple analytics.

### 1.2 Solution Validation - Why Ready Steady Math?

Ready Steady Math is a browser-based, cross-platform math fluency game inspired by Hit the Button and similar apps, but redesigned to:

- Keep the core quick-fire, one-tap gameplay that works.
- Add adaptive practice that reacts to performance.
- Provide clear, visual dashboards for parents/teachers.
- Introduce modern engagement mechanics (streaks, daily goals, challenges).
- Support classroom usage from day one (profiles, simple group tracking).

**Alternatives & differentiation:**
- **Hit the Button / Twinkl Rapid Math Practice:** Excellent core mechanic; weaker on adaptivity and whole-child view. Ready Steady Math differentiates on personalization, analytics, and engagement.
- **Times Tables Rock Stars, Mathletics, Sumdog:** Strong platforms but heavy, subscription-based, and more complex. Ready Steady Math positions as a lightweight, quick-start, premium tool with a razor focus on fluency.

### 1.3 Impact Assessment - What Changes for Users?

We measure success across learning, engagement, and business:

**Learning impact:**
- Increase in correct answers per minute per child over 4-8 weeks.
- Reduction in error rate for target skills (e.g., 7× table).

**Engagement:**
- D1, W1, and M1 retention of active child profiles.
- Average weekly questions answered per active child.
- Streaks maintained (e.g., % of kids with 3+ day streak).

**Business:**
- Conversion rate from free to paid (Core unlock).
- Coach subscription attach rate among paying parents.
- Active schools/classrooms using Ready Steady Math.
- Cost per engaged learner (for paid acquisition).

---

## 2. Executive Summary

**Elevator Pitch:**
Ready Steady Math is a fast, fun game where kids race the clock to answer math questions and level up their skills a little bit every day.

**Problem Statement:**
Ready Steady Math helps kids master math facts — addition and subtraction facts (including number-bond style make-10/20/100), multiplication facts / times tables, division facts, doubles and halves, and square numbers — through quick, one-minute challenges. Many apps drill facts but do not adapt to each child, show clear progress to adults, or keep kids coming back consistently. Teacher-facing documentation may still use UK/Commonwealth terms like "number bonds" or "doubles and halves" for clarity, but the app surfaces them under globally clear headings such as "Addition & Subtraction Facts" so parents and kids know what to pick at a glance.

**Target Audience:**

**Kids (6-11)**
- Primary students (Years 1-6 / KS1-KS2).
- Can read basic numbers and simple instructions.
- Use tablets, Chromebooks, laptops, or phones.

**Parents/Caregivers (30-55)**
- Want short, effective practice activities.
- Want evidence of progress.
- Need guidance on where their child is struggling and what to focus on next.

**Teachers (Primary, Years 1-6)**
- Use Ready Steady Math as a 5-10 minute warm-up or homework tool.
- Need quick set-up and basic tracking per pupil.

**Unique Selling Proposition (USP):**
1. **Adaptive Dash Engine:** Difficulty auto-adjusts per child.
2. **Visual Progress Radar:** Shows strengths and gaps per topic/table.
3. **Ready Steady Math Coach:** Optional AI-powered guidance for parents with clear practice plans.
4. **Built-in Engagement Layer:** Streaks, goals, challenges.
5. **Web-first, Cross-Device:** Browser-based, PWA-friendly.
6. **Teacher-Friendly:** Lightweight classroom mode and analytics.

**Success Metrics (Top-Level):**
- 60% of active children practise 3+ days/week after 4 weeks.
- Median correct answers per 60s improves by 30% after 6 weeks.
- NPS 40+ for parents and teachers.
- Free to paid (Core unlock) conversion 5%+ in first 3 months.
- Coach subscription attach rate ≥10% of paying parents in Year 1.
- 50+ active classrooms in first year.

---

## 3. Personas

### Persona 1 - Jake, 8, Reluctant Maths Kid
- **Age:** 8 (Year 3)
- **Devices:** Shared tablet, classroom Chromebook.
- **Goals:** Feel competent in times tables; enjoy quick, simple games.
- **Pain points:** Bored by text-heavy apps; discouraged by constant difficulty.

### Persona 2 - Sarah, 38, Busy Parent
- **Age:** 38, working parent.
- **Devices:** Phone, family tablet.
- **Goals:** 10-15 min meaningful practice; clear evidence of progress; simple guidance on what to focus on next.
- **Pain points:** Overwhelmed by complex platforms; dislikes ads and confusing subscriptions; doesn't have time to interpret dashboards or create practice plans herself.

### Persona 3 - Mr. Patel, 32, Year 4 Teacher
- **Age:** 32.
- **Devices:** Classroom PCs/Chromebooks, laptop, projector.
- **Goals:** Quick warm-up activities; see which pupils struggle with which facts.
- **Pain points:** No time for complex setup; mixed devices in class.

---

## 4. Feature Specifications

**Priority legend:**
- **P0** - Must-have for MVP
- **P1** - Important, post-MVP
- **P2** - Nice-to-have / later

### Feature 1: Core Dash Round Gameplay (P0)

**User Story:**
As a child learner, I want to play short, timed math rounds (one question at a time, quick taps) so I can build fluency in a fun way.

**Acceptance Criteria (summary):**
- Timed round (e.g. 60s) with single question and multiple answers per screen.
- Correct answers increment score and move instantly to next question.
- Incorrect answers show brief error + highlight correct answer.
- End of round shows score, accuracy, personal best.
- If device loses focus/offline mid-round, round is paused with option to resume/restart.

**Dependencies:** Question generation engine, UI layout, timer.
**Constraints:** Sub-50ms response to taps; aim for 60fps.
**UX:** Large buttons, minimal text, high contrast, low visual noise.

### Feature 2: Topic & Skill Library (P0)

- Library organized by globally clear categories:
  - Addition & Subtraction Facts (includes number-bond style modes like Make 10/20/50/100 and missing-number facts).
  - Multiplication Facts (Times Tables).
  - Division Facts.
  - Doubles & Halves (fast addition/subtraction/multiplication/division by 2).
  - Square Numbers (e.g., squares up to 10×10 or 12×12).
- Sub-levels/modes examples: "Make 10 (Number Bonds)", "Make 20 (Number Bonds)", "Make 50 (Number Bonds)", "Make 100", "1-12× mixed tables", "Doubles to 20", "Halves to 100", "Squares to 12×12".
- Per-profile remembered recent topics.
- Locked topics clearly indicated with upgrade prompt.

### Feature 3: Game Modes (P0)

- **Timed mode:** 30/60/120s.
- **Question-count mode:** 10, 20 questions, etc.
- **Practice mode:** untimed, continuous feedback.
- Safe defaults and simple mode switching.

### Feature 4: Player Profiles & Avatars (P0)

- Multiple child profiles with name, age band, avatar.
- Profile chooser on app start.
- Profile deletion wipes local data with confirmation.
- Limits for shared school devices to prevent overload.

### Feature 5: Progress Dashboard ("Skill Radar") (P0)

- Per-child view summarising strengths and gaps.
- Grid/radar of skills (e.g. addition/subtraction facts including number-bond modes, times tables, division facts, squares) with simple proficiency indicator.
- Tap skill for detail: recent scores, best score, trend.
- Friendly empty state when no data.

### Feature 6: Adaptive Practice Mode (P1)

- Smart mode adjusting difficulty based on performance.
- Increases difficulty after strong results; revisits weak facts more often.
- Falls back to default distributions when insufficient history.

### Feature 7: Engagement Layer (Streaks, Goals, Achievements) (P1)

- Daily/weekly goals (e.g. 50 questions per day).
- Streaks for consecutive practice days.
- Achievements for milestones (e.g. 1000 correct answers).
- Guardrails around time/date handling.

### Feature 8: Local Multiplayer "Dash Duel" (P2)

- Two-player head-to-head mode on one device.
- Split screen with independent questions and scores.
- Optional handicap for mixed ability.

### Feature 9: Accounts & Cloud Sync (P1-P2)

- Optional adult accounts for cross-device sync.
- Teacher accounts with class codes.
- Offline-first design with conflict-safe sync.

### Feature 10: Curriculum Alignment & Progress Tracking (P1)

**User Story:**
As a parent or teacher, I want to see how my child's math fluency compares to typical expectations for their age and country, so I can understand if they are on track and where to focus practice.

**Core Capabilities:**

- **Country and Year/Grade Selection:**
  - Profile includes optional country selection (NZ, AU, UK, US, CA – extensible).
  - Year/grade is auto-derived from age band with manual override.
  - Uses local terminology (Year 1-6 for NZ/AU/UK, Grades K-5 for US/CA).

- **Curriculum Benchmark Comparison:**
  - Each country/year combination defines expected "core skills" and "extension skills".
  - Skills are mapped to game modes and mastery data.
  - System calculates proficiency for each curriculum skill.

- **Progress Status Display:**
  - Dashboard shows compact status badge: "On Track", "Ahead", or "Needs Focus".
  - Grown-Ups area shows detailed curriculum progress view.
  - Per-skill breakdown with proficiency indicators (Not Started → Developing → Proficient → Mastered).

- **Curriculum-Aligned Recommendations:**
  - Practice suggestions prioritise curriculum-required skills.
  - Coach AI references curriculum expectations in reports.
  - Focus areas highlight specific skills needing attention.

**Acceptance Criteria:**
- Profile creation includes optional country/year selection step.
- Dashboard displays curriculum status badge for profiles with country set.
- Grown-Ups area shows detailed skill-by-skill curriculum progress.
- System correctly calculates proficiency by aggregating mastery records to skill level.
- Supports 5 countries initially (NZ, AU, UK, US, CA) with architecture for easy expansion.
- Coach insights reference curriculum benchmarks for subscribed parents.

**Dependencies:** Progress Dashboard, Mastery Tracker, Profile system, Coach AI (for enhanced insights).

**Technical Notes:**
- Curriculum data stored as JSON configuration (data-driven, not code-driven).
- Adding new countries requires only data changes, no code changes.
- Skill-to-game-mode mapping configuration links curriculum skills to actual game content.
- Caching strategy for curriculum calculations to maintain performance.

**Related Documentation:**
- `Docs/Cirriculum` – Full curriculum research and skill framework.
- `Docs/curriculum-alignment-implementation-plan.md` – Technical implementation plan.

---

## 5. Functional Requirements

### Key User Flows (summary)

- **First-time parent/child setup:** choose parent or kid, create profile, pick topic/mode, start first round.
- **Returning child:** profile select, quick play, results, and suggestion for next topic.
- **Parent dashboard:** gated access, select child, view dashboard, adjust goals and defaults.
- **Coach subscription flow:** parent sees Coach upsell, views benefits, completes subscription, accesses Coach dashboard.
- **Teacher classroom (phase 2):** teacher sign-up, class code, pupils join, teacher views basic metrics.
- **Upgrade flow:** tap locked content, see benefits, adult gate, payment, unlock.

### State Management

**Entities:** PlayerProfile, GameSession, QuestionAttempt, SkillMetric, Achievement, CoachSubscription, PracticePlan.

**Clear events:** START_SESSION, END_SESSION, ANSWER_QUESTION, UNLOCK_ACHIEVEMENT, SYNC_SUCCESS, COACH_SUBSCRIBED, PRACTICE_PLAN_GENERATED.

### Data Validation

- Profile names 1-20 chars.
- Age bands constrained.
- Questions always have exactly one correct answer; no duplicate options.
- Streak logic uses local calendar days with defined rules.

### Integrations

- **Analytics:** event-based (see Section 13).
- **Payments:** Stripe/web, App Store/Play Billing for Core unlock and Coach subscription.
- **Auth/storage (phase 2):** minimal PII, secure storage.
- **AI service:** for Coach features (see Section 12).

---

## 6. Non-Functional Requirements

### Performance

- Initial meaningful load within 3 seconds on mid-range mobile over 4G.
- Tap-to-feedback under 50ms.
- Dashboard load under 500ms typical.
- Coach dashboard load under 1 second.

### Scalability

- Mostly client-side; backend for auth, sync, payments, and AI.
- Scales to 10k-100k MAU in first phase.

### Security

- Minimal PII, encrypted at rest and in transit.
- Clear data deletion and parental control mechanisms.
- No targeted ads; compliance with COPPA/GDPR-K principles.
- Coach data (child performance summaries) handled with same privacy standards.

### Accessibility (WCAG 2.1 AA target)

- Adequate contrast.
- Keyboard navigation for desktop.
- Screen reader labels on buttons.
- No harmful flashing.

---

## 7. UX Requirements

### Information Architecture

- Play, Topics, My Progress, Grown-Ups/Teacher Area, Settings.
- **Coach dashboard** nested within Grown-Ups area for subscribers.

### Progressive Disclosure

- Simple default flows for kids.
- Advanced options and teacher tools behind "More options" and adult gates.
- Coach features surfaced only to subscribed parents.

### Error Prevention

- Disabled actions until required inputs selected.
- Confirms destructive actions.
- Clear offline indicators.

### Feedback Patterns

- Immediate visual feedback for correctness.
- Simple, encouraging post-round messages.
- Visual progress (stars, badges, mastery levels).
- Light system toasts for sync/payment events.
- Coach: clear, encouraging summaries; no overwhelming data dumps.

---

## 8. Ethical Engagement & Child Wellbeing

### 8.1 Purpose

Ready Steady Math is explicitly designed to build children's fluency with basic number facts through **short, regular practice**, not to maximise screen time or exploit persuasive design. This section defines the **engagement philosophy**, **allowed mechanics**, and **prohibited patterns** to ensure that:

- Children are **motivated to return** for ~5–10 minutes of focused practice on most days.
- Engagement mechanics are **transparent, predictable, and skill-based**.
- The app **supports healthy digital habits**, respects attention and emotional wellbeing, and keeps **parents/caregivers in control**.

This section is normative: all feature ideas must be consistent with these principles.

### 8.2 Core Design Principles

1. **Learning-first**
   Engagement mechanics must primarily reinforce **real learning behaviours**: consistent practice, effort, and mastery of skills (e.g., number facts), rather than arbitrary time spent in-app.

2. **Short, contained sessions**
   The product should naturally guide children toward **5–10 minute "Daily Dash" sessions**. Longer play is allowed but never pushed. The default loop is: **log in → focused practice → clear end → encouragement to return another day**.

3. **Consistency over binge usage**
   Design for **days-per-week of practice** rather than long continuous sessions. A child who practises 3–5 days a week for a few minutes is considered "successful use".

4. **No dark patterns, no manipulation**
   The app must **not** use engagement patterns that:
   - Rely on fear of loss (e.g., harsh "you lost your streak" messaging).
   - Create artificial urgency or FOMO.
   - Use gambling-like randomness (loot boxes, spin wheels) to drive repeat use.

5. **Positive, non-punitive feedback**
   Children must never be shamed or penalised for:
   - Missing a day.
   - Performing poorly in a session.
   - Being "behind" other children.
   
   Feedback focuses on **effort, improvement, and next steps**.

6. **Parent and teacher control**
   Adults remain in control of:
   - Notifications and reminders.
   - Access to progress data.
   - Optional classroom/cohort features.
   
   Children are not directly targeted with aggressive prompts to return.

7. **Calm, focused experience**
   Visual design and copy should be **fun and encouraging**, but not hyper-stimulating. Minimal distractions during timed gameplay; rewards are **clear and predictable**, not overwhelming.

### 8.3 Allowed Engagement Mechanics

The following mechanics are **approved** and should form the core of the engagement layer.

#### 8.3.1 Mastery & Progression

**Skill mastery indicators** (Required)
- Each key skill (e.g., "7× table", "Number bonds to 20") has a visible mastery state (e.g., 1–3 stars or a mastery ring).
- Criteria are fixed and transparent (e.g., accuracy + speed thresholds over a defined number of questions).

**Dash Path / Checkpoint Trail** (Recommended)
- Completing a Daily Dash session advances a simple path or trail (e.g., 1 step per day).
- Progress along the path is **monotonic** (no going backwards for missed days).

**Achievement badges** (Recommended)
- Badges for:
  - Skill mastery ("Fluent in 2 tables").
  - Effort ("Answered 100 questions").
  - Consistency ("Practised 3 days this week").
- Badges must be **earned only via clear conditions**, never random drops.

#### 8.3.2 Habits & Goals

**Weekly practice goals** (Required)
- Default model: "Practise on **N days per week**" (e.g., 3 days).
- Represented visually (e.g., 3 large orbs that fill when daily practice is completed).
- No penalty for missing specific days; the focus is on meeting the weekly count.

**Daily Dash challenge** (Recommended)
- A small, optional challenge card guiding a 5–10 minute session, e.g., "Today's Dash: 2 rounds of 7× table + 1 round of mixed tables."
- Completing the Daily Dash contributes to weekly goals and mastery, but not via time-based grinding.

#### 8.3.3 Self-Competition, Not Social Pressure

**Personal bests** (Required)
- Track and show "best score", "best streak of correct answers", or similar **for the individual child only**.
- Messaging: "You beat your own best today" rather than "You beat X other players".

**Class/teacher view (future)** (Recommended constraint)
- If classroom features are implemented, allow teachers to see **aggregate class progress** (e.g., total questions answered) rather than ranking individual children.

### 8.4 Prohibited & Restricted Mechanics

The following are **not allowed** in Ready Steady Math due to ethical and wellbeing considerations:

1. **Gambling-like or variable-ratio reward systems**
   - Loot boxes, spin wheels, or any system where rewards are randomised to encourage "just one more try."
   - "Jackpot" style visual/audio feedback designed to mimic gambling machines.

2. **Harsh, fragile streak systems**
   - Daily streaks that reset with strong negative feedback ("You lost your 15-day streak") are not permitted.
   - No messaging centred on fear or guilt for missing a day.

3. **Time-limited offers and FOMO**
   - "Only available today", countdown timers, or limited-time items intended to create anxiety about missing out.

4. **Competitive public leaderboards for children**
   - No global leaderboards or public rankings of children by performance.

5. **Aggressive, child-directed notifications**
   - No push notifications targeted directly at child devices with urgent language or repeated "nagging".

6. **Virtual currencies for engagement**
   - No coins, gems, or spendable currencies whose primary purpose is to keep children grinding for more.

Any proposal that introduces one of the above must be rejected or redesigned to comply with this section.

### 8.5 Session Structure & Time Use

#### 8.5.1 Default Session Length

The "Daily Dash" flow must be designed to last approximately **5–10 minutes**, by default:
- Example: 3 × 60-second rounds plus a short summary screen.

#### 8.5.2 End-of-Session Behaviour

After the default session, the app:
- Shows a **simple summary** (progress, improvements, badges earned).
- Reinforces stopping as a positive choice, e.g., "Awesome work for today. Your brain remembers better with breaks. See you tomorrow!"

#### 8.5.3 Additional Play

- Children may choose to continue playing voluntarily (e.g., "Play another round").
- The UI and copy **must not** pressure them to continue ("Don't stop now!", flashing prompts, etc.).

### 8.6 Notifications & Reminders

#### 8.6.1 Parent-Configured Reminders Only

- Notification settings live in a **Grown-ups area**, secured by a simple gate (e.g., birth year or PIN).
- Parents can:
  - Enable/disable reminders.
  - Choose frequency (e.g., 0–1 per day, X days per week).
  - Set times (e.g., after school).

#### 8.6.2 Notification Content Constraints

- Tone: neutral/positive, low-pressure, addressed to the parent, e.g.: "This could be a good 5-minute Ready Steady Math moment with Sam."
- No:
  - "Your streak is in danger."
  - "Only 2 hours left to get today's reward."
  - "Come back now!"

#### 8.6.3 No Default Nagging

- Reminders are **opt-in**, not forced on first install.
- No in-app banners that repeatedly interrupt play to push more usage.

### 8.7 Social & Competitive Features

#### 8.7.1 Individual Use (Current Scope)

In the core product, all progress displays are **child-specific** and not visible to other players.

#### 8.7.2 Future Classroom / Multi-Child Features

If implemented:
- Only **aggregated statistics** may be shared (e.g., "Our class answered 1,200 questions this week").
- No ranking children by name or avatar on public leaderboards.
- No mechanics where performing poorly is publicly visible to peers.

### 8.8 Parent & Teacher Controls

The app must provide a **Grown-ups view** that allows adults to:

- See **high-level progress** (e.g., Skill Radar, weekly practice days, strengths/gaps).
- Configure **reminders** and optionally set **weekly practice goals**.
- Access a clear explanation of:
  - What engagement mechanics exist.
  - Why they were chosen.
  - How to support healthy usage at home or in class.

This view should be designed in plain language so non-technical adults can understand and trust how the app engages their child.

### 8.9 Copy & Tone Guidelines

All in-app copy, especially messages directed at children, must follow these guidelines:

**Encourage effort and growth**
- Example: "You're getting faster at 3×. Let's practise 7× again another day."

**Normalise mistakes and breaks**
- Example: "That one was tricky. Brains grow when we practise tough ones."

**Avoid pressure and fear**
- No references to "failing", "losing everything", or blaming the child for missed days.

**Model healthy digital habits**
- Use Dashy and other in-app characters to occasionally reinforce ideas like:
  - "A quick Dash each day is enough."
  - "Time for a break – great job today!"

### 8.10 Analytics & Metrics Aligned with Wellbeing

Product analytics around engagement must align with this ethical stance.

**Primary engagement metric:**
- Number of **active days per week per child** (e.g., "practised 3+ days this week"), not time-on-device.

**Secondary metrics:**
- Average **session length** (targeting 5–10 minutes).
- Improvement in **accuracy and speed** by skill over time.
- Distribution of usage times (e.g., heavy late-night usage should be rare in our target age group).

**Not primary goals:**
- Maximising total minutes per user per week.
- Driving children to open the app many times per day.

Any optimisation work (A/B tests, UX tweaks) must be evaluated against **both** learning impact and this ethical framework.

### 8.11 Compliance & Review

This section should be treated as a **non-negotiable constraint** for the design, development, and optimisation of Ready Steady Math. Any new feature proposal touching engagement or retention must explicitly confirm alignment with these principles before implementation.

---

## 9. Critical Questions Checklist (with answers)

- **Existing solutions?** Yes: Hit the Button, TTRS, Mathletics, etc. We improve adaptivity, dashboards, engagement, and simplicity.
- **MVP?** Core gameplay, topics, basic modes, profiles, simple dashboard, and monetization (Core unlock). Coach subscription follows shortly after MVP.
- **Risks?** Over-gamification, privacy, teacher UX complexity, mis-tuned adaptivity, subscription fatigue. Mitigated with simple design, minimal data, teacher feedback loops, transparent logic, low-cost optional subscription positioning, and strict ethical engagement principles (see Section 8).
- **Platform requirements?** Web/PWA plus native wrappers; school Chromebooks; app store policies for kids apps.

---

## 10. Traceability to Business Objectives

**Business Objectives:**
1. Become a trusted, modern alternative in math fluency.
2. Establish a profitable business model with one-time purchases and optional subscription revenue.
3. Build a foundation to extend to advanced math content and teacher/school offerings.

**Feature Mapping:**
- **Objective 1:** Features 1-5.
- **Objective 2:** Features 7, Section 11 (Core unlock), and Section 12 (Ready Steady Math Coach).
- **Objective 3:** Features 2, 6, 9, Section 8 (Ethical Engagement), and future Teacher Coach.

---

## 11. Business Model & Pricing

### 11.1 Monetisation Overview

Ready Steady Math operates a **one-time paid core app** with an **optional low-cost AI subscription** for parents. The model is designed to be simple, transparent, and family-friendly.

**Three-tier model:**

1. **Free Tier** – Try before you buy
2. **One-time Core Unlock** – Full game access (Home or Teacher)
3. **Optional "Ready Steady Math Coach" Subscription** – AI-powered parent guidance (plus optional one-off AI credit packs as a secondary path)

### 11.2 Free Tier

**What's included:**
- Access to a starter set of topics in each category:
  - Multiplication: 2×, 3×, 4× tables.
  - At least one starter division topic.
  - Number bonds: bonds to 10.
  - Doubles/halves: simple doubles/halves up to at least 10.
- Access to core modes (timed, practice) for those topics.
- Offline play for all free content.
- Basic progress tracking per profile.

**Purpose:** Allow families and teachers to experience the core gameplay loop before committing to purchase.

### 11.3 Core Unlock (One-Time Purchase)

#### Home / Family Core Unlock

- **Price:** US$6.99 one-time (with room to move to US$7.99 later as the product and brand mature)
- **Regional equivalents (Tier 1):**
  - GBP £5.99
  - EUR €6.99
- **Regional pricing (Tier 2/3):** ~50-70% of Tier 1 pricing

**What's included:**
- Unlocks all standard topics:
  - All multiplication tables (5×–12×) and their division counterparts.
  - Extended number bonds (Make 20, Make 50, Make 100).
  - Advanced doubles/halves.
  - Square numbers.
- Adaptive Practice Mode.
- Local multiplayer "Dash Duel".
- Full progress dashboard for all children in the household.

**Licence terms:** One household, multiple children. A single purchase covers all child profiles on devices associated with that household.

#### Teacher Core Unlock

- **Price:** US$19.99 one-time per teacher account (for individual teachers paying out-of-pocket)
- **Regional equivalents (Tier 1):**
  - GBP £17.99
  - EUR €19.99

**What's included:**
- Everything in Home/Family Core.
- Teacher tools for a limited number of classes.
- Basic class-level progress views.

**Future consideration:** Volume discounts and site licences for schools once demand is validated.

### 11.4 Ready Steady Math Coach – Parent Subscription

**Overview:**
A low-cost, optional AI subscription for parents that transforms gameplay data into clear insights and guided practice plans.

**Pricing:**
- **Monthly:** US$2.99/month
- **Annual:** US$23.99/year (≈US$2/month, positioned as "2 months free")

**Regional equivalents (Tier 1):**
- Monthly: GBP £2.49 / EUR €2.99
- Annual: GBP £19.99 / EUR €23.99

**Licence terms:** Per household (all children in that family), not per child. A single subscription covers Coach features for all child profiles.

**What's included:**
- Full Ready Steady Math Coach feature set (see Section 12 for detailed specification):
  - Skill snapshot per child
  - AI-generated weekly practice plans
  - Progress over time visualisations
  - Monthly/termly coach reports
  - Parent-facing explanations of strengths and gaps

**Prerequisite:** Requires Core unlock (Home/Family). Coach is an add-on, not a standalone product.

### 11.5 AI Credit Packs (One-Off)

**Purpose:** An optional, secondary path for subscription-averse parents who want occasional "deep-dive" AI reports without committing to a subscription.

**Pricing:**
- **Parent Insight Pack:** US$4.99 for ~50 analysis credits
- **Teacher Class Insight Pack:** US$14.99 for ~200 analysis credits

**What credits can be used for:**
- One-off detailed skill analysis reports.
- Term-end or holiday progress summaries.
- Deep-dive reports on specific skill areas.

**Important notes:**
- Credit packs are positioned as a secondary option; Coach subscription is the primary AI offering.
- Credits do not expire but are non-refundable.
- Longer term, we may sunset credit packs if Coach adoption is strong and credits create confusion (see Section 11.6).

### 11.6 Hybrid Monetisation Approach

**Short term (Launch → Year 1):**
We are running a hybrid model to learn user preferences:
- One-time Core unlock (primary revenue driver)
- Optional AI credit packs (for occasional deep-dive reports)
- Optional Coach subscription (for ongoing guidance and analytics)

**Medium term (Year 1+ review):**
We will review real adoption patterns:
- If most AI value flows through the subscription and credits see low, infrequent usage, we may:
  - Phase out credit packs for new users.
  - Move to a simplified "Core + Coach" model.
  - Honour all existing credit purchases indefinitely.
- If credit packs show meaningful usage among a distinct segment (e.g., teachers, occasional users), we may retain them alongside Coach.

**Decision criteria for review:**
- Coach attach rate vs credit pack purchase rate
- Repeat credit purchase behaviour
- Support burden from credit-related confusion
- Revenue contribution from each path

### 11.7 Upgrade UX Requirements

**General principles:**
- All locked content clearly marked with lock icon.
- Tapping locked content shows upgrade modal with:
  - Clear explanation of benefits.
  - Pricing (or "Learn more" link).
  - "Not now" option that returns to previous context.
- All upgrade flows must be adult-gated.
- Use platform-native payments (Stripe for web, App Store/Play Billing for native apps).

**Coach upsell triggers:**
- After several sessions of play, parent sees prompt in Grown-Ups area.
- Example: "We've spotted some useful patterns in Alex's results. Unlock Ready Steady Math Coach to get a simple weekly plan and clear overview of their progress."
- Non-intrusive; shown at natural pause points, not mid-gameplay.

---

## 12. Ready Steady Math Coach (Parent AI Subscription)

### 12.1 Overview

Ready Steady Math Coach is a low-cost, optional AI subscription for parents that sits on top of the existing Ready Steady Math game. It transforms raw gameplay data into clear, actionable insights.

**Primary job-to-be-done:**
> "Help parents understand where their child is strong or struggling in math facts, and give them a simple, guided practice plan to help the child reach proficiency."

### 12.2 Target User & Value Proposition

**Target user:**
Parents and caregivers of children using Ready Steady Math at home. These are busy adults who:
- Want to support their child's math development.
- Don't have time to analyse dashboards or create practice schedules.
- Value clear, simple guidance over raw data.

**Value proposition:**
Coach turns raw gameplay data into clear insights:
- **Clarity:** Know exactly which number facts are solid and where the child is struggling.
- **Guidance:** Receive a simple weekly practice plan written in plain language.
- **Progress:** See how skills improve over time without interpreting complex dashboards.
- **Confidence:** Feel equipped to help without being a math expert.

### 12.3 Core Capabilities (V1)

#### 12.3.1 Skill Snapshot

**Per-child overview of strengths and weaknesses by topic:**
- Visual representation (e.g., colour-coded grid or simplified radar) showing proficiency across:
  - Addition facts (including Make 10/20/100)
  - Subtraction facts
  - Multiplication facts (by table: 2×, 3×, ... 12×)
  - Division facts
  - Doubles & halves
  - Square numbers
- Clear labels: "Strong", "Developing", "Needs Focus"

**"You are here" vs age-band expectations:**
- Compare child's current proficiency against typical expectations for their age band.
- Example: "Most Year 3 children are working on 3×, 4×, and 5× tables. Emma is strong on 3× and 4×, but 5× needs more practice."

#### 12.3.2 Guided Practice Plan

**AI-generated weekly or term-based practice plan:**
- Specific, actionable recommendations.
- Example: "This week, focus on 3 × 8-minute dashes on 5× table and Make 20 bonds."
- Plan adapts based on recent performance and progress.

**Plain language requirements:**
- Written for busy parents who may not be math-confident.
- No jargon; no assumed knowledge of curriculum terminology.
- Quick to scan: key actions should be obvious within 5 seconds.

**Links to action:**
- Each recommendation links directly to the relevant game mode/topic.
- "Start this practice" button launches the suggested session.

#### 12.3.3 Progress Over Time

**Simple visualisations showing:**
- Skills mastered over time (e.g., timeline or milestone view).
- Skills that are improving (positive trend indicators).
- Skills that are still lagging (flags for attention).

**Monthly or termly "Coach Reports" summarising:**
- **Key wins:** "Emma mastered 4× and 5× tables this month!"
- **Ongoing gaps:** "7× and 8× facts still need regular practice."
- **Suggested next focus:** "Next month, focus on 6× and 7× while maintaining 5×."

**Delivery:**
- Available in-app in the Coach dashboard.
- Optional email delivery (see 12.5.3).

#### 12.3.4 Parent-Facing Explanations

**Short, AI-generated explanations such as:**
- "Your child is fast and accurate with × and ÷ facts up to 10, but still hesitates with 7× and 8× facts."
- "They make most of their mistakes on subtraction with regrouping; consider focusing here for the next few weeks."
- "Emma's speed has improved 20% this month – great progress!"

**Tone requirements:**
- Encouraging and supportive.
- Focus on progress and actionable next steps.
- Never discouraging or comparative to other children.

#### 12.3.5 Curriculum-Aligned Insights

**Per-child curriculum comparison:**
- Compare proficiency to local curriculum expectations for their year/grade.
- Identify skills where child is ahead or behind typical expectations.
- Example: "In Year 4, children are expected to know all times tables to 12×12. Alex has mastered 10 of 12 tables and is on track."

**Country-specific messaging:**
- Recommendations use local terminology (Year 3 vs Grade 2).
- Reference appropriate curriculum standards.
- Example (UK): "By the end of Year 3, most children are fluent with the 2, 3, 4, 5, 8, and 10 times tables. Emma is strong in 2× and 5×, and is now working on 3× and 4×."
- Example (US): "By the end of Grade 3, children typically know all single-digit multiplication facts. Jake has mastered facts for 2, 5, and 10, and is building fluency in 3 and 4."

**Curriculum progress in Coach reports:**
- Monthly reports include curriculum alignment summary.
- Show movement towards year-end expectations.
- Celebrate when skills are "ahead of typical expectations".
- Gently highlight priority areas when "behind" without alarm.

**Requirements:**
- Curriculum insights require profile to have country/yearGrade set.
- If not set, Coach prompts parent to add this information.
- All curriculum messaging is encouraging and non-judgmental.

### 12.4 Non-Goals (V1)

Ready Steady Math Coach is **not** trying to be:

- **A full curriculum:** Coach does not replace structured math instruction. It focuses only on fluency facts practice.
- **A tutoring system:** Coach does not teach concepts or provide explanations of "why" – it assumes the child is learning math elsewhere and uses Ready Steady Math for fluency practice.
- **A diagnostic tool for learning difficulties:** Coach identifies patterns in gameplay but does not diagnose dyscalculia or other conditions.
- **A replacement for teacher involvement:** Coach is for home use; teacher-facing analytics are a separate future consideration.

Coach is a **lightweight analytic and guidance layer** on top of the existing fluency game.

### 12.5 User Flows & UX

#### 12.5.1 Parent Upgrade Flow to Coach

**Entry points:**
- Prompt in the "Grown-Ups" / parent area after several sessions of play.
- Banner in the progress dashboard: "Get personalised guidance with Ready Steady Math Coach."
- Post-session suggestion: "We've spotted some patterns in Alex's results. Want a simple weekly plan?"

**Flow:**
1. Parent sees Coach upsell prompt.
2. Taps "Learn more" or "Upgrade to Coach".
3. Sees Coach benefits screen:
   - Skill snapshot preview
   - "Get a weekly practice plan"
   - "See progress over time"
   - Price: "$2.99/month or $23.99/year (save 2 months)"
4. Taps "Subscribe" → platform payment flow (Stripe / App Store / Play).
5. On success: Confirmation screen → "View your first Coach report".
6. Redirected to Coach dashboard with first skill snapshot.

#### 12.5.2 Coach Dashboard Flow

**Entry point:**
- "Coach" tab or section within the Grown-Ups area.
- Only visible to subscribed parents.

**Per-child view:**
1. **Header:** Child's name, avatar, current streak.
2. **Skill Snapshot:** Visual grid/radar of current proficiency.
3. **This Week's Plan:** 
   - 2-3 recommended practice sessions.
   - Each with topic, duration, and "Start" button.
4. **Progress Summary:**
   - "This month" quick stats.
   - Link to detailed progress view.
5. **Latest Coach Report:**
   - Summary card with key insights.
   - "Read full report" link.

**Design requirements:**
- Clean, minimal, and non-overwhelming.
- No more than 3-4 main sections visible at once.
- Mobile-first design; works well on phone screens.
- Quick to scan: busy parents should get value in under 30 seconds.

#### 12.5.3 Notification / Communication Flow

**Optional notifications:**
- In-app notification badge when new Coach report is ready.
- Optional email summaries:
  - "New monthly coach report is ready for Emma."
  - "Great job – Emma has mastered 5× table! Next focus: 6×."

**Requirements:**
- **Parent consent:** All notifications require explicit opt-in.
- **Frequency limits:** Maximum one email per week; no daily spam.
- **Easy opt-out:** One-click unsubscribe in every email; toggle in app settings.
- **Tone:** Encouraging, brief, actionable.

---

## 13. Analytics, Data & AI Requirements

### 13.1 Core Analytics (All Users)

**Session and question-level data (existing requirements):**
- GameSession: timestamp, duration, topic, mode, profileId.
- QuestionAttempt: question, correct answer, given answer, response time, isCorrect.
- SkillMetric: aggregated accuracy and speed per skill cluster per profile.

**Engagement events:**
- START_SESSION, END_SESSION, ANSWER_QUESTION
- STREAK_MAINTAINED, STREAK_BROKEN
- ACHIEVEMENT_UNLOCKED

### 13.2 Coach-Specific Data Capture

**Additional events for Coach:**
- COACH_SUBSCRIBED: timestamp, plan type (monthly/annual), profileId.
- COACH_CANCELLED: timestamp, reason (if provided).
- PRACTICE_PLAN_GENERATED: timestamp, profileId, recommended topics.
- PRACTICE_PLAN_SESSION_STARTED: timestamp, profileId, recommended topic.
- PRACTICE_PLAN_SESSION_COMPLETED: timestamp, profileId, topic, followed recommendation (yes/no).
- COACH_REPORT_GENERATED: timestamp, profileId, report type (weekly/monthly/termly).
- COACH_REPORT_VIEWED: timestamp, profileId.

**Data structure requirements:**
- Question-level and session-level performance must be stored in a way that AI can easily:
  - Summarise accuracy, speed, and error patterns for each skill cluster.
  - Identify trends over time (improving, stable, declining).
  - Compare to age-band expectations.

### 13.3 Curriculum-Specific Events

**Events for curriculum alignment feature:**
- CURRICULUM_COUNTRY_SET: When user sets or changes country/yearGrade on profile.
- CURRICULUM_PROGRESS_VIEWED: When user views the curriculum progress page in Grown-Ups area.
- CURRICULUM_STATUS_CHANGED: When overall status changes (e.g., "needs-focus" → "on-track").
- CURRICULUM_SKILL_MASTERED: When a curriculum skill reaches "mastered" proficiency.
- CURRICULUM_PRACTICE_STARTED: When user starts practice from a curriculum skill recommendation.

**Data for curriculum analytics:**
- Track country distribution of users for prioritising curriculum updates.
- Monitor skill progression rates by country/year to validate curriculum mappings.
- Track which curriculum skills are most commonly "needs focus" to inform content recommendations.

### 13.4 AI Interaction Requirements

**Internal AI service specification:**

**Inputs:**
- Anonymised performance data for a child (no PII beyond age band).
- Historical session data (questions, answers, timing, accuracy).
- Current skill proficiency levels.
- Age band for expectation comparison.

**Outputs:**
- Human-readable summaries for parents:
  - Skill snapshot descriptions.
  - Progress narratives.
  - Strengths and gaps explanations.
- Recommended weekly practice plan:
  - Specific topics/modes from existing game content.
  - Suggested session duration and frequency.
  - Priority ordering.

**Response requirements:**
- **Short:** Summaries should be 2-3 sentences. Plans should be 3-5 bullet points.
- **Clear:** No jargon, no assumed math knowledge.
- **Non-technical:** Written for busy parents, not educators.
- **Safe and age-appropriate:** Any child-facing copy (e.g., achievement messages that reference Coach insights) must be encouraging and appropriate.
- **Consistent:** Similar inputs should produce similar outputs; avoid random variation in tone.

**Performance requirements:**
- AI responses should be generated within 5 seconds.
- Reports can be pre-generated (e.g., nightly batch) for instant access.
- Practice plans should update at least weekly or when significant progress is detected.

### 13.4 Privacy & Data Handling

- All AI processing uses anonymised data (no names, no PII beyond age band).
- Child performance data is never shared with third parties for non-service purposes.
- Parents can request data export or deletion at any time.
- Compliant with COPPA and GDPR-K principles.

---

## 14. KPIs & Success Metrics

### 14.1 Core Product Metrics (Existing)

**Learning impact:**
- Increase in correct answers per minute per child over 4-8 weeks.
- Reduction in error rate for target skills (e.g., 7× table).

**Engagement:**
- D1, W1, and M1 retention of active child profiles.
- Average weekly questions answered per active child.
- Streaks maintained (e.g., % of kids with 3+ day streak).

**Business:**
- Free to paid (Core unlock) conversion rate.
- Target: 5%+ in first 3 months.

### 14.2 Subscription-Specific Metrics (Coach)

#### Coach Attach Rate
- **Definition:** % of paying parents (Core unlock purchasers) who become Coach subscribers.
- **Target (Year 1 - Base):** ≥10%
- **Target (Product maturity):** 20%+

**Tracking scenarios:**
- Attach within 30 days of Core purchase.
- Attach within 90 days of Core purchase.
- Total attach rate over customer lifetime.

#### Coach Retention & Churn
- **Monthly churn rate:** % of subscribers who cancel each month.
- **Target:** <8% monthly churn (implies ~12+ month average lifetime).
- **Average subscription duration:** Track in months.

#### Coach ARPU and MRR
- **ARPU (Average Revenue Per User):** Average monthly revenue per Coach subscriber.
- **MRR (Monthly Recurring Revenue):** Total monthly revenue from Coach subscriptions.
- **Track:** MRR growth rate month-over-month.

### 14.3 Upgrade Funnel Metrics

- **Upsell impression rate:** % of eligible parents who see the Coach upsell message.
- **Upsell click-through rate:** % of parents who see upsell and tap "Learn more" or "Upgrade".
- **Checkout start rate:** % of parents who start the payment flow.
- **Checkout completion rate:** % of parents who complete payment.
- **AI credit → Coach conversion:** % of AI credit pack buyers who later convert to Coach subscription.

### 14.4 Engagement Impact Metrics

**Do Coach subscribers show better outcomes?**

- **Practice frequency:** Do Coach subscribers play more regularly than non-subscribers?
  - Target: Coach subscribers average 20%+ more sessions per week.
- **Skill progression:** Do Coach subscribers show larger skill gains over time?
  - Track: Improvement in accuracy/speed for weak skills over 4-8 weeks.
- **Plan adherence:** Do parents follow the recommended practice plans?
  - Track: % of recommended sessions that are started within 7 days.
- **Retention:** Do Coach subscribers have higher app retention?
  - Track: W4 and M3 retention for Coach vs non-Coach paying parents.

### 14.5 Integrated Success View

The full success picture combines:

| Metric Category | Key Metrics | Year 1 Targets |
|-----------------|-------------|----------------|
| Acquisition | Sign-ups (households + teachers) | 50,000+ households |
| Conversion | Free → Core unlock | 5%+ |
| Coach Attach | Core → Coach subscription | 10%+ |
| Retention | Coach monthly churn | <8% |
| Engagement | Weekly sessions (Coach subscribers) | 3+ per child |
| Learning | Accuracy improvement (8 weeks) | 30%+ |
| Revenue | MRR from Coach | Growing month-over-month |

---

## 15. Business Model Viability

### 15.1 Financial Impact Summary

The addition of Ready Steady Math Coach significantly improves the long-term financial sustainability of Ready Steady Math without changing the core product's simplicity or the one-time purchase model for the game itself.

**Base scenario financial impact:**

| Model | 5-Year Net Contribution (before salaries/marketing) |
|-------|-----------------------------------------------------|
| Core unlock + AI credit packs only | ~US$170,000 – $200,000 |
| Core unlock + Coach subscription (10% attach) | ~US$220,000 – $250,000 |
| Core unlock + Coach subscription (20% attach) | ~US$270,000 – $305,000 |

**Key observations:**
- The subscription layer adds **US$50,000 – $105,000** to 5-year net contribution at modest attach rates (10-20%).
- Coach provides **recurring revenue** that smooths cash flow and reduces dependence on constant new customer acquisition.
- Coach significantly improves sustainability and funding for ongoing development.

### 15.2 Why This Model Works

1. **Low barrier to core value:** The one-time US$6.99 Core unlock feels like a "no-brainer" purchase for parents – similar to buying a premium game.

2. **Optional subscription for parents who want more:** Coach is clearly positioned as "extra guidance" for parents who value it, not as a requirement to use the app effectively.

3. **High margin on AI features:** AI compute costs are negligible (< $0.01 per analysis with modern models), so Coach subscriptions deliver near-100% gross margin.

4. **Recurring revenue stability:** Even modest Coach adoption provides predictable monthly revenue that helps fund ongoing development and support.

5. **Natural upgrade path:** Parents who see value in the free tier and Core unlock are primed to consider Coach when they want more guidance.

### 15.3 Reference

For detailed financial projections, scenario modelling, and sensitivity analysis, see the external **Business Model Viability** document and associated spreadsheet.

---

## 16. Future Roadmap & Open Questions

### 16.1 Near-Term Roadmap (Post-MVP)

1. **Ready Steady Math Coach launch** (P1)
   - Core Coach features as specified in Section 12.
   - Monthly and annual subscription options.

2. **Adaptive Practice Mode refinement** (P1)
   - Integrate Coach insights to improve adaptive difficulty.
   - Use AI-identified weak areas to prioritise question selection.

3. **Teacher dashboard improvements** (P1)
   - Basic class-level progress views.
   - Simple export for reporting.

### 16.2 Medium-Term Considerations

1. **AI Credit Pack Sunset Decision**
   - **Question:** Should we phase out AI credit packs if Coach performs well?
   - **Criteria:** Review at 12 months post-Coach launch.
   - **Decision factors:**
     - Credit pack purchase volume vs Coach subscriptions.
     - Support burden from credit-related confusion.
     - Revenue contribution comparison.
   - **Options:**
     - Maintain both indefinitely.
     - Sunset credits for new users, honour existing purchases.
     - Convert credit users to Coach with promotional offer.

2. **Teacher / School Coach Subscription**
   - **Question:** Should we offer a "Coach for Teachers" subscription with class-level analytics and recommendations?
   - **Potential features:**
     - Class skill snapshot and group recommendations.
     - Individual pupil progress tracking.
     - Intervention group suggestions.
     - Term-end reporting.
   - **Pricing consideration:** Per-class or per-school subscription model.
   - **Timeline:** Explore after validating home Coach adoption.

### 16.3 Longer-Term Opportunities

1. **Deeper Adaptive Difficulty Driven by Coach**
   - Use Coach's AI analysis to dynamically adjust in-game difficulty.
   - Create a tighter feedback loop between Coach insights and gameplay.

2. **Term-Based or Curriculum-Aligned Proficiency Paths**
   - Align skill progression with school term schedules.
   - Offer "Year 3 Autumn Term" or "Grade 3 First Semester" goal tracks.
   - Partner with curriculum providers for localised content.

3. **Family and Multi-Child Features**
   - Sibling comparison (with appropriate framing).
   - Family progress challenges.
   - Shared parent dashboard for multiple children.

4. **Extended Content**
   - Mental math strategies beyond pure fluency.
   - Problem-solving challenges.
   - Competition/leaderboard modes for schools (compliant with Section 8 ethical guidelines).

### 16.4 Open Questions for Future Resolution

| Question | Owner | Target Decision Date |
|----------|-------|---------------------|
| Sunset AI credit packs? | Product | 12 months post-Coach launch |
| Teacher Coach subscription? | Product/Biz | 18 months post-launch |
| Curriculum partnerships? | Business | Year 2+ |
| Native app pricing adjustments for app store fees? | Business | Before native app launch |

---

## Summary

Ready Steady Math helps kids master math facts (addition and subtraction facts, multiplication facts / times tables, division facts, number-bond style make-10/20/100 modes, doubles and halves, and square numbers) through quick, one-minute challenges while giving parents and teachers clear insight and control.

**Our commitment to ethical engagement:** Ready Steady Math is explicitly designed to support healthy digital habits, not to maximise screen time. We target 5-10 minute quick sprint sessions, use only transparent and skill-based engagement mechanics, prohibit dark patterns and manipulative design, and keep parents in control of notifications and goals. See Section 8 for our complete ethical engagement framework.

The business model combines:
- **Free tier** for discovery
- **One-time Core unlock** (US$6.99 Home / US$19.99 Teacher) for full game access
- **Optional Ready Steady Math Coach subscription** (US$2.99/month or US$23.99/year) for AI-powered parent guidance

This model delivers accessible, family-friendly pricing while building sustainable recurring revenue to fund ongoing development.

The specification defines personas, features, flows, pricing, ethical constraints, and business requirements to guide design and engineering teams towards a focused MVP with Coach capabilities following shortly after, building an extensible long-term product that serves children, parents, and teachers effectively.
