# Math Dash – User Flows

## 1. First‑Time Setup (Home)

1. **Landing / Welcome**
   - No `PlayerProfile` exists.
   - Screen: “Let’s set up Math Dash” with CTA: “Add a Player”.

2. **Create Profile**
   - Inputs: `displayName`, age band (e.g., `Y1–2`, `Y3–4`, `Y5–6`), optional avatar.
   - Validations: 1–20 chars (trimmed), not all whitespace.

3. **Age‑Based Defaults**
   - System selects default topics for this age band (e.g., bonds to 10 for `Y1–2`, 2×–5× for `Y3–4`).
   - Default mode: a 60s timed round.

4. **First Round**
   - Pre‑game screen: shows selected topic + mode.
   - CTA: “Start Dash”.
   - Gameplay: timed mode; single question on screen; immediate feedback.

5. **First Summary**
   - Show: total questions, correct/incorrect, accuracy, best score (flagged as personal best).
   - CTAs: “Play Again” (same config) or “Change Topic/Mode”.

---

## 2. Returning Child – Daily Play

1. **App Launch**
   - If multiple profiles: profile chooser.
   - If single profile: auto‑select, show home for that profile.

2. **Profile Home (Child View)**
   - “Play” primary CTA (quick play with last topic + mode).
   - Small panels: “My Topics”, “My Progress”.

3. **Quick Play Path**
   - Tap “Play”.
   - Start last used topic+mode immediately, maybe with a minimal confirmation.
   - After summary: surface suggestion (“Try 7× table next?”) based on proficiency.

4. **Topic Change Path**
   - Navigate to “Topics”.
   - Browse tiles grouped by category.
   - Locked topics show lock icon; tapping them shows upgrade teaser.
   - Select a topic → returned to pre‑game configuration.

---

## 3. Parent Journey – Checking Progress & Considering Upgrade

1. **Access Grown‑Ups Area**
   - From top nav: “Grown‑Ups”.
   - Adult gate: simple math question or long‑press interaction.

2. **Select Child**
   - List of child profiles with mini snippets (e.g., “2×: Secure, 7×: Weak”).

3. **View Progress Dashboard**
   - “My Progress” for chosen child.
   - Tiles per topic with proficiency band (Weak / Developing / Secure / Advanced).
   - Optional trends (e.g., arrows, sparklines).

4. **Dive into Topic Detail**
   - Stats: recent scores, best score, accuracy %, last played date.
   - Empty state for low data: guidance to play more.

5. **Encounter Premium**
   - When viewing locked topics or premium modes, see clear markers.
   - CTA: “Upgrade” for a one‑time core unlock.

6. **Upgrade Flow**
   - Adult gate confirmation.
   - Screen summarizing benefits: all topics, adaptive mode, Dash Duel, teacher tools, etc.
   - Hand‑off to platform payments (Stripe checkout / app store).
   - On success: confirmation and unlocked content visible.

---

## 4. Teacher Journey – Early Post‑MVP Concept

1. **Sign Up / Sign In (Teacher)**
   - Use adult account mechanism.
   - Minimal data: email, password, school name (optional).

2. **Create Class**
   - Enter class name/year.
   - Generate `classCode`.

3. **Pupil Join Flow**
   - In classroom, pupils choose “I have a class code”.
   - Enter `classCode`, pick nickname/avatar.
   - Profiles linked to class and teacher account.

4. **Class Dashboard**
   - Overview by topic: distribution of proficiency bands.
   - Per‑pupil details: similar to parent “My Progress” view.

---

## 5. Error and Edge Case Flows

### 5.1 Offline Behaviour

- If offline:
  - Gameplay, topic selection, and local profiles fully functional.
  - Sessions stored locally for later sync.

- On reconnection:
  - Background sync pushes `GameSession`, `QuestionAttempt`, and `SkillMetric` data.
  - UI shows minimal, non‑intrusive banners (“Progress synced”).

### 5.2 Session Interrupted (Home Button / Tab Change)

1. App loses focus during session.
2. Timer pauses; session flagged as “paused”.
3. On return:
   - Modal: “Do you want to Resume or Restart?”
4. Choice:
   - **Resume**: continue with same time left / remaining questions.
   - **Restart**: start a fresh session; previous is marked `wasAbandoned=true`.

### 5.3 Profile Deletion

1. Grown‑ups / settings → profile management.
2. Choose profile; tap “Delete”.
3. Warning modal explains loss of all progress.
4. Confirm (with adult gate).
5. All associated data removed from local store.

---

## 6. Flow Diagrams (Textual)

### 6.1 Core Play Loop (Timed)

`Home` → `Play` → `GameSession` (question loop: generate → display → answer → feedback → next) → `Summary` → `Play Again` or `Home`.

### 6.2 Upgrade Trigger

`Topics` (locked item tapped) → `Upgrade Modal` →  
- `Not Now` → back to `Topics`.  
- `Upgrade` → `Adult Gate` → `Platform Payment` → `Success` → unlocked content visible.

### 6.3 Practice Mode Loop (Untimed)

`Home` → `Play` → `GameSession (Practice)` (question loop: generate → display → answer → feedback → next; no countdown timer) → child taps `End practice` → `Summary` → `Play Again` or `Home`.
