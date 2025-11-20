---
title: Progress Dashboard & Skill Radar – Interactions
description: Interaction patterns for exploring progress, topics, and time ranges.
feature: progress-dashboard-skill-radar
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

# Progress Dashboard & Skill Radar – Interactions

## Child View

- Tapping a topic card reveals simple detail, with gentle animations.
- Swiping/scrolling reveals more topics if needed.

## Adult View

- Tapping a topic row opens detailed view.
- Time range filters update charts with smooth transitions.

## From Summary

- Tapping `See more progress` opens dashboard anchored on the relevant topic.

## Implementation Notes

- Ensure transitions are responsive and respect reduced-motion settings.
