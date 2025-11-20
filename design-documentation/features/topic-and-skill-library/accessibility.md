---
title: Topic & Skill Library – Accessibility
description: Accessibility considerations for the Topics screen and topic tiles.
feature: topic-and-skill-library
last-updated: 2025-11-19
version: 0.1.0
related-files:
  - ../../accessibility/guidelines.md
  - screen-states.md
  - interactions.md
dependencies:
  - accessibility-guidelines
status: draft
---

# Topic & Skill Library – Accessibility

## Visual Design

- Ensure category headings and topic labels have sufficient contrast.
- Lock icon and styling for premium topics must not reduce text legibility.

## Focus & Navigation

- Make each topic tile a single, focusable element.
- Maintain predictable focus order across categories.

## Screen Reader Labels

- Include topic name, category, proficiency band, and lock state in accessible names.

## Cognitive Load

- Avoid showing too many categories expanded at once on small screens; consider collapsible sections if needed.

## Implementation Notes

- Reuse global accessibility patterns from the design system.
