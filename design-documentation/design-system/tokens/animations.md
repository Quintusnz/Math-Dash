# Ready Steady Math – Animation & Motion Tokens

> **Note:** Ready Steady Math was previously referred to as 'Math Dash' in earlier internal drafts.

## 1. Timing Durations

- `motion.duration.micro` – 100–150 ms (hover, tap feedback, chip selection)
- `motion.duration.short` – 200–250 ms (button presses, simple reveals)
- `motion.duration.medium` – 300–400 ms (screen transitions, small modals)
- `motion.duration.long` – 500–700 ms (confetti, celebratory banners, complex overlays)

## 2. Easing Functions

- `motion.easing.standard` – `cubic-bezier(0.4, 0.0, 0.2, 1)` (default ease-in-out for most transitions)
- `motion.easing.decelerate` – `cubic-bezier(0.0, 0.0, 0.2, 1)` (elements entering or expanding)
- `motion.easing.accelerate` – `cubic-bezier(0.4, 0.0, 1, 1)` (elements exiting or collapsing)
- `motion.easing.spring-soft` – for playful micro-interactions only (e.g., slight overshoot on achievement badges), tuned to avoid excessive bounce.

## 3. Usage Guidelines

- Use `micro` durations for hover/press states and subtle UI feedback so the interface feels responsive.
- Use `short` durations for most button state changes and simple card/tile hover effects.
- Use `medium` durations for navigation between main screens (e.g., Play → Game Session → Summary) and modal dialogs.
- Reserve `long` durations for celebrations (e.g., streak achieved, new high score), and ensure they are skippable or do not block input.

## 4. Accessibility & Reduced Motion

- Respect the users `prefers-reduced-motion` setting:
  - Disable non-essential animations or reduce them to fades with `micro` or `short` durations.
  - Keep critical feedback (correct/incorrect) visible through color/icon changes even when motion is reduced.
- Avoid rapid flashing or strobing; never animate at frequencies likely to trigger photosensitive reactions.

## 5. Implementation Notes

- Map these tokens to constants in the UI codebase so that durations and easings remain consistent.
- Reuse the same easing and duration for similar interactions (e.g., all modals use `medium` + `standard`).
- When in doubt, prefer subtler motion that supports comprehension over decorative animation.
