---
title: Game Modes – Screen States
description: Screen states related to mode selection and mode-specific indicators.
feature: game-modes
last-updated: 2025-11-19
version: 0.1.0
related-files:
  - README.md
  - ../../design-system/components.md
  - ../../design-system/overview.md
dependencies:
  - design-system
status: draft
---

# Game Modes – Screen States

## Pre-Game Mode Selection

- Default: last-used mode selected, others available as large buttons or chips.
- First-time: recommended mode (e.g., 60s Dash) highlighted.

## Game Session

- Timed: timer bar shows remaining time, optional time label.
- Question-count: indicator shows remaining/total questions.
- Practice: no timer; may show total questions answered.

## Summary

- Mode chip clearly visible (“60s Dash”, “10 Questions”, “Practice”).

## Related Documentation

- `design-documentation/design-system/components.md` (Pre-Game, Game Session, Summary).
