---
title: Accounts & Cloud Sync – Overview
description: Overview of account management, data persistence, and cloud synchronization.
feature: accounts-and-cloud-sync
last-updated: 2025-11-19
version: 0.1.0
related-files:
  - ./user-journey.md
  - ./screen-states.md
  - ./interactions.md
  - ./accessibility.md
  - ./implementation.md
  - ../../design-system/overview.md
  - ../../../requirements2.md
dependencies:
  - player-profiles-and-avatars
status: approved
---

# Accounts & Cloud Sync – Overview

## Overview

This feature covers the technical and UX aspects of persisting user data, managing parent accounts, and synchronizing progress across devices.

## Documentation Map

- **[User Journey](./user-journey.md)**: Flows for Sign-up, Class creation, and Data Recovery.
- **[Screen States](./screen-states.md)**: Visual specs for Login, Dashboard, and Conflict Resolution.
- **[Interactions](./interactions.md)**: Adult gating, Sync feedback, and Delete flows.
- **[Accessibility](./accessibility.md)**: Specific considerations for auth forms.
- **[Implementation](./implementation.md)**: Technical notes on Auth and Sync strategy.

## Primary User Goals

- Parents can restore their purchase and children's progress if they change devices.
- Data is saved reliably without requiring a login for basic usage (offline-first).

## Success Criteria

- Seamless offline-to-online sync.
- Easy account creation/login flow behind adult gate.
- Privacy-compliant data handling.

## Related Documentation

- `requirements2.md` §3.10 Accounts & Cloud Sync.
- `Docs/technical-architecture.md`.
