# Math Dash – Accessibility Guidelines

## 1. Standards

- Target WCAG 2.1 AA compliance for:
  - Contrast.
  - Keyboard/switch access.
  - Non‑text content.
- Applicable especially for child‑facing content where rapid recognition is critical.

## 2. Color & Contrast

- Maintain sufficient contrast for all text and key icons:
  - Primary 500 (`#3056D3`) on white/Neutral 50 passes AA for body text.
  - Use white text on saturated success/error/warning buttons.
- Do not rely on color alone to convey correctness:
  - Pair green/red flashes with iconography (tick/cross) and/or micro‑copy.

## 3. Motion & Animation

- Avoid rapid flashing or strobing effects.
- Keep confetti / celebration animations:
  - Under 2 seconds.
  - With reduced motion options in settings.
- Keep question transitions smooth and subtle.

## 4. Input & Focus

- All interactive elements must:
  - Be reachable by keyboard (tab order makes sense).
  - Have clear focus outlines (e.g., Primary Dark or high‑contrast neutral).
- Tap targets ≥ 44×44 px; main action buttons ≥ 56×56 px.

## 5. Screen Readers

- Provide accessible names for:
  - Buttons (e.g., “Play”, “2× table topic tile, developing proficiency”).
  - Toggle controls and settings.
- Announce:
  - Correct/incorrect answer outcomes (short, encouraging strings).
  - Navigation changes (e.g., “Summary screen”).

## 6. Language & Copy

- Keep language simple, at reading level for 8–10‑year‑olds in child views.
- Avoid shaming or anxiety‑inducing language:
  - Prefer “Let’s try that again” over “You failed”.
  - When streaks break, use neutral tone.

## 7. Error Prevention & Recovery

- Confirm destructive actions (profile delete, data reset).
- Provide clear instructions and validation messages:
  - Highlight invalid input fields with both color and text.
- Ensure that network or sync problems:
  - Do not block core offline gameplay.
  - Are communicated via clear banners with retry options.

## 8. Empty, Loading, and Offline States

- **Empty states (no data):**
  - Use a simple illustration or icon, short headline, and one suggested next action (e.g., “Play a 60s round to see progress here”).
  - Avoid overwhelming first‑time users with dense dashboards or tables.
- **Loading states:**
  - Prefer lightweight skeletons for cards/lists over spinners where possible.
  - Announce long‑running loads via ARIA live regions when appropriate.
- **Offline indicators:**
  - Provide a small, persistent, non‑alarming badge or banner indicating offline mode when relevant.
  - Ensure key actions that are unavailable offline are clearly labeled and, where possible, hidden from child flows.

## 9. Testing & Verification

- Use automated contrast checks during design.
- Manually test with:
  - Keyboard‑only navigation.
  - Screen readers where applicable.
  - Reduced motion settings.
