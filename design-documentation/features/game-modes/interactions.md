---
title: Game Modes – Interactions
description: Interaction behaviors for choosing modes and mode-specific feedback.
feature: game-modes
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

# Game Modes – Interactions

## Mode Selection

- Mode buttons respond with clear hover/pressed states.
- Selecting a mode updates summary copy and optional hint text.

## Transitions

- Switching modes does not reset topic selection.
- Starting a round transitions from Pre-Game to Game Session using `medium` duration and standard easing.

## Accessibility

- Mode options must be reachable via keyboard and have clear labels.
- Screen readers should announce mode name and brief description.
