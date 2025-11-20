# Math Dash – Design System Overview

## 1. Design Goals

- Feel fun and energetic for children aged 6–11 without feeling babyish.
- Keep interaction friction extremely low (1–2 taps to start a round).
- Use bold but minimal visuals with generous whitespace for focus.
- Provide rapid, unambiguous feedback under time pressure.
- Maintain a clear separation between child play area and grown‑up dashboards.
- Be accessible and inclusive by default across devices and input types.

## 2. Color System

See `Docs/Math Dash Color Spec.txt` for the full palette and rationale; this section defines how those colors are applied in UI.
*For implementation tokens, see [Colors](./tokens/colors.md).*

- **Primary 500 (`#3056D3`)** – brand blue‑violet; primary CTAs, key headers, selected nav state.
- **Primary 600 (`#2338A0`)** – hover/pressed state for primary buttons, focus rings on light backgrounds.
- **Primary Light (`#E0E7FF` / `#F3F6FF`)** – soft background panels in the Play area, hover backgrounds on answer buttons.
- **Secondary 500 (`#1FB8A6`)** – secondary buttons, practice/adaptive mode chips, non‑primary accents.
- **Secondary Lights (`#D2F5F1`, `#F0FBFA`)** – background tints for topic tiles, friendly highlights behind avatars.
- **Accents** – gold, coral, sky blue reserved for rewards, streaks, badges, and special highlights only.
- **Semantic colors** – strong green for success, red for error, amber for warning, bright blue for info (always paired with icons/text, not used alone).
- **Neutrals** – structure, dividers, card backgrounds, teacher dashboards.

Accessibility notes:

- Primary and secondary colors on light backgrounds must meet WCAG 2.1 AA for text and icons.
- All filled buttons on saturated colors use white text and 3:1+ contrast for large labels.
- Avoid Accent Gold as a text color on white; restrict it to icons, fills, and badges.
- Focus rings should be visually distinct from both background and content (e.g., Primary 600 on light, white border on dark).

## 3. Typography
*For implementation tokens, see [Typography](./tokens/typography.md).*

- **Primary Typeface:** A highly legible sans‑serif stack (e.g., `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`).
- **Hierarchy (desktop reference sizes):**
  - `H1` – 28–32 px / 1.25 line height: page titles (e.g., “Play”, “My Progress”).
  - `H2` – 22–24 px / 1.3: section headers, large card titles.
  - `H3` – 18–20 px / 1.3: subsection headers, tile titles.
  - `Body` – 14–16 px / 1.4–1.5: primary UI copy.
  - `Caption` – 12–13 px / 1.4: helper text, timestamps, micro‑copy.

Guidelines:

- Use sentence‑case headings everywhere; avoid all caps except small labels.
- Limit to 2–3 weights (Regular 400, Medium 500, Bold 600/700) to keep rendering crisp.
- Maintain line length of 45–75 characters for body text in grown‑ups views.
- On mobile, slightly increase body size (e.g., 16 px) to preserve readability.

## 4. Layout & Spacing
*For implementation tokens, see [Spacing](./tokens/spacing.md).*

- **Base spacing unit:** 8 px; all margins, padding, and gaps are multiples of 4/8 px.
- **Grid:**
  - Mobile: 4 columns, 16 px page padding.
  - Tablet: 8 columns, 24 px page padding.
  - Desktop: 12 columns, 32–40 px max page padding.
- **Cards:** Rounded corners (8–12 px), 1 px neutral border or soft shadow, 16–24 px internal padding.
- **Tap Targets:**
  - Minimum 44×44 px across platforms.
  - Primary answer buttons typically 56–64 px high with generous horizontal padding.

Play area:

- Background: Neutral 50 or Primary ultra‑light to keep play space bright and low‑stress.
- Question card centered; on larger screens, constrained to comfortable reading width.
- Answers laid out in a clear grid (2–3 per row on mobile, up to 4 on wider screens).
- Timer and score pinned consistently (e.g., top center for children, top right for grown‑ups).

Grown‑ups area:

- More neutral‑heavy palette; sections and cards separated with whitespace and subtle dividers.
- Denser tabular data allowed but avoid more than 3–4 columns on mobile.

## 5. Core Components (High‑Level)

- **Buttons**
  - Primary: filled, Primary 500 background, white text, full‑width on mobile in child flows.
  - Secondary: outline on Primary/Secondary 500 or neutral fill with colored text for lower‑emphasis actions.
  - Destructive: filled in Error color for irreversible adult actions (e.g., delete profile) and never exposed in child‑only contexts.
  - Sizes: default (for most UI), large (Primary CTAs and answer buttons), compact (chips, filters in grown‑ups area only).

- **Cards / Tiles**
  - Topic tiles: icon, topic name, category color band, lock icon if premium, mini progress tag (proficiency band).
  - Profile tiles: avatar, name, concise progress snippet (e.g., “Most plays: 3× table · Developing”).

- **Status Elements**
  - Progress bars: linear; used for time remaining, daily goals, and syncing where needed.
  - Proficiency chips: labeled Weak / Developing / Secure / Advanced, with consistent color mapping across the product.

- **Feedback**
  - Answer state changes: immediate visual change on tap, then semantic feedback (correct/incorrect) within the latency budget.
  - Toasts: small, non‑blocking messages anchored near the bottom/top, limited in number to avoid noise.
  - Modals: reserved for critical decisions (resume/restart, upgrade, delete) and always include a clear primary/secondary action.

## 6. Interaction Patterns
*For animation tokens, see [Animations](./tokens/animations.md).*

- **Tap Feedback:** every interactive control has a pressed state (scale, color, or shadow change) within 50 ms.
- **Transitions:**
  - Micro‑interactions (hover, press, chip selection): 100–150 ms.
  - Screen transitions: 200–300 ms with ease‑out or ease‑in‑out curves.
- **Answer Sequence:**
  - Tap → lock further input for that question → flash correct/incorrect state → delay (≤ 400 ms for correct, ≤ 1,000 ms for incorrect) → auto‑advance.
- **Focus States:**
  - Keyboard/switch focus outlines must be clearly visible, not solely a color shift.
  - Logical tab order: primary actions then secondary actions; content sections in reading order.

## 7. Children vs Grown‑Ups Modes

- **Child Mode**
  - More color and playful iconography, but limited to 2–3 simultaneous saturated accents per screen.
  - Minimal text; rely on strong visual signifiers (iconography, color, layout) and short labels.
  - No direct exposure to payment forms, detailed billing information, or complex settings.
  - Upgrade prompts appear only as locked states or friendly explanations; any actual payment step is behind an adult gate.

- **Grown‑Ups / Teacher Mode**
  - Neutral‑first color scheme with Primary/Secondary used for emphasis and navigation.
  - Denser layouts allowed but must still respect minimum touch targets and contrast.
  - All destructive, payment, analytics, and export controls live exclusively here, after an adult gate.
