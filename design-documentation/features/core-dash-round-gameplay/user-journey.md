---
title: Core Dash Round Gameplay – User Journey
description: Detailed user journey for playing single-player math dash rounds from entry to completion.
feature: core-dash-round-gameplay
last-updated: 2025-11-19
version: 0.1.0
related-files:
  - README.md
  - ../../design-system/components.md
  - ../../../Docs/user-flows.md
dependencies:
  - topic-and-skill-library
  - game-modes
status: draft
---

# Core Dash Round Gameplay – User Journey

## Overview

This document describes the end-to-end journey for a child playing a core dash round, from entering the Play area through to summary and next action.

## Table of Contents

- Entry points
- Primary journey (timed mode)
- Practice mode journey
- Edge cases (pause, offline)

## Entry Points

- From Profile Home:
  - Tap `Play` to start a round using last-used topic and mode.
- From Topics:
  - Select a topic tile, adjust mode if needed, then tap `Start Dash`.

## Primary Journey – Timed Mode

1. **Profile Home**
   - Shows greeting and big `Play` CTA.
   - Optional streak/day goal shown.
2. **Pre-Game Configuration**
   - Topic and mode visibly selected.
   - `Start Dash` CTA prominent.
3. **Game Session (Timed)**
   - Timer bar visible at top.
   - Single question card and answer buttons.
   - Child taps an answer → immediate feedback (correct/incorrect) → next question.
4. **Session End**
   - Timer reaches zero.
   - Auto-transition to Summary screen.
5. **Summary**
   - Shows total questions, correct/incorrect, accuracy, mode, and any personal best.
   - CTAs for `Play Again`, `Change Topic`, `Back to Home`.

## Practice Mode Journey

- Identical to timed journey except:
  - No countdown timer; question counter may be shown instead.
  - Child has access to an `End practice` button.
  - Summary appears after ending, with similar metrics.

## Edge Cases

- **Pause / Backgrounding**
  - When app loses focus, timer pauses.
  - On return, a modal offers `Resume` or `Restart`.
- **Offline**
  - Core gameplay continues without interruption.
  - Sessions are stored locally for later sync.

## Related Documentation

- See `requirements2.md` §3.1 for formal requirements.
- See `Docs/user-flows.md` §6.1 and §6.3 for textual diagrams.

## Implementation Notes

- Maintain consistent transitions between screens using motion tokens.
- Ensure pause/resume logic does not confuse children or lose progress.
