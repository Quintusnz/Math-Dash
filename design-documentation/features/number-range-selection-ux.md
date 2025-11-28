# Number Range Selection UX Design

**Feature:** Addition & Subtraction Setup Flow – Number Range Selection  
**Version:** 1.1  
**Last Updated:** November 2025  
**Status:** Implemented (MVP)

---

## Implementation Notes

The Number Range Selection feature has been implemented following the MVP recommendation (Pattern A + Pattern D).

### Key Implementation Files
- `src/components/game/setup/NumberRangeSelector.tsx` - Main component with preset tiles and custom range panel
- `src/components/game/setup/NumberRangeSelector.module.css` - Styling following design tokens
- `src/lib/stores/useGameStore.ts` - Updated with `NumberRange` type and config
- `src/lib/game-engine/question-generator.ts` - Updated to generate questions based on number range
- `src/components/game/setup/GameSetup.tsx` - Updated flow to show NumberRangeSelector for add/sub operations

### What Was Implemented
- **Pattern A (Preset Range Tiles):** 4 preset zones (Starter, Builder, Challenge, Pro)
- **Pattern D (Custom Range Panel):** Simplified version with min/max steppers, range type toggle, and preview
- **Responsive design:** 2x2 grid on mobile, 4x1 on tablet/desktop
- **Animations:** Using Motion (Framer Motion) for smooth interactions
- **Accessibility:** Proper ARIA labels, focus states, and keyboard navigation

---

## UX Goals

### Primary Objectives

1. **Simplicity for kids (6–11):** The interface must be usable by a 6-year-old with minimal reading. Visual communication over text.
2. **Game feel, not settings feel:** This is "choosing your adventure zone," not "configuring difficulty parameters."
3. **Progression signaling:** Children should feel they're "leveling up" when moving to harder ranges.
4. **Adult control without friction:** Parents/teachers can access fine-grained options without cluttering the child's view.
5. **Pedagogical clarity:** Ranges align with curriculum bands (facts within 10, 20, 50, 100) that teachers and parents recognize.

### Design Principles Applied

- **Large tap targets:** Minimum 56px height for primary options; 44×44px minimum for all interactive elements.
- **Low visual noise:** 2–3 saturated colors per screen max; generous whitespace.
- **Immediate feedback:** Selected state is instantly obvious.
- **Progressive disclosure:** Simple presets by default; advanced options behind a clear "More options" control.

### Screen Context

This screen appears in the **Addition & Subtraction setup flow**, typically:
1. User taps "Addition & Subtraction" from the Topics screen.
2. User sees **Number Range selection** (this screen).
3. User taps "Start Dash" → enters gameplay.

---

## Pattern A – Preset Range Tiles (Kid-First)

### Concept Summary

**Name:** "Preset Range Tiles" / "Zone Selector"

A grid of large, visually distinct tiles representing curriculum-aligned difficulty bands. Each tile is a "zone" with a friendly name, numeric description, and example problems. This pattern optimizes for instant comprehension and single-tap selection—perfect for 6–7-year-olds.

**Why it works for kids 6–11:**
- Big, obvious choices reduce decision paralysis.
- Visual differentiation (colors, icons) aids pre-readers.
- Feels like picking a game level, not configuring software.

### Wireframe Notes

#### Layout (Above the Fold)

```
┌─────────────────────────────────────────────────────┐
│  ← Back          Addition & Subtraction             │
├─────────────────────────────────────────────────────┤
│                                                     │
│         Pick Your Number Zone                       │
│         ───────────────────                         │
│                                                     │
│  ┌───────────────────┐  ┌───────────────────┐      │
│  │   ★ STARTER ★     │  │   ★★ BUILDER ★★   │      │
│  │   Up to 10        │  │   Up to 20        │      │
│  │   ─────────────   │  │   ─────────────   │      │
│  │   7 + 3 = ?       │  │   13 + 6 = ?      │      │
│  │   9 - 2 = ?       │  │   17 - 8 = ?      │      │
│  │                   │  │                   │      │
│  │  Years 1–2  ✓     │  │  Years 2–3        │      │
│  └───────────────────┘  └───────────────────┘      │
│                                                     │
│  ┌───────────────────┐  ┌───────────────────┐      │
│  │  ★★★ CHALLENGE    │  │  ★★★★ PRO ★★★★    │      │
│  │   Up to 50        │  │   Up to 100       │      │
│  │   ─────────────   │  │   ─────────────   │      │
│  │   34 + 15 = ?     │  │   67 + 28 = ?     │      │
│  │   48 - 23 = ?     │  │   91 - 54 = ?     │      │
│  │                   │  │                   │      │
│  │  Years 3–4        │  │  Years 5–6        │      │
│  └───────────────────┘  └───────────────────┘      │
│                                                     │
│               ⚙ More options                        │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │            ▶  Start Dash                     │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### Visual Design Specifications

**Tile Design:**
- **Size:** Minimum 140×160px on mobile; scale up on tablet/desktop.
- **Background:** `--color-neutral-100` (default), `--color-primary-100` (selected).
- **Border:** 2px solid `--border-subtle`; selected = 3px solid `--color-primary-500`.
- **Border radius:** `--radius-lg` (16px).
- **Shadow:** `--shadow-sm` default; `--shadow-md` on hover/selected.

**Tile Content:**
- **Level name:** 18–20px, bold, `--font-heading`, `--color-neutral-900`.
- **Numeric range:** 14–16px, semi-bold, `--color-primary-600`.
- **Examples:** 13–14px, `--color-neutral-500`, monospace or tabular figures.
- **Age hint:** 12px, `--color-neutral-400`, italicized (e.g., "Years 1–2").

**Stars/Badges:**
- Show 1–4 stars to indicate difficulty level visually.
- Stars use `--color-accent-gold` for visual appeal.

**Mastery Indicator (Progression):**
- If child has previously achieved proficiency at a level, show a small checkmark `✓` or completion ring.
- Ring: `--color-success` filled based on mastery percentage.
- This signals "I've conquered this zone" and encourages progression.

#### Control Types

- **Tiles:** Radio-button behavior (single selection).
- **"More options" link:** Text link, leads to Pattern D (Advanced Panel).
- **"Start Dash" button:** Primary CTA, full-width on mobile.

#### Labels & Microcopy

| Element | Text | Notes |
|---------|------|-------|
| Screen title | "Pick Your Number Zone" | Playful, zone/level metaphor |
| Tile labels | "Starter", "Builder", "Challenge", "Pro" | Progression-oriented names |
| Range description | "Up to 10", "Up to 20", etc. | Clear numeric boundary |
| Examples | "7 + 3 = ?", "9 - 2 = ?" | Show both add/subtract |
| Age hint | "Years 1–2" | Optional, smaller text |
| CTA | "Start Dash" or "Let's Go!" | Action-oriented |

### Interaction & States

#### Entry Behavior (Default Selection)

- **New user:** Default to "Starter (Up to 10)" pre-selected.
- **Returning user:** Remember last-used range for this topic (stored in profile).
- **Adaptive suggestion (future):** Could highlight "Recommended for you" based on performance data.

#### States Table

| State | Visual Treatment |
|-------|-----------------|
| **Default** | White/neutral background, subtle border |
| **Hover** (desktop) | Background shifts to `--color-primary-50`, border darkens slightly |
| **Pressed/Active** | Scale down to 98%, background `--color-primary-100` |
| **Selected** | Bold border `--color-primary-500`, checkmark in corner, background `--color-primary-50` |
| **Completed/Mastered** | Small gold star ring or checkmark overlay in top-right |
| **Locked** (if premium-gated) | Grayscale overlay, lock icon, "Unlock" badge |

#### Touch vs Mouse

- **Touch:** Tap to select. Large tiles ensure easy targeting. No hover state on touch devices.
- **Mouse:** Hover reveals subtle highlight. Click to select.
- **Keyboard:** Tab through tiles, Enter/Space to select. Focus ring uses `--color-primary-600`.

#### Error/Validation

- None required for presets (always valid selection).

---

## Pattern B – Difficulty Ladder / Slider

### Concept Summary

**Name:** "Difficulty Ladder" / "Level Track"

A horizontal or vertical track where the child drags or taps to select a difficulty level. Each stop on the track represents a canonical range. This pattern emphasizes **progression** through a visual metaphor of "climbing" or "advancing."

**Why it works for kids 6–11:**
- Clear spatial metaphor: left/bottom = easy, right/top = hard.
- Feels like choosing a level in a game.
- Works well for children who understand difficulty gradients.

### Wireframe Notes

#### Layout (Horizontal Track – Mobile)

```
┌─────────────────────────────────────────────────────┐
│  ← Back          Addition & Subtraction             │
├─────────────────────────────────────────────────────┤
│                                                     │
│              Choose Your Level                      │
│              ─────────────────                      │
│                                                     │
│    EASY ─────●─────────────────────────── HARD     │
│              ▲                                      │
│         [Starter]                                   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │                                             │   │
│  │     ★ STARTER                               │   │
│  │     Numbers up to 10                        │   │
│  │                                             │   │
│  │     Examples: 7 + 3, 9 - 2                  │   │
│  │     Perfect for: Years 1–2                  │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Level stops: ● Starter  ○ Builder  ○ Challenge  ○ Pro │
│                                                     │
│               ⚙ More options                        │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │            ▶  Start Dash                     │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### Alternative: Vertical Ladder (Tablet/Desktop)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│    [Rocket icon]                                                │
│         │                                                       │
│    ┌────┴────┐      ┌──────────────────────────────┐           │
│    │   PRO   │      │  ★★★★ PRO                    │           │
│    └────┬────┘      │  Numbers up to 100           │           │
│         │           │  67 + 28 = ?   91 - 54 = ?   │           │
│    ┌────┴────┐      └──────────────────────────────┘           │
│    │CHALLENGE│                                                  │
│    └────┬────┘                                                  │
│         │                                                       │
│    ┌────┴────┐  ←─── [Currently Selected]                      │
│    │ BUILDER │                                                  │
│    └────┬────┘                                                  │
│         │                                                       │
│    ┌────┴────┐                                                  │
│    │ STARTER │                                                  │
│    └─────────┘                                                  │
│    [Ground icon]                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Visual Design Specifications

**Track:**
- **Height:** 8px for the track line.
- **Colors:** `--color-neutral-200` for unfilled portion, `--color-primary-500` for filled/completed portion.
- **Stop indicators:** 24–32px diameter circles at each level position.

**Level Stops:**
- **Unselected:** `--color-neutral-200` fill, `--border-subtle`.
- **Selected:** `--color-primary-500` fill, white center dot or checkmark.
- **Completed:** `--color-success` ring or small star badge.

**Detail Card:**
- Shows expanded info for the currently selected level.
- Same styling as Pattern A tiles but larger with more detail.
- Animates smoothly when selection changes.

**Mobile Adaptation:**
- On mobile, each level stop is at least 44×44px tap target.
- Use segmented button row if slider is difficult: `[Starter] [Builder] [Challenge] [Pro]`.

#### Control Types

- **Slider/Stepper:** Discrete steps (not continuous).
- **Alternative:** Segmented control with 4 labeled buttons.
- **Detail card:** Updates reactively based on selection.

#### Labels & Microcopy

| Element | Text |
|---------|------|
| Track labels | "EASY" (left), "HARD" (right) |
| Level names | "Starter", "Builder", "Challenge", "Pro" |
| Tooltip/legend | "Starter = Up to 10, Builder = Up to 20..." |
| CTA | "Start Dash" |

### Interaction & States

#### Entry Behavior

- Default to child's last-used level, or "Starter" for new users.
- Track fills from left up to the selected level (visual progress).

#### States

| State | Visual Treatment |
|-------|-----------------|
| **Idle stop** | Neutral circle, unfilled |
| **Hover** (desktop) | Circle enlarges slightly, tooltip shows level name |
| **Selected** | Filled primary color, detail card visible |
| **Dragging** (if slider) | Thumb follows finger/cursor with smooth animation |
| **Completed/Mastered** | Gold ring or checkmark on the stop |

#### Touch vs Mouse

- **Touch:** Tap on any stop to jump to it. Can also drag the thumb.
- **Mouse:** Click on stops or drag the thumb. Keyboard arrows to move between levels.
- **Important:** Slider thumb must be at least 44×44px for young fingers.

#### Error/Validation

- None for presets (always valid).

---

## Pattern C – Visual Number Line / Zone Selector

### Concept Summary

**Name:** "Number Line Zone Picker" / "Range Explorer"

A horizontal number line (0–100) where predefined "zones" are highlighted. Children can tap a zone to select it, or adults can drag handles to define a custom range. This pattern is the most **visually concrete**—children see the actual number range represented spatially.

**Why it works for kids 6–11:**
- Number lines are a core mental model taught in early math.
- Spatial representation makes abstract "range" concept tangible.
- Zones with labels make selection simple; handles offer adult flexibility.

### Wireframe Notes

#### Layout (Simplified Kid View)

```
┌─────────────────────────────────────────────────────┐
│  ← Back          Addition & Subtraction             │
├─────────────────────────────────────────────────────┤
│                                                     │
│              Pick Your Number Zone                  │
│              ─────────────────────                  │
│                                                     │
│  Number Line:                                       │
│                                                     │
│  0        10        20        50             100   │
│  ├─────────┼─────────┼──────────┼─────────────┤    │
│  │▓▓▓▓▓▓▓▓▓│         │          │             │    │
│  └─────────┴─────────┴──────────┴─────────────┘    │
│     ▲                                              │
│  [STARTER] - Selected                               │
│                                                     │
│  Zone buttons:                                      │
│  ┌────────┐ ┌────────┐ ┌──────────┐ ┌──────────┐  │
│  │Up to 10│ │Up to 20│ │ Up to 50 │ │Up to 100 │  │
│  │SELECTED│ │        │ │          │ │          │  │
│  └────────┘ └────────┘ └──────────┘ └──────────┘  │
│                                                     │
│  Your range: 0 to 10                               │
│  (answers will be between 0 and 10)                │
│                                                     │
│               ⚙ Custom range (grown-ups)           │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │            ▶  Start Dash                     │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### Adult View (With Handles)

```
┌─────────────────────────────────────────────────────┐
│  Custom Range                              [Done ✓] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Drag the handles to set your range:               │
│                                                     │
│  0        10        20        50             100   │
│  ├─────────┼─────────┼──────────┼─────────────┤    │
│       [◀]▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓[▶]                  │
│        ▲                      ▲                     │
│       Min: 5                Max: 35                 │
│                                                     │
│  ┌────────────┐    ┌────────────┐                  │
│  │ Min:  [5 ] │    │ Max: [35 ] │                  │
│  └────────────┘    └────────────┘                  │
│                                                     │
│  Preview: 23 + 8 = ?   17 - 9 = ?                  │
│                                                     │
│  ☐ Keep answers within this range                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### Visual Design Specifications

**Number Line:**
- **Track:** 12–16px height, `--color-neutral-200` background.
- **Selected zone:** `--color-primary-500` fill with subtle gradient.
- **Tick marks:** At 0, 10, 20, 50, 100 (key curriculum boundaries).
- **Labels:** Below ticks, 12–14px, `--color-neutral-500`.

**Zone Chips (Below Number Line):**
- Same styling as segmented buttons.
- Tapping a chip snaps the number line highlight to that zone.
- Size: 64–80px wide, 44px tall minimum.

**Drag Handles (Adult Mode):**
- **Size:** 44×44px minimum tap target.
- **Shape:** Circle or arrow indicator.
- **Color:** `--color-primary-500` with white icon.
- **Shadow:** `--shadow-md` for depth, indicating draggability.

**Numeric Inputs (Adult Mode):**
- Standard text inputs with stepper buttons (+ / -).
- Validation: min ≤ max, both within 0–100.

#### Control Types

- **Zone chips:** Segmented button/radio group.
- **Number line:** Visual display that updates based on selection.
- **Drag handles:** Only in adult "Custom range" mode.
- **Numeric inputs:** Text fields with steppers in adult mode.

### Interaction & States

#### Entry Behavior

- Default: "Up to 10" zone selected.
- Number line shows 0–10 highlighted in primary color.
- Zone chips show "Up to 10" as selected.

#### States

| Element | State | Visual Treatment |
|---------|-------|-----------------|
| Zone chip | Default | `--color-neutral-100` background |
| Zone chip | Hover | `--color-primary-50` background |
| Zone chip | Selected | `--color-primary-500` background, white text |
| Number line zone | Selected | `--color-primary-500` fill |
| Drag handle | Idle | Circle with arrow, `--color-primary-500` |
| Drag handle | Dragging | Scale up to 110%, `--shadow-lg` |
| Drag handle | Disabled | `--color-neutral-300`, no interaction |

#### Touch vs Mouse

- **Touch (Kid mode):** Tap zone chips. Number line is visual-only (no dragging).
- **Touch (Adult mode):** Drag handles or tap-and-hold to move. Can also use numeric inputs.
- **Mouse:** Click chips or drag handles. Keyboard: arrow keys to nudge handles by 5.

#### Error/Validation

- **Min > Max:** Prevent by swapping values automatically.
- **Out of range:** Clamp to 0–100.
- **Visual feedback:** If invalid state briefly occurs, show `--color-error` border on input.

---

## Pattern D – Advanced Custom Range Panel (Grown-Up Only)

### Concept Summary

**Name:** "Custom Range Builder" / "Expert Settings"

A secondary panel accessible via "More options" or "Custom range" link. This provides fine-grained control for parents/teachers who want to specify exact min/max values, operand constraints, or other advanced settings.

**Why it works:**
- Keeps the main child flow clean and simple.
- Adults who want control can access it without overwhelming kids.
- Supports specific pedagogical needs (e.g., "facts to 20 only" for targeted practice).

### Wireframe Notes

#### Trigger Point

From Pattern A, B, or C, a small text link:
```
⚙ More options   or   ⚙ Custom range (grown-ups)
```

This link is:
- Small (14px), `--color-neutral-500`.
- Not visually prominent—kids are unlikely to tap it.
- On tap, it may require a simple adult gate (e.g., "Enter your birth year").

#### Panel Layout (Slide-Up Sheet / Expanding Section)

```
┌─────────────────────────────────────────────────────┐
│  Custom Range Settings                    [✕ Close] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Range Type:                                        │
│  ○ Answer range (results are 0–X)                  │
│  ● Operand range (each number is 0–X)              │
│                                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  Minimum Value          Maximum Value               │
│  ┌─────────────┐       ┌─────────────┐             │
│  │  [−] 0 [+]  │       │ [−] 20 [+]  │             │
│  └─────────────┘       └─────────────┘             │
│                                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  Additional Options:                                │
│                                                     │
│  ☐ Allow answers above max (bridging)              │
│  ☑ No negative results in subtraction              │
│  ☐ Include zero in operands                        │
│                                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  Preview problems:                                  │
│  12 + 7 = ?    18 - 6 = ?    9 + 11 = ?           │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │          Apply Custom Range                  │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │          Reset to Presets                    │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### Visual Design Specifications

**Panel Presentation:**
- **Mobile:** Slide-up bottom sheet covering ~70% of screen.
- **Tablet/Desktop:** Modal dialog (max 480px wide) with overlay dimming background.
- **Background:** `--surface-card` (white).
- **Border radius:** `--radius-xl` (24px) on top corners (sheet) or all corners (modal).
- **Shadow:** `--shadow-lg`.

**Form Controls:**
- **Radio buttons:** For range type selection.
- **Stepper inputs:** Min/max values with [−] and [+] buttons.
- **Checkboxes:** For boolean options.
- **All controls:** 44px minimum height, clear labels.

**Typography:**
- **Section labels:** 16px, `--font-heading`, `--color-neutral-700`.
- **Option labels:** 14–15px, `--font-body`, `--color-neutral-700`.
- **Helper text:** 13px, `--color-neutral-500`.

**Buttons:**
- **"Apply Custom Range":** Primary button, full-width.
- **"Reset to Presets":** Secondary/ghost button below.
- **"✕ Close":** Icon button in top-right corner.

#### Control Types

- **Range type:** Radio group (Answer range vs. Operand range).
- **Min/Max:** Stepper inputs (number input with +/- buttons).
- **Options:** Checkbox toggles.
- **Preview:** Read-only example problems, regenerated on settings change.

#### Labels & Microcopy

| Element | Text | Notes |
|---------|------|-------|
| Panel title | "Custom Range Settings" | Clear adult language |
| Range type option 1 | "Answer range (results are 0–X)" | Clarifies what the range limits |
| Range type option 2 | "Operand range (each number is 0–X)" | Alternative constraint |
| Min/Max labels | "Minimum Value", "Maximum Value" | Standard form labels |
| Option: bridging | "Allow answers above max (bridging)" | For 8+7=15 when max=10 |
| Option: no negatives | "No negative results in subtraction" | Default ON |
| Option: zero | "Include zero in operands" | Some curricula exclude 0 |
| Preview label | "Preview problems:" | Shows what child will see |
| Primary CTA | "Apply Custom Range" | Confirms and closes |
| Secondary CTA | "Reset to Presets" | Returns to simple tiles/zones |

### Interaction & States

#### Entry Behavior

- When opened from preset selection, pre-fill based on current preset.
  - E.g., if "Up to 20" selected: Operand range, min=0, max=20.
- Preview problems update in real-time as settings change.

#### States

| Element | State | Visual Treatment |
|---------|-------|-----------------|
| Panel | Opening | Slide up (mobile) / fade in (desktop) 300ms |
| Panel | Closing | Reverse animation |
| Stepper | Disabled at boundary | [−] disabled at min=0, [+] disabled at max=100 |
| Checkbox | Checked | `--color-primary-500` fill with white checkmark |
| "Apply" button | Disabled | If invalid config (shouldn't happen with constraints) |

#### Validation

| Rule | Behavior |
|------|----------|
| Min > Max | Swap values automatically, or prevent by disabling adjustment |
| Min < 0 | Clamp to 0 |
| Max > 100 | Clamp to 100 |
| Conflicting options | Show warning text, e.g., "Bridging disabled when using answer range" |

#### Returning to Main View

- On "Apply Custom Range": Close panel, return to main screen.
- Main screen shows: "Custom: 0–20 (operand)" instead of a preset tile being selected.
- Small "Edit" link next to the custom label to re-open panel.

---

## Pros, Cons, and Fit

### Pattern A – Preset Range Tiles

| Aspect | Assessment |
|--------|------------|
| **Pros** | ✓ Instantly understandable by young children (no reading required beyond numbers) |
| | ✓ Examples show exactly what problems will look like |
| | ✓ Progression feeling from Starter → Pro |
| | ✓ Works identically on all devices |
| | ✓ Very fast—one tap to select, one tap to start |
| **Cons** | ✗ Limited flexibility (only 4 options) |
| | ✗ May feel too "simple" for older kids who want precise control |
| | ✗ Grid takes more vertical space on small screens |
| **Best for** | All ages as default. Especially ideal for 6–8 year olds and first-time users. |

### Pattern B – Difficulty Ladder

| Aspect | Assessment |
|--------|------------|
| **Pros** | ✓ Strong progression metaphor (climbing/advancing) |
| | ✓ Compact layout (single track + detail card) |
| | ✓ Detail card shows rich info without clutter |
| | ✓ Gamified feel |
| **Cons** | ✗ Slider can be fiddly for young children |
| | ✗ "Easy/Hard" labels may be demotivating for some kids |
| | ✗ Requires reading labels to understand mapping |
| | ✗ Vertical ladder takes significant horizontal space |
| **Best for** | Ages 8–11 who understand difficulty gradients. Good for tablet/desktop where track can be larger. |

### Pattern C – Visual Number Line

| Aspect | Assessment |
|--------|------------|
| **Pros** | ✓ Most concrete—children see actual numbers |
| | ✓ Aligns with curriculum (number lines are taught early) |
| | ✓ Flexible: zones for kids, handles for adults |
| | ✓ Great for visual/spatial learners |
| **Cons** | ✗ More complex UI (line + zones + chips) |
| | ✗ Drag handles are difficult for youngest children |
| | ✗ Takes more vertical space than ladder |
| | ✗ May confuse: is the line showing results or operands? |
| **Best for** | Parent-assisted setup. Ages 9–11 can use independently. Excellent for teacher configuration. |

### Pattern D – Advanced Custom Panel

| Aspect | Assessment |
|--------|------------|
| **Pros** | ✓ Full control for adults |
| | ✓ Supports specific pedagogical needs |
| | ✓ Preview ensures expectations are correct |
| | ✓ Hidden from children by default |
| **Cons** | ✗ Higher cognitive load (forms, options) |
| | ✗ Children cannot use independently |
| | ✗ Adds complexity to implementation |
| | ✗ Risk of invalid configurations |
| **Best for** | Teachers, advanced parents. Never for unassisted child use. |

---

## Final Recommendation for MVP

### Primary Recommendation: Pattern A (Preset Range Tiles) + Pattern D (Simple Custom Panel)

**Ship first:**

1. **Pattern A (Preset Range Tiles)** as the default interface for all users.
   - Four tiles: "Starter (Up to 10)", "Builder (Up to 20)", "Challenge (Up to 50)", "Pro (Up to 100)".
   - Each tile shows friendly name, numeric range, 2 example problems.
   - Mastery indicators (checkmark or star ring) if child has previously achieved proficiency.
   - Last-used range remembered per profile.

2. **Pattern D (Custom Range Panel)** in a simplified form behind "More options".
   - Simple adult gate (birth year entry).
   - Min/max stepper for operand range.
   - Checkbox: "No negative results in subtraction" (default ON).
   - Preview problems.
   - "Reset to Presets" option.

### Why This Combination?

| Requirement | How This Meets It |
|-------------|-------------------|
| **Simple for 6–7 year olds** | Tiles are big, visual, one-tap. No reading beyond numbers. |
| **Game feel** | "Pick Your Zone" framing + level names (Starter → Pro) feels like game selection. |
| **Progression** | Mastery indicators encourage moving up. Star ratings on tiles show relative difficulty. |
| **Adult control** | Custom panel gives parents/teachers full min/max control without cluttering kid UI. |
| **Curriculum alignment** | Preset boundaries (10, 20, 50, 100) match standard curriculum bands. |
| **Responsiveness** | Tiles work on phone (2x2 grid), tablet (1x4 row or 2x2), and desktop. |
| **Implementation simplicity** | Preset tiles are straightforward to implement; custom panel is standard form UI. |

### Progressive Enhancement Roadmap

| Phase | Enhancement |
|-------|-------------|
| **MVP** | Pattern A (tiles) + simplified Pattern D (custom panel) |
| **V1.1** | Add mastery indicators to tiles based on performance history |
| **V1.2** | Add Pattern B (ladder slider) as optional alternative for older kids (settings toggle) |
| **V2.0** | Add Pattern C (number line) in custom panel for visual range selection |
| **Future** | AI-recommended "Just Right" zone based on adaptive practice data |

### Implementation Priorities

1. **Core tile layout** with responsive grid.
2. **Selection state management** (Zustand store or local state).
3. **Persistence** of last-used range in Dexie profile data.
4. **Custom panel** with basic min/max controls.
5. **Adult gate** for custom panel access.
6. **Example problem generation** for preview.

### Key Metrics to Track

- **Range selection distribution:** Which tiles are most popular? Are kids progressing up?
- **Custom panel usage:** What % of sessions use custom ranges? What values are set?
- **Time on screen:** Is selection quick (target: <5 seconds for returning users)?
- **Progression patterns:** Do children who start at "Starter" eventually move to "Builder"?

---

## Appendix: Design Token Reference

### Colors Used

```css
/* Tile backgrounds */
--color-neutral-100: #F3F4F6;    /* Default tile */
--color-primary-50: #F3F6FF;     /* Hover/selected subtle */
--color-primary-100: #E0E7FF;    /* Selected tile */

/* Borders and accents */
--color-primary-500: #3056D3;    /* Selected border, CTAs */
--color-primary-600: #2338A0;    /* Focus rings */
--color-accent-gold: #FFB224;    /* Stars, mastery */
--color-success: #16A34A;        /* Completion indicators */

/* Text */
--color-neutral-900: #111827;    /* Primary text */
--color-neutral-700: #374151;    /* Headings */
--color-neutral-500: #6B7280;    /* Secondary text */
--color-neutral-400: #9CA3AF;    /* Hints, timestamps */
```

### Spacing

```css
/* Tile grid */
gap: var(--space-md);            /* 16px between tiles */
padding: var(--space-lg);        /* 24px page padding */

/* Tile internal */
padding: var(--space-md);        /* 16px internal padding */
```

### Typography

```css
/* Tile level name */
font-size: var(--text-h4);       /* 1.25rem / 20px */
font-family: var(--font-heading);
font-weight: 700;

/* Range description */
font-size: var(--text-body);     /* 1rem / 16px */
font-weight: 600;

/* Examples */
font-size: var(--text-body-sm);  /* 0.875rem / 14px */

/* Age hint */
font-size: var(--text-caption);  /* 0.75rem / 12px */
```

### Animation

```css
/* Tile selection */
transition: all var(--motion-duration-short) var(--motion-ease-standard);
/* 220ms cubic-bezier(0.4, 0.0, 0.2, 1) */

/* Panel slide-up */
transition: transform var(--motion-duration-medium) var(--motion-ease-decelerate);
/* 340ms cubic-bezier(0.0, 0.0, 0.2, 1) */
```

---

## Appendix: Accessibility Checklist

| Requirement | Implementation |
|-------------|----------------|
| **Touch targets** | All tiles ≥ 140×140px. All buttons ≥ 44×44px. |
| **Focus visible** | 3px solid `--color-primary-600` outline on focus-visible. |
| **Keyboard nav** | Tab through tiles → More options → Start Dash. Arrow keys within tile grid. |
| **Color contrast** | All text ≥ 4.5:1 ratio. Selected state uses border+background, not color alone. |
| **Screen reader** | Tiles have aria-label: "Starter zone, numbers up to 10, currently selected". |
| **Reduced motion** | Respect `prefers-reduced-motion`: skip animations, use instant state changes. |
| **Error prevention** | Custom panel validates in real-time; no invalid submit state possible. |
