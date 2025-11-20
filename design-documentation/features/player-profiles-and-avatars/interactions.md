---
title: Player Profiles & Avatars – Interactions
description: Interaction patterns for profile selection, creation, and grown-ups gate.
feature: player-profiles-and-avatars
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

# Player Profiles & Avatars – Interactions

## Selecting a Profile

- Tap or keyboard select a profile card to activate it.
- Subtle scale or highlight animation confirms selection.

## Adding a Profile

- `Add a player` button uses primary CTA styling.
- Progress indicator (steps) communicates where the user is in the flow.

## Grown-Ups Gate

- Triggered before entering profile edit or sensitive settings.
- Uses consistent adult-gate pattern across the app.

## Implementation Notes

- Remember to update app-wide current-profile context whenever switching.
