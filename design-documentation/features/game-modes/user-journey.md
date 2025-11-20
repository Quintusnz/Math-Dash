---
title: Game Modes – User Journey
description: User journeys for selecting and playing different modes.
feature: game-modes
last-updated: 2025-11-19
version: 0.1.0
related-files:
  - README.md
  - ../../design-system/components.md
  - ../../../Docs/user-flows.md
dependencies:
  - core-dash-round-gameplay
status: draft
---

# Game Modes – User Journey

## Child Mode Selection

1. From Play Home, child taps `Change Topic/Mode`.
2. In Pre-Game, sees mode options (e.g., “60s Dash”, “10 Questions”, “Practice”).
3. Selects a mode; brief description appears.
4. Taps `Start Dash` to begin.

## Timed Mode Journey

- As described in core gameplay user journey; timer visible throughout.

## Question-Count Mode Journey

- Similar to timed, but with remaining-questions indicator instead of time.

## Practice Mode Journey

- No timer, optional question counter.
- `End practice` button visible; summary appears when tapped.

## Related Documentation

- `requirements2.md` §3.3 Game Modes.
- `Docs/user-flows.md` §3. Game modes in pre-game configuration.
