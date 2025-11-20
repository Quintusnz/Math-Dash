---
title: Topic & Skill Library – Interactions
description: Interaction details for browsing and selecting topics, and encountering premium locks.
feature: topic-and-skill-library
last-updated: 2025-11-19
version: 0.1.0
related-files:
  - screen-states.md
  - ../../design-system/components.md
  - ../../../Docs/monetization-and-pricing.md
dependencies:
  - monetization-and-access-control
status: draft
---

# Topic & Skill Library – Interactions

## Scrolling & Navigation

- Vertical scrolling through categories with sticky category headers on larger viewports.
- Tapping the back button returns to Play Home or previous context.

## Topic Selection

- Tapping an unlocked topic tile:
  - Updates the last-selected topic for that profile.
  - Returns user to pre-game configuration or Play, depending on entry point.

## Premium Lock Interactions

- Tapping a locked topic:
  - Opens upgrade teaser modal.
  - Modal explains benefits and directs to adult-gated upgrade flow.

## Keyboard & Screen Reader

- Topic tiles focusable in reading order.
- Each tile’s accessible label should include:
  - Topic name.
  - Category.
  - Proficiency if available (e.g., “7× table, Developing”).
  - Lock status if premium.

## Implementation Notes

- Use consistent event logging for topic selection and locked-topic taps for analytics.
