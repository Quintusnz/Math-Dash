# Math Dash – Information Architecture

## 1. Top‑Level Navigation

- **Play**
  - Quick play CTA (last topic + mode).
  - Optional link to change topic/mode.

- **Topics**
  - Catalogue of topics grouped by category.
  - Lock markers for premium topics.
  - Per‑topic progress snippet (band / basic trend).

- **My Progress**
  - Per‑profile progress dashboard.
  - Topic list/grid with proficiency bands and trends.
  - Topic detail views.

- **Grown‑Ups**
  - Adult gate.
  - Child selection.
  - Deeper analytics and progress summaries.
  - Goals and streak settings.
  - Monetization and upgrade entry points.
  - Analytics opt‑out, data controls.

- **Settings**
  - Sound, haptics, language (if applicable).
  - Accessibility options.
  - Analytics opt‑out (if not in Grown‑Ups).
  - About & legal.

## 2. Hierarchy by Area

### 2.1 Child‑Facing Area

- `Home (per profile)`
  - Primary CTA: `Play`.
  - Secondary: `Topics`, `My Progress`.
- `Play`
  - Pre‑game configuration (topic, mode).
  - `GameSession` screen (questions + answers).
  - `Summary` screen.

### 2.2 Topics

- `Category list` (e.g., Multiplication, Division, Number Bonds, Doubles/Halves).
- Within each:
  - `Topic tile` (name, icon, basic progress, lock status).
- `Topic detail` (optional direct play from here).

### 2.3 My Progress (Child View)

- `Topic grid/list` showing proficiency bands.
- `Topic detail` with:
  - Recent best scores.
  - Accuracy.
  - Last played.
  - Encouraging messaging.

### 2.4 Grown‑Ups / Teacher Modes

- `Grown‑Ups Landing`
  - After adult gate.
  - Tabs / sections:
    - **Children** – per‑profile dashboards, goals, streak views.
    - **Classes** (post‑MVP) – teacher tools.
    - **Upgrade & Credits** – core upgrade + AI credits.
    - **Settings** – analytics, data export/delete.

---

## 3. Content Types & Entities

- `PlayerProfile`
- `Topic`
- `GameSession`
- `QuestionAttempt`
- `SkillMetric`
- `Achievement`
- `Class` (post‑MVP, teacher only)
- `AdultAccount` (post‑MVP)

Each entity appears in specific IA locations; see `requirements2.md` Section 2 for fields.

---

## 4. Progressive Disclosure

- **Child Path:**  
  `Profile` → `Play` → `Round` → `Summary`.  
  Optional detours: change topic, change mode, check “My Progress”.

- **Adult Path:**  
  `Grown‑Ups` (gate) → `Child / Class Selection` → `Dashboards and Settings` → `Upgrades`.

- **AI & Premium:**  
  Exposed only inside adult spaces and clearly separated from core free content.

---

## 5. Navigation Principles

- Max two taps from home to playing a round.
- At most 3 prominent choices per screen in child flows.
- Clear back navigation; never trap user behind paywalls.
- Consistent placement of upgrade triggers and adult‑only actions.
