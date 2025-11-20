---
title: Adaptive Practice Mode – Interactions
description: Interaction details for beginning, running, and ending adaptive practice.
feature: adaptive-practice-mode
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

# Adaptive Practice Mode – Interactions

## Starting & Ending

- `Practice` mode selection uses normal mode-selection interactions.
- `End practice` must be clearly labeled and confirm end if tapped accidentally.

## Adaptive Behavior (Invisible to Child)

- UI does not surface difficulty numbers.
- Only subtle changes in question content reflect adaptation.

## Implementation Notes

- All adaptation logic should be parameterized and testable.
