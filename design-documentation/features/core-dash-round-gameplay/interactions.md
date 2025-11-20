---
title: Core Dash Round Gameplay – Interactions
description: Interaction details for answering questions, feedback timing, and navigation between gameplay screens.
feature: core-dash-round-gameplay
last-updated: 2025-11-19
version: 0.1.0
related-files:
  - screen-states.md
  - ../../design-system/components.md
  - ../../design-system/tokens/animations.md
dependencies:
  - design-system
status: draft
---

# Core Dash Round Gameplay – Interactions

## Answer Interaction

- Tap on an answer button:
  - Immediate pressed state feedback (within 50 ms).
  - Disable all answer buttons to prevent multiple submissions.
  - Evaluate correctness and transition to Correct/Incorrect state.

## Feedback Timing

- Correct answer:
  - Show Success state for up to 400 ms.
  - Auto-advance to next question with smooth transition.
- Incorrect answer:
  - Show Error state and highlight correct answer for up to 1,000 ms.
  - Auto-advance after delay.

## Navigation Interactions

- From Play Home:
  - `Play` → Pre-Game (if configuration needed) or directly to Game Session (for quick play).
- From Summary:
  - `Play Again` → start new session with same topic and mode.
  - `Change Topic` → Topics screen with previously used topic highlighted.
  - `Back to Home` → Profile Home.

## Pause / Resume

- Backgrounding the app or switching context should:
  - Pause the timer.
  - On return, display a `Resume / Restart` modal.

## Error Handling

- If a question cannot be generated, skip gracefully to the next one.
- If a transient error occurs (e.g., local data issue), show a brief message in grown-ups area; never surface technical errors in child view.

## Accessibility Considerations

- Answer states (correct/incorrect) use both color and icon/label changes.
- Focus order for keyboard/switch input:
  - Timer (optional), question text, answers in reading order, then navigation controls.

## Implementation Notes

- Map timing values to `motion.duration.*` tokens and easing curves to `motion.easing.*`.
