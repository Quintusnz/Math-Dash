# Ready Steady Math – Core Screens & Components

> **Note:** Ready Steady Math was previously referred to as 'Math Dash' in earlier internal drafts.

## 1. Profile Selection Screen

- **Purpose:** Choose a `PlayerProfile` on launch when more than one exists.
- **Contents:**
  - App logo / wordmark.
  - Grid of profile tiles (max 8).
    - Avatar.
    - Child name.
    - Small snippet (e.g., “Most plays: 3× table, Developing”).
  - CTA: “Add Player” (under a “Grown‑Ups” gate or separate path).
- **States:**
  - No profiles → auto‑redirect to “Create Profile”.
  - Many profiles → allow horizontal scroll or pagination.
- **Responsive behavior:**
  - Mobile: 2‑column grid, vertical scroll; logo centered above grid.
  - Tablet: 3‑column grid; “Add Player” tile shown as part of the grid.
  - Desktop: 4‑column grid; side padding increased per layout spec.

---

## 2. Create Profile Screen

- **Purpose:** Onboard new players.
- **Contents:**
  - Name input field.
  - Age band picker (chip buttons: `Y1–2`, `Y3–4`, `Y5–6`).
  - Avatar picker (simple, inclusive illustrations).
  - CTA: “Create Player”.
- **Validation:**
  - Name: 1–20 chars after trim; not empty.
  - Warnings for duplicate names (non‑blocking).
- **Responsive behavior:**
  - Mobile: single column with vertical stacking; primary CTA pinned to bottom when possible.
  - Tablet/Desktop: form and avatar picker may sit side‑by‑side, respecting min tap sizes.

---

## 3. Play Home (Per Profile)

- **Purpose:** Primary home for a child.
- **Contents:**
  - Greeting (“Hi, Ava!”).
  - Big “Play” CTA (last topic + mode).
  - Secondary buttons:
    - “Change Topic/Mode”.
    - “My Progress”.
  - Small area for streak/day goal (post‑MVP).
- **States:**
  - First time → highlight default topic/mode.
  - Goal complete → celebratory banner.
- **Responsive behavior:**
  - Mobile: “Play” CTA is full‑width, centered; secondary actions stacked beneath.
  - Tablet/Desktop: layout may use a 2‑column card (Play CTA left, progress/streak summary right).

---

## 4. Pre‑Game Configuration

- **Purpose:** Confirm topic & mode before starting a session.
- **Contents:**
  - Topic pill with name and small icon.
  - Mode selector (2–3 prominent options: e.g., “60s Dash”, “10 Questions”, “Practice” + “More options”).
  - Information labels for each mode (time/number of questions).
  - Primary CTA: “Start Dash”.
- **Responsive behavior:**
  - Mobile: vertical list of large mode cards; “Start Dash” anchored at bottom.
  - Tablet/Desktop: modes arranged horizontally as large buttons with clear descriptions.

---

## 5. Game Session Screen

- **Purpose:** Main gameplay interface.
- **Layout:**
  - **Top:** Timer bar (for timed modes) or question counter (for fixed/practice) plus optional small icon for mode.
  - **Middle:** Question card (e.g., “7 × 8 = ?”).
  - **Bottom:** Answer buttons (3–6 options).
- **Behavior:**
  - Single question visible at a time.
  - Answer buttons (see state matrix below for exact treatments):
    - Default: white with neutral border and clear label.
    - Hover/pressed: Primary/Secondary light backgrounds with slight scale/elevation.
    - On correct: fill Success green with subtle glow and check icon.
    - On incorrect: selected answer flashes Error red; correct answer highlighted in Success green.
  - Timer continues (or according to consistent rule) during feedback.
- **Responsive behavior:**
  - Mobile: timer bar spans full width at top; question and answers stacked with generous spacing.
  - Tablet: question card centered with 2×2 or 3×2 answer grid depending on options count.
  - Desktop: question and answers kept within a central column to avoid excessive line length.
- **Edge Cases:**
  - Paused state (app backgrounded).
  - Low‑time warning (bar turns amber).

---

## 6. Summary Screen

- **Purpose:** Show session result and next actions.
- **Contents:**
  - Big score: total correct, total questions.
  - Accuracy percentage.
  - Mode used (e.g., “60s Dash”).
  - Personal best indicator if applicable.
  - CTAs:
    - “Play Again”.
    - “Change Topic”.
    - “Back to Home”.
- **Optional:**
  - Tiny chart of last few attempts.
  - Achievement unlocks overlay.
- **Responsive behavior:**
  - Mobile: stacked layout with score at top, CTAs full‑width at bottom.
  - Tablet/Desktop: two‑column layout possible (left: stats, right: suggested next actions/topics).

---

## 7. Topics Screen

- **Purpose:** Choose what to practise.
- **Contents:**
  - Categories: Multiplication, Division, Number Bonds, Doubles/Halves.
  - Within each:
    - Topic tiles with:
      - Name (e.g., “2× table”).
      - Icon indicating category.
      - Progress indicator (e.g., chip: Weak/Developing/Secure/Advanced).
      - Lock badge for premium topics.
- **Behavior:**
  - Tapping unlocked topic configures next round.
  - Tapping locked topic shows upgrade teaser modal.
- **Responsive behavior:**
  - Mobile: vertical list or 2‑column grid of topic tiles per category.
  - Tablet/Desktop: 3–4 columns within each category section, with clear headings and spacing.

---

## 8. My Progress Screen

- **Purpose:** Show per‑topic proficiency per profile.
- **Contents:**
  - Grid/list of topics:
    - Name.
    - Proficiency band.
    - Optional trend arrow/sparkline.
  - Filter/sort by category or proficiency.
- **Interaction:**
  - Tap topic → topic detail.
- **Empty States:**
  - If little data: friendly prompts to play more.
- **Responsive behavior:**
  - Mobile: single‑column list with clear chips; filters accessible via a sheet or simple dropdown.
  - Tablet/Desktop: grid layout for topics plus filters in a side rail or header bar.

---

## 9. Topic Detail Screen

- **Purpose:** Provide deeper insight into one topic.
- **Contents:**
  - Topic name and category.
  - Recent stats:
    - Best score in key mode.
    - Recent accuracy %.
    - Questions attempted.
    - Last played date/time.
  - CTA: “Play this Topic”.
- **Empty State:**
  - <10 questions → message like “You haven’t practised this yet. Try a 60s round!”.
- **Responsive behavior:**
  - Mobile: stacked modules (headline, stats, chart, CTA) in one column.
  - Tablet/Desktop: stats and chart can sit side‑by‑side above the CTA.

---

## 10. Grown‑Ups Area Home

- **Purpose:** Adult‑only settings, deeper analytics, upgrades.
- **Entry:**
  - “Grown‑Ups” button in top nav; adult gate.
- **Contents:**
  - Tabbed or card layout:
    - “Children” – list of child profiles with quick stats.
    - “Progress” – link to per‑child dashboards (similar to My Progress, but more detail).
    - “Goals & Streaks” – configure daily question targets, view streaks.
    - “Upgrade & AI” – purchase core upgrade, manage AI credit packs (post‑MVP).
    - “Settings” – analytics opt‑out, data deletion, account details.
- **Responsive behavior:**
  - Mobile: stacked cards with a simple segmented control or tabs at the top.
  - Tablet/Desktop: true tabbed navigation with content in a wider card grid or table layouts.

  ---

  ## 11. Component State Matrices

  The following tables define visual and interaction states for core reusable components. Colors reference the design tokens in `design-documentation/design-system/tokens/colors.md` and timing references the animation tokens (see `design-documentation/design-system/tokens/animations.md`).

  ### 11.1 Buttons (Primary / Secondary / Destructive)
  *See full specification in [Buttons](./components/buttons.md)*

  | State       | Primary Button                                 | Secondary Button                               | Destructive Button                           |
  |------------|-------------------------------------------------|------------------------------------------------|----------------------------------------------|
  | Default    | Fill `primary.500`, label white, medium weight | Outline `primary.500` on white, label `primary.500` | Fill `semantic.error`, label white           |
  | Hover      | Fill `primary.600`, slight elevation (+1)      | Slight tint of `primary.100`, border unchanged | Fill darkened error, slight elevation (+1)   |
  | Pressed    | Fill `primary.600`, scale 0.98, reduced shadow | Solid `primary.50` fill, border `primary.500` | Solid error darker shade, scale 0.98         |
  | Focus      | Same as default + 2 px outline `primary.600`   | Same as default + 2 px outline `primary.600`  | Same as default + 2 px outline `primary.600` |
  | Disabled   | Fill `neutral.200`, label `neutral.400`        | Border `neutral.200`, label `neutral.400`     | Fill `neutral.200`, label `neutral.400`      |

  Behavior notes:

  - Buttons use 100–150 ms ease‑out transitions for color, elevation, and scale.
  - Disabled buttons are non-focusable and never show hover/pressed states.

  ### 11.2 Answer Buttons
  *See full specification in [Buttons](./components/buttons.md)*

  | State          | Visual Treatment                                                                 | Behavior                                                |
  |----------------|-----------------------------------------------------------------------------------|---------------------------------------------------------|
  | Default        | White fill, border `neutral.200`, label `neutral.700`                            | Hover/press feedback; selectable                         |
  | Hover          | Fill `primary.50` or `secondary.50`, border `primary.100`                        | Transition 100 ms; pointer cursor on desktop            |
  | Pressed        | Fill `primary.100` or `secondary.100`, slight scale 0.98                         | Locks in selection for that question                    |
  | Correct        | Fill `semantic.success`, label white, subtle outer glow in Success color         | Shown on selected correct answer and revealed correct   |
  | Incorrect      | Selected answer: fill `semantic.error`, label white; others dimmed slightly      | Shown briefly before advancing                          |
  | Disabled (lock)| Reduced opacity (~60%), no hover/press, border `neutral.200`, label `neutral.400`| Used while feedback is visible / during transitions     |

  Behavior notes:

  - Once an answer is selected, all answer buttons enter Disabled state until the next question.
  - Correct/Incorrect feedback is shown for ≤ 400 ms (correct) or ≤ 1,000 ms (incorrect) before transitioning.

  ### 11.3 Topic Tiles
  *See full specification in [Cards](./components/cards.md)*

  | State              | Visual Treatment                                                                                         |
  |--------------------|---------------------------------------------------------------------------------------------------------|
  | Free / Unlocked    | Card background white or `neutral.50`, category color strip (Primary/Secondary/Accent Sky), title `neutral.900`, proficiency chip visible |
  | Hover / Pressed    | Slight elevation and shadow, or tint background with category light color                               |
  | Premium Locked     | Apply `neutral.100` overlay, reduce saturation, show lock icon, title remains legible (`neutral.700`)   |
  | Selected (current) | Add 2 px outline in `primary.500` or `secondary.500`, slightly stronger elevation                       |

  Behavior notes:

  - Tapping a locked tile opens the upgrade teaser modal instead of starting a round.
  - Tile tap targets fill the entire card area; internal controls should not reduce hit area.
