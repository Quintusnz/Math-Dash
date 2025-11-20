---
title: Game Modes – Implementation Notes
description: Implementation details for supporting different modes using shared gameplay code paths.
feature: game-modes
last-updated: 2025-11-19
version: 0.1.0
related-files:
  - ../../../requirements2.md
  - ../../design-system/components.md
  - ../../design-system/tokens/animations.md
dependencies:
  - core-dash-round-gameplay
status: draft
---

# Game Modes – Implementation Notes

## Mode Configuration

- Mode enum and configuration from `requirements2.md` §2 and §3.3.
- Each mode defines:
  - Timer duration (or none for practice).
  - Question target (for question-count modes).

## Shared Logic

- Use a shared game loop with branching only on timer/question-count behavior.
- Avoid duplicating UI or business logic per mode.

## Analytics

- Include mode in session start/completion events for analysis.
