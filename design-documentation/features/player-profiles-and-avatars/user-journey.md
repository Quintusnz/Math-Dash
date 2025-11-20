---
title: Player Profiles & Avatars – User Journey
description: User journeys for creating, selecting, and managing child profiles.
feature: player-profiles-and-avatars
last-updated: 2025-11-19
version: 0.1.0
related-files:
  - README.md
  - ../../design-system/components.md
  - ../../../Docs/user-flows.md
dependencies:
  - accounts-and-cloud-sync
status: draft
---

# Player Profiles & Avatars – User Journey

## First-Time Setup (Parent)

1. Launch app → Welcome screen.
2. Parent chooses `Add a player`.
3. Enters child name and age range.
4. Child chooses an avatar from a small grid.
5. Optional: parent sets a simple grown-ups PIN.
6. Lands on Play Home for that child.

## Switching Between Children (Parent or Child)

1. Tap profile name/avatar on Play Home.
2. Profile picker appears with list of children.
3. Tap another profile to switch; Play Home reloads with that child’s context.

## Editing a Profile (Adult Gate)

1. From profile picker or grown-ups area, tap `Edit` on a profile.
2. Adult gate (e.g., simple math question or PIN) must succeed.
3. Parent can change name, avatar, or archive profile.

## Related Documentation

- `requirements2.md` §3.4 Player Profiles & Avatars.
- `Docs/user-flows.md` §1. Onboarding & switching.
