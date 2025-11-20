---
title: Core Dash Round Gameplay – Accessibility
description: Accessibility considerations specific to the core gameplay loop, including input, feedback, and cognitive load.
feature: core-dash-round-gameplay
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

# Core Dash Round Gameplay – Accessibility

## Visual Clarity

- Ensure question text is large and high contrast against the background.
- Answer buttons must have clear labels, not rely on color alone.

## Feedback

- Use both color and icons/text to indicate correct/incorrect answers.
- Avoid rapid flashing; transitions should be smooth.

## Input & Focus

- Answer buttons and key controls must be reachable via keyboard and assistive technologies.
- Maintain logical focus order: question → answers → controls.

## Cognitive Load

- Show only one question at a time.
- Keep on-screen text short and easy to read.

## Motion

- Respect `prefers-reduced-motion`; reduce or disable non-essential animations.

## Implementation Notes

- Cross-check with global accessibility guidelines to ensure consistency.
