---
title: Core Dash Round Gameplay – Screen States
description: All UI states for the Play Home, Game Session, and Summary screens for core dash rounds.
feature: core-dash-round-gameplay
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

# Core Dash Round Gameplay – Screen States

## Overview

This document catalogues the key UI states for the Play Home, Game Session, and Summary screens.

## Table of Contents

- Play Home
- Game Session
- Summary

## Play Home

### Default

- Greeting, large `Play` CTA, secondary navigation to Topics and My Progress.
- Optional daily goal snippet.

### First-Time

- Highlighted explanation of default topic and mode.
- Optional tooltip or banner encouraging first play (e.g., “Try a quick 60s dash!”).

### Goal Complete (Post-MVP)

- Small celebratory banner above or below `Play` (“Daily goal complete!”).
- Link to view progress.

## Game Session

### Default Question State

- Timer bar at top (timed) or question counter (practice/question-count).
- Question text centered.
- 3–6 answer buttons in grid layout.

### Correct Answer State

- Selected answer turns Success green with subtle glow.
- Optional check icon appears.
- Other answers dimmed slightly.

### Incorrect Answer State

- Selected answer turns Error red.
- Correct answer also highlighted in Success green.
- Short explanatory microcopy optional (e.g., “This one is 56”).

### Paused State

- Timer stopped.
- Overlaid modal with message (“Paused”) and actions (`Resume`, `Restart`).

## Summary

### Standard Summary

- Big score area with total correct and total questions.
- Accuracy percentage and simple label (e.g., “Nice work!”).
- Mode chip (e.g., “60s Dash”).

### Personal Best

- Personal best badge or ribbon (“New best score!”).
- Optional small confetti animation.

### Low Data / Very Short Session

- If < 3 questions answered, summary notes that this session may not count towards stats.

## Related Documentation

- See `design-documentation/design-system/components.md` for base layouts.
- See `design-documentation/design-system/tokens/animations.md` for motion behavior.
