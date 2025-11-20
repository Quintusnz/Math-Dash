---
title: Core Dash Round Gameplay – Overview
description: Feature overview for single-player dash-style math rounds, including goals, scope, and UX principles.
feature: core-dash-round-gameplay
last-updated: 2025-11-19
version: 0.1.0
related-files:
  - ../../design-system/overview.md
  - ../../design-system/components.md
  - ../../design-system/tokens/colors.md
  - ../../design-system/tokens/animations.md
  - ../../../requirements2.md
dependencies:
  - topic-and-skill-library
  - game-modes
  - player-profiles-and-avatars
status: draft
---

# Core Dash Round Gameplay

## Overview

Core Dash Round Gameplay covers the single-player game loop where a child answers one math question at a time under time or question-count constraints. It is the primary way learners build fluency and underpins most engagement and progress tracking.

## Table of Contents

- Primary user goals
- Success criteria
- Related flows and screens
- Dependencies and interactions

## Primary User Goals

- Children can quickly start a round with minimal configuration.
- Each question is clear, legible, and easy to answer with a tap.
- Feedback for correct/incorrect answers is immediate and encouraging.
- Rounds feel short and focused, encouraging multiple plays per session.

## Success Criteria

- 1–2 taps from profile home to active gameplay.
- Touch-to-feedback latency under 50 ms on target devices.
- Clear summary after each round with accuracy and total questions.
- Ability to immediately replay, change topic/mode, or return home.

## Related Documentation

- `Docs/user-flows.md` – First-time setup, returning child play loop.
- `Docs/information-architecture.md` – “Play” section.
- `design-documentation/design-system/components.md` – Game Session and Summary screens.
- `requirements2.md` – Section 3.1 Feature 1 – Core Dash Round Gameplay.

## Implementation Notes

- Use design tokens from the design system for colors, spacing, and motion.
- Ensure the game loop remains responsive even on low-spec Chromebooks and tablets.
