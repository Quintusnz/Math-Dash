---
title: Topic & Skill Library – Overview
description: Feature overview for the configurable topic catalogue and per-topic skill metrics.
feature: topic-and-skill-library
last-updated: 2025-11-19
version: 0.1.0
related-files:
  - ../../design-system/overview.md
  - ../../design-system/components.md
  - ../../../Docs/information-architecture.md
  - ../../../requirements2.md
dependencies:
  - core-dash-round-gameplay
  - player-profiles-and-avatars
status: draft
---

# Topic & Skill Library – Overview

## Overview

The Topic & Skill Library defines the set of math topics (tables, division facts, number bonds, doubles/halves) and how they are surfaced in the UI. It also underpins per-topic proficiency metrics used in the Progress Dashboard.

## Primary User Goals

- Children can easily see and choose age-appropriate topics to practise.
- Parents/teachers can quickly identify and target specific topics (e.g., 7× table, bonds to 10).
- Topics are clearly marked as free or premium without confusing children.

## Success Criteria

- Topics grouped into clear categories with recognizable labels and icons.
- Free vs premium topics consistently indicated via locks and styling.
- Age-appropriate defaults automatically suggested on profile creation.
- Topic selection persists per profile between sessions.

## Related Documentation

- `requirements2.md` §3.2 Feature 2 – Topic & Skill Library.
- `Docs/user-flows.md` (topic change path).
- `design-documentation/design-system/components.md` (Topics screen, topic tiles).

## Implementation Notes

- Topics should be data-driven (config/JSON) rather than hard-coded.
- Proficiency metrics per topic (`SkillMetric`) must remain performant as history grows.
