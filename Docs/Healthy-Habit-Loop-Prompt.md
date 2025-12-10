# Healthy Habit Loop – Implementation Prompt for Ready Steady Math

> **Note:** Ready Steady Math was previously referred to as 'Math Dash' in earlier internal drafts.

You are an AI assistant helping us refine **Ready Steady Math**, a browser-based math fluency game for children roughly **ages 6–11**.

Your task is to:

1. **Review our current implementation** (flows, UX, copy, and logic) against the “Healthy Habit Loop” principles below.
2. **Identify where we are aligned, where we conflict, and where gaps exist**.
3. **Propose concrete changes** (flows, UI, copy, and logic) to fully implement the Healthy Habit Loop, while staying true to our product vision and child-safety requirements.

Where this document uses “you”, it is instructing you, the AI assistant.

---

## 1. Context & Product Intent

Ready Steady Math is designed to:

- Help kids **build fast mental recall of number facts** (addition, subtraction, multiplication, division).
- Do this via **short, focused, repeatable sessions** (about 5–10 minutes each).
- Encourage kids to come back **most days of the week**, not to stay in the app for long periods.
- Keep **child safety, mental wellbeing, and healthy digital habits** at the centre of every engagement decision.

Our engagement strategy should create a **Healthy Habit Loop**:

> “Open app → Short, focused practice → Visible progress → Positive completion & break → Naturally return on future days.”

We want you to align the app’s implementation with this loop.

---

## 2. High-Level Goals of the Healthy Habit Loop

When you review and propose changes, aim to achieve the following behavioural goals:

1. **Short, contained sessions**  
   - Default session: ~5–10 minutes of focused practice.
   - The app **naturally concludes** a session and gently encourages a break.

2. **Consistency over binge usage**  
   - Measure success by **days-per-week of practice**, not total minutes.
   - Prefer 3–5 short sessions per week to long, infrequent marathons.

3. **Mastery and confidence**  
   - Kids see **clear evidence of skill growth** (accuracy, speed, mastered skills).
   - Feedback focuses on **effort, improvement, and mastery of specific skills**.

4. **Positive, non-punitive engagement**  
   - No guilt-tripping for missed days.
   - No shame for low scores.
   - No “you lost everything” messages.

5. **Calm, predictable experience**  
   - Reward systems are **transparent and deterministic** (do X → get Y).
   - No gambling-like randomness, loot boxes, or “maybe this time” mechanics.

6. **Parent/teacher in control**  
   - Notifications and reminders are configured by adults.
   - Progress dashboards are readable and meaningful for adults.

---

## 3. Core Design Principles (Constraints You Must Enforce)

When proposing changes, enforce these principles:

### 3.1 Session Design

- Default “Daily Dash” session must:
  - Be **short** (around 5–10 minutes).
  - Consist of a small number of **timed rounds or question sets**.
  - End with a **summary screen** and clear emotional “you’re done for today” signal.
- Additional play **may be allowed** but:
  - Is **optional**.
  - Is **not aggressively pushed** by UI or copy.

### 3.2 Habit Formation

- Focus on **weekly goals** (e.g., practice on 3 days this week) instead of rigid daily streaks.
- Allow children to “win the week” without being perfect every day.
- Missing a day **never erases all progress** or triggers punitive messaging.

### 3.3 Rewards & Progression

- All rewards must be:
  - **Predictable** (no loot boxes, no spin wheels).
  - **Skill- or effort-based** (number of questions, mastery level, days practiced).
- Use:
  - **Skill mastery indicators** (stars, rings, or similar).
  - **Achievable milestones** tied to real learning (e.g., accurate 7× table within X time).
  - **Cosmetic unlocks** (backgrounds, Dashy accessories) that are earned by clear milestones, not randomness.

### 3.4 Social & Competition

- No **global leaderboards** or public rankings of children.
- Use **self-competition**:
  - Personal best scores.
  - “You improved your accuracy/speed in 7×”.
- For future classroom features (if applicable), only **aggregate class statistics**, not child-by-child rankings.

### 3.5 Notifications & Nudges

- Notifications are:
  - **Configured by parents/teachers** in a grown-ups area.
  - **Opt-in** by default (no automatic nagging).
- Notification tone is:
  - Gentle and neutral, e.g. "This might be a good moment for a 5-minute Ready Steady Math session."
  - Never: “Your streak is in danger” or “Only 2 hours left”.

### 3.6 Copy & Tone

- Child-facing copy must:
  - Emphasize **effort, growth, and normalising mistakes**.
  - Encourage **stopping after a good session** (“Great work, let’s continue another day.”).
- Forbidden:
  - Guilt, shame, or pressure (“Don’t quit now”, “You will fall behind”).
  - High-pressure urgency or FOMO.

---

## 4. Key Mechanics to Implement or Refine

You should review our current product (flows, UI, copy, logic) and determine how to implement or adjust each of the following mechanics.

For each mechanic, you will:

- Assess **current state** (Does it exist? How is it implemented? Is it aligned?).
- Propose **changes** (UX, copy, logic, data structures).
- Suggest **migration or deprecation** steps if we must remove/replace anything.

### 4.1 Daily Dash Session

**Intent:** A guided, short session representing “a good day of practice”.

Requirements:

- Provide a **default entry point** (button or card) labelled something like “Daily Dash”.
- Daily Dash includes:
  - A small set of rounds (e.g., 3 × 60s rounds) or a fixed question count.
  - Content selected based on:
    - High-value skills (core facts).
    - Weakest current skills (adaptive).
- After completion:
  - Trigger weekly progress updates (see 4.2).
  - Show a summary screen (see 4.5).
- You should:
  - Map where in the current UI this concept lives (if at all).
  - Propose specific navigation changes to make Daily Dash clear and primary.

### 4.2 Weekly Practice Goals

**Intent:** Encourage consistent practice across the week without harsh daily streaks.

Requirements:

- Define a **weekly goal**, e.g., “Practice on 3 days this week”.
- Represent visually (e.g., 3 large circles that fill when a Daily Dash is completed on a new day).
- Behaviour:
  - Completing a Daily Dash on a new day fills one circle.
  - Extra days beyond the goal are celebrated but don’t unlock gambling-like bonuses.
  - Missing a day does **not reset** filled circles; the counter only resets when a new week begins.
- You should:
  - Describe how to track this in the data model.
  - Propose UI placements (home screen, summary screen, grown-ups view).
  - Identify any conflicting existing “streak” logic and outline how to replace it.

### 4.3 Dash Path / Checkpoint Trail

**Intent:** Give kids a simple visual journey that advances steadily over time.

Requirements:

- Implement a **linear path** or series of checkpoints:
  - Every completed Daily Dash advances the character (e.g., Dashy) one step.
  - Progress never goes backwards due to missed days.
- Use simple, child-friendly visuals that do not create pressure to “grind”.
- You should:
  - Suggest one or more design options (e.g., horizontal path, map-style path).
  - Link advancement logic to Daily Dash completion.
  - Ensure performance and responsiveness across devices.

### 4.4 Skill Mastery Indicators

**Intent:** Make learning progress tangible and skill-specific.

Requirements:

- Each key skill (e.g., 3× table, 7× table, number bonds to 10/20, etc.) must have:
  - A defined **mastery model** (accuracy and speed thresholds).
  - A simple visual representation, e.g.:
    - 0–3 stars.
    - Rings that fill up.
- Logic:
  - Practice and assessment rounds update mastery metrics.
  - Once thresholds are met, the skill is marked as mastered.
- You should:
  - Define or refine the mastery thresholds.
  - Map current implementation (if any) to this model.
  - Propose UI patterns for:
    - Skill list view.
    - Individual skill detail view.
    - Grown-ups summary (“Skill Radar”).

### 4.5 Session Summary & Stopping Cue

**Intent:** Close the loop with positive feedback and a gentle suggestion to stop for the day.

Requirements:

- After a Daily Dash, show a **summary screen** that includes:
  - Skills practised.
  - Accuracy and speed improvements.
  - Weekly goal progress update (e.g., “2 of 3 days done this week”).
  - Any achievement/badge updates.
- Include explicit copy that:
  - Acknowledges effort.
  - Suggests that this is enough for today.
  - Encourages returning on another day.
- You should:
  - Draft example copy lines.
  - Specify the exact data needed to render this screen.
  - Suggest UI layout for clarity and minimal cognitive load.

### 4.6 Optional Extra Play

**Intent:** Allow motivated kids to keep practicing, without pressure.

Requirements:

- Provide an option like “Play another round” or “Practice a different skill”.
- This option must:
  - Be **clear but not dominant**.
  - Not use urgent language or animated pressure.
- You should:
  - Propose where and how this option is shown.
  - Ensure that this does not bypass the weekly goal logic (i.e., additional rounds don’t distort the habit structure).

### 4.7 Achievements & Badges

**Intent:** Reward meaningful learning activities in a non-addictive way.

Requirements:

- Design or refine a limited set of badges tied to:
  - Skill mastery.
  - Effort milestones (e.g., 100/500/1000 questions answered).
  - Weekly goal completion (e.g., “3-day Dash Champion”).
- All badges must be:
  - Achieved through deterministic criteria.
  - Clearly described to child and adult.
- You should:
  - Audit current reward/badge systems and remove any that resemble loot boxes or random chest openings.
  - Propose a concise badge catalogue with criteria and visual hints.
  - Map badges to data fields and events.

### 4.8 Parent/Teacher Reminders

**Intent:** Support consistent use through adult-managed reminders.

Requirements:

- Notifications are configured in a **Grown-ups area**:
  - Enable/disable.
  - Schedule times and days.
  - Choose channel (e.g., email, OS notification if supported).
- Example messaging:
  - "This could be a good moment for a quick 5-minute Ready Steady Math session with [ChildName]."
- You should:
  - Check our current reminder/notification implementation.
  - Remove or redesign any direct child-targeted, high-pressure notifications.
  - Propose configuration UI and underlying logic for reminder scheduling.

### 4.9 Analytics & Success Metrics

**Intent:** Align our metrics with the Healthy Habit Loop, not raw engagement.

Requirements:

- Define or verify metrics such as:
  - **Days practiced per week per child** (primary).
  - **Average session length** (aim 5–10 minutes).
  - **Skill improvement over time** (accuracy, speed).
- Ensure our analytics:
  - Do **not** optimise blindly for total time-on-device.
  - Can support future A/B tests aligned with wellbeing (e.g., testing different summary messages).
- You should:
  - Review what analytics we currently capture.
  - Propose any new events or properties needed.
  - Suggest dashboards or queries that reflect Healthy Habit Loop success.

---

## 5. Non-Goals and Prohibited Patterns

When suggesting changes, explicitly **avoid** introducing:

- Loot boxes, random prize wheels, or gambling-like mechanics.
- Fragile daily streaks with harsh resets and guilt-based messaging.
- Time-limited events, countdown timers, and “last chance” offers.
- Global or public leaderboards ranking children by performance.
- Child-directed push notifications with urgency or pressure.
- Virtual currencies used primarily to keep kids grinding.

If any of these currently exist in the implementation or designs:

- Flag them clearly.
- Propose a migration path to compliant alternatives.

---

## 6. Your Output – What We Expect From You

When you have reviewed the current application and flows, produce:

1. **Alignment Report**
   - List each section/mechanic above.
   - For each:
     - Current state (Aligned / Partially aligned / Not aligned / Not implemented).
     - Specific observations from the code and UX flows.

2. **Change Plan**
   - A prioritized list of changes (P0/P1/P2).
   - For each change:
     - Description.
     - Affected components/pages/flows.
     - High-level implementation notes (for developers).
     - Any migration considerations for existing users/data.

3. **Copy & UX Suggestions**
   - Proposed copy blocks for:
     - Summary screens.
     - Weekly goals.
     - Notifications.
   - Sketches or textual descriptions of UI adjustments where helpful.

4. **Validation Checklist**
   - A checklist that product/design can use to verify:
     - Session length behaviour.
     - Weekly goal logic.
     - Reward mechanisms.
     - Notification behaviour.
     - Analytics events.

Use this document as a **hard constraint**: all recommendations and generated changes must keep the **Healthy Habit Loop** and **child wellbeing** at the centre of Ready Steady Math's design.
