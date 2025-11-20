---
title: Progress Dashboard & Skill Radar – Accessibility
description: Accessibility considerations for progress charts and summaries.
feature: progress-dashboard-skill-radar
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

# Progress Dashboard & Skill Radar – Accessibility

## Visual Design

- Charts must use high-contrast colors and not rely on color alone.
- Provide clear legends and labels.

## Screen Readers

- Provide textual summaries for chart data (e.g., current proficiency band, trend direction).

## Input & Focus

- Ensure all interactive controls (filters, topic items) are reachable by keyboard.

## Implementation Notes

- Consider `aria-describedby` for linking chart visuals to textual summaries.
