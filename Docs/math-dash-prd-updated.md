Math Dash - Product Requirements & Specification (Updated Glossary)

1. Problem-First Framing

1.1 Problem Analysis

Core problem:
Children aged ~5-11 need fast, engaging ways to build automatic recall of number facts (addition, subtraction, multiplication, division). Existing tools like Hit the Button are effective but have gaps:

- Limited adaptivity - difficulty does not automatically adjust to the child.
- Progress insight is shallow - hard for parents/teachers to see where a child struggles at a glance.
- Engagement is static - few modern game mechanics (streaks, quests, progression).
- Little personalization - content and goals are not tailored to each child.
- Weak classroom features - teachers have limited tools to manage groups and track progress.

Who feels this most:
- Primary: Kids 6-11 who get bored easily and need a simple, fun loop to keep practising.
- Secondary: Parents who want to see clear evidence of progress and focus practice on weak areas.
- Secondary: Primary school teachers who need quick, reliable fluency practice with simple analytics.

1.2 Solution Validation - Why Math Dash?

Math Dash is a browser-based, cross-platform math fluency game inspired by Hit the Button and similar apps, but redesigned to:

- Keep the core quick-fire, one-tap gameplay that works.
- Add adaptive practice that reacts to performance.
- Provide clear, visual dashboards for parents/teachers.
- Introduce modern engagement mechanics (streaks, daily goals, challenges).
- Support classroom usage from day one (profiles, simple group tracking).

Alternatives & differentiation:
- Hit the Button / Twinkl Rapid Math Practice: Excellent core mechanic; weaker on adaptivity and whole-child view. Math Dash differentiates on personalization, analytics, and engagement.
- Times Tables Rock Stars, Mathletics, Sumdog: Strong platforms but heavy, subscription-based, and more complex. Math Dash positions as a lightweight, quick-start, freemium tool with a razor focus on fluency.

1.3 Impact Assessment - What Changes for Users?

We measure success across learning, engagement, and business:

Learning impact:
- Increase in correct answers per minute per child over 4-8 weeks.
- Reduction in error rate for target skills (e.g., 7x table).

Engagement:
- D1, W1, and M1 retention of active child profiles.
- Average weekly questions answered per active child.
- Streaks maintained (e.g., % of kids with 3+ day streak).

Business:
- Conversion rate from free to paid.
- Active schools/classrooms using Math Dash.
- Cost per engaged learner (for paid acquisition).

2. Executive Summary

Elevator Pitch:
Math Dash is a fast, fun game where kids race the clock to answer math questions and level up their skills a little bit every day.

Problem Statement:
Math Dash helps kids master math facts — addition and subtraction facts (including number-bond style make-10/20/100), multiplication facts / times tables, division facts, doubles and halves, and square numbers — through quick, one-minute challenges. Many apps drill facts but do not adapt to each child, show clear progress to adults, or keep kids coming back consistently. Teacher-facing documentation may still use UK/Commonwealth terms like "number bonds" or "doubles and halves" for clarity, but the app surfaces them under globally clear headings such as "Addition & Subtraction Facts" so parents and kids know what to pick at a glance.

Target Audience:
Kids (6-11)
- Primary students (Years 1-6 / KS1-KS2).
- Can read basic numbers and simple instructions.
- Use tablets, Chromebooks, laptops, or phones.

Parents/Caregivers (30-55)
- Want short, effective practice activities.
- Want evidence of progress.

Teachers (Primary, Years 1-6)
- Use Math Dash as a 5-10 minute warm-up or homework tool.
- Need quick set-up and basic tracking per pupil.

Unique Selling Proposition (USP):
1. Adaptive Dash Engine: Difficulty auto-adjusts per child.
2. Visual Progress Radar: Shows strengths and gaps per topic/table.
3. Built-in Engagement Layer: Streaks, goals, challenges.
4. Web-first, Cross-Device: Browser-based, PWA-friendly.
5. Teacher-Friendly: Lightweight classroom mode and analytics.

Success Metrics (Top-Level):
- 60% of active children practise 3+ days/week after 4 weeks.
- Median correct answers per 60s improves by 30% after 6 weeks.
- NPS 40+ for parents and teachers.
- Free to paid conversion 5%+ in first 3 months.
- 50+ active classrooms in first year.

3. Personas

Persona 1 - Jake, 8, Reluctant Maths Kid
- Age: 8 (Year 3)
- Devices: Shared tablet, classroom Chromebook.
- Goals: Feel competent in times tables; enjoy quick, simple games.
- Pain points: Bored by text-heavy apps; discouraged by constant difficulty.

Persona 2 - Sarah, 38, Busy Parent
- Age: 38, working parent.
- Devices: Phone, family tablet.
- Goals: 10-15 min meaningful practice; clear evidence of progress.
- Pain points: Overwhelmed by complex platforms; dislikes ads and confusing subscriptions.

Persona 3 - Mr. Patel, 32, Year 4 Teacher
- Age: 32.
- Devices: Classroom PCs/Chromebooks, laptop, projector.
- Goals: Quick warm-up activities; see which pupils struggle with which facts.
- Pain points: No time for complex setup; mixed devices in class.

4. Feature Specifications

Priority legend:
- P0 - Must-have for MVP
- P1 - Important, post-MVP
- P2 - Nice-to-have / later

Feature 1: Core Dash Round Gameplay (P0)
User Story:
As a child learner, I want to play short, timed math rounds (one question at a time, quick taps) so I can build fluency in a fun way.

Acceptance Criteria (summary):
- Timed round (e.g. 60s) with single question and multiple answers per screen.
- Correct answers increment score and move instantly to next question.
- Incorrect answers show brief error + highlight correct answer.
- End of round shows score, accuracy, personal best.
- If device loses focus/offline mid-round, round is paused with option to resume/restart.

Dependencies: Question generation engine, UI layout, timer.
Constraints: Sub-50ms response to taps; aim for 60fps.
UX: Large buttons, minimal text, high contrast, low visual noise.

Feature 2: Topic & Skill Library (P0)
- Library organized by globally clear categories:
  - Addition & Subtraction Facts (includes number-bond style modes like Make 10/20/100 and missing-number facts).
  - Multiplication Facts (Times Tables).
  - Division Facts.
  - Doubles & Halves (fast addition/subtraction/multiplication/division by 2).
  - Square Numbers (e.g., squares up to 10x10 or 12x12).
- Sub-levels/modes examples: "Make 10 (Number Bonds)", "Make 20 (Number Bonds)", "Make 100", "1-12x mixed tables", "Doubles to 20", "Halves to 100", "Squares to 12x12".
- Per-profile remembered recent topics.
- Locked topics clearly indicated with upgrade prompt for freemium.

Feature 3: Game Modes (P0)
- Timed mode: 30/60/120s.
- Question-count mode: 10, 20 questions, etc.
- Practice mode: untimed, continuous feedback.
- Safe defaults and simple mode switching.

Feature 4: Player Profiles & Avatars (P0)
- Multiple child profiles with name, age band, avatar.
- Profile chooser on app start.
- Profile deletion wipes local data with confirmation.
- Limits for shared school devices to prevent overload.

Feature 5: Progress Dashboard ("Skill Radar") (P0)
- Per-child view summarising strengths and gaps.
- Grid/radar of skills (e.g. addition/subtraction facts including number-bond modes, times tables, division facts, squares) with simple proficiency indicator.
- Tap skill for detail: recent scores, best score, trend.
- Friendly empty state when no data.

Feature 6: Adaptive Practice Mode (P1)
- Smart mode adjusting difficulty based on performance.
- Increases difficulty after strong results; revisits weak facts more often.
- Falls back to default distributions when insufficient history.

Feature 7: Engagement Layer (Streaks, Goals, Achievements) (P1)
- Daily/weekly goals (e.g. 50 questions per day).
- Streaks for consecutive practice days.
- Achievements for milestones (e.g. 1000 correct answers).
- Guardrails around time/date handling.

Feature 8: Local Multiplayer "Dash Duel" (P2)
- Two-player head-to-head mode on one device.
- Split screen with independent questions and scores.
- Optional handicap for mixed ability.

Feature 9: Accounts & Cloud Sync (P1-P2)
- Optional adult accounts for cross-device sync.
- Teacher accounts with class codes.
- Offline-first design with conflict-safe sync.

Feature 10: Monetization & Access Control (Freemium) (P0)
- Free core set of topics/modes.
- Additional content/features gated behind one-time or subscription purchase.
- Parent-gated upgrade flow using platform-native payments.

5. Functional Requirements

Key User Flows (summary):
- First-time parent/child setup: choose parent or kid, create profile, pick topic/mode, start first round.
- Returning child: profile select, quick play, results, and suggestion for next topic.
- Parent dashboard: gated access, select child, view dashboard, adjust goals and defaults.
- Teacher classroom (phase 2): teacher sign-up, class code, pupils join, teacher views basic metrics.
- Upgrade flow: tap locked content, see benefits, adult gate, payment, unlock.

State Management:
Entities: PlayerProfile, GameSession, QuestionAttempt, SkillMetric, Achievement.
Clear events: START_SESSION, END_SESSION, ANSWER_QUESTION, UNLOCK_ACHIEVEMENT, SYNC_SUCCESS.

Data Validation:
- Profile names 1-20 chars.
- Age bands constrained.
- Questions always have exactly one correct answer; no duplicate options.
- Streak logic uses local calendar days with defined rules.

Integrations:
- Analytics (event-based).
- Payments: Stripe/web, App Store/Play Billing.
- Auth/storage (phase 2): minimal PII, secure storage.

6. Non-Functional Requirements

Performance:
- Initial meaningful load within 3 seconds on mid-range mobile over 4G.
- Tap-to-feedback under 50ms.
- Dashboard load under 500ms typical.

Scalability:
- Mostly client-side; backend for auth, sync, payments.
- Scales to 10k-100k MAU in first phase.

Security:
- Minimal PII, encrypted at rest and in transit.
- Clear data deletion and parental control mechanisms.
- No targeted ads; compliance with COPPA/GDPR-K principles.

Accessibility (WCAG 2.1 AA target):
- Adequate contrast.
- Keyboard navigation for desktop.
- Screen reader labels on buttons.
- No harmful flashing.

7. UX Requirements

Information Architecture:
- Play, Topics, My Progress, Grown-Ups/Teacher Area, Settings.

Progressive Disclosure:
- Simple default flows for kids.
- Advanced options and teacher tools behind "More options" and adult gates.

Error Prevention:
- Disabled actions until required inputs selected.
- Confirms destructive actions.
- Clear offline indicators.

Feedback Patterns:
- Immediate visual feedback for correctness.
- Simple, encouraging post-round messages.
- Visual progress (stars, badges, mastery levels).
- Light system toasts for sync/payment events.

8. Critical Questions Checklist (with answers)

- Existing solutions? Yes: Hit the Button, TTRS, Mathletics, etc. We improve adaptivity, dashboards, engagement, and simplicity.
- MVP? Core gameplay, topics, basic modes, profiles, simple dashboard, and monetization.
- Risks? Over-gamification, privacy, teacher UX complexity, mis-tuned adaptivity. Mitigated with simple design, minimal data, teacher feedback loops, and transparent logic.
- Platform requirements? Web/PWA plus native wrappers; school Chromebooks; app store policies for kids apps.

9. Traceability to Business Objectives

Business Objectives:
1. Become a trusted, modern alternative in math fluency.
2. Establish profitable freemium model with strong word-of-mouth.
3. Build a foundation to extend to advanced math content.

Feature Mapping:
- Objective 1: Features 1-5.
- Objective 2: Features 7 and 10.
- Objective 3: Features 2, 6, and 9.

Summary:
Math Dash helps kids master math facts (addition and subtraction facts, multiplication facts / times tables, division facts, number-bond style make-10/20/100 modes, doubles and halves, and square numbers) through quick, one-minute challenges while giving parents and teachers clear insight and control. The specification defines personas, features, flows, and constraints to guide design and engineering teams towards a focused MVP and an extensible long-term product.
