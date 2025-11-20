---
title: Monetization & Access Control – Interactions
description: Interaction patterns for locks, adult gate, and upgrade flow.
feature: monetization-and-access-control
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

# Monetization & Access Control – Interactions

## Locks

- Tapping locked content from child mode never shows price.
- Always routes to a soft grown-up prompt.

## Adult Gate & Upgrade

- Adult gate uses consistent pattern.
- Upgrade CTAs are clearly labeled and never dark-patterned.

## Implementation Notes

- All entitlements and locks must be enforced on the server or validated securely where applicable.
