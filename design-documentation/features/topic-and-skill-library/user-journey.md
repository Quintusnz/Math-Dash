---
title: Topic & Skill Library – User Journey
description: User journeys for browsing, selecting, and understanding topics across child and adult views.
feature: topic-and-skill-library
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

# Topic & Skill Library – User Journey

## Overview

This document describes how children, parents, and teachers interact with the Topics screen and topic selection.

## Child Journey

1. **From Play Home**
   - Child taps `Change Topic/Mode`.
2. **Topics Screen**
   - Sees categories (Multiplication, Division, Number Bonds, Doubles/Halves).
   - Scrolls vertically; within each category sees topic tiles.
3. **Selecting a Topic**
   - Taps an unlocked tile.
   - Returns to pre-game configuration or directly to Play with new topic.

## Parent Journey (Grown-Ups Area)

1. **Grown-Ups Home**
   - Selects a child profile.
2. **Topics with Proficiency**
   - Sees topic tiles augmented with proficiency bands and recent trends.
   - May tap a topic to see details (ties into Progress Dashboard feature).

## Premium Encounter

- Locked topics show a lock icon and muted styling.
- Tapping them triggers the upgrade teaser modal with adult gate handled nearby in the flow.

## Age-Based Defaults

- On new profile creation, the system pre-selects a sensible default subset (e.g., bonds to 10 for younger children).

## Related Documentation

- `requirements2.md` §3.2 Topic & Skill Library.
- `Docs/user-flows.md` §2.4 Topic change path.
