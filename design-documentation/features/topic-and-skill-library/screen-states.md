---
title: Topic & Skill Library – Screen States
description: Screen states for the Topics list/grid and topic tiles, including free, premium, and empty states.
feature: topic-and-skill-library
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

# Topic & Skill Library – Screen States

## Topics Screen

### Default

- Category headings (e.g., “Multiplication”, “Division”).
- Within each category, a grid/list of topic tiles.

### With History

- Topic tiles show a small proficiency chip (e.g., Weak/Developing/Secure/Advanced).
- Optional small indicator of last played.

### Free vs Premium

- Free topics: standard tile styling.
- Premium topics: neutral overlay, lock icon, slightly desaturated colors while keeping text legible.

### Empty / No Topics

- Rare; if configuration fails, show an empty state with message and retry option.

## Topic Tile States

- As defined in the design system component state matrix:
  - Default, Hover/Pressed, Premium Locked, Selected.

## Related Documentation

- `design-documentation/design-system/components.md` (Topics screen and topic tiles).
