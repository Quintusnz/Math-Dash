---
title: Player Profiles & Avatars – Implementation Notes
description: Implementation details for multi-profile support, avatars, and adult-gated editing.
feature: player-profiles-and-avatars
last-updated: 2025-11-19
version: 0.1.0
related-files:
  - ../../../requirements2.md
  - ../../design-system/components.md
  - ../../design-system/tokens/colors.md
dependencies:
  - domain-model
  - accounts-and-cloud-sync
status: draft
---

# Player Profiles & Avatars – Implementation Notes

## Data Model

- `PlayerProfile` as defined in `requirements2.md` §2, including:
  - ID, name, age range, avatar ID, settings.

## Behavior

- Current profile stored in local state and persisted.
- Editing a profile requires adult gate success.

## Integration

- Core gameplay, topics, progress, and achievements all reference current profile ID.
- Sync layer maps profiles to any logged-in account when accounts are added.
