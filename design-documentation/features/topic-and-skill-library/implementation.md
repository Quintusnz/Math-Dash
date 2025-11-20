---
title: Topic & Skill Library – Implementation Notes
description: Developer-focused notes for implementing the Topic catalogue, selection, and per-topic metrics.
feature: topic-and-skill-library
last-updated: 2025-11-19
version: 0.1.0
related-files:
  - ../../../requirements2.md
  - ../../design-system/components.md
  - ../../design-system/tokens/colors.md
dependencies:
  - domain-model
  - monetization-and-access-control
status: draft
---

# Topic & Skill Library – Implementation Notes

## Data Model

- `Topic` and `SkillMetric` entities as defined in `requirements2.md` §2.
- Topics configured via data files with:
  - ID, name, category, age recommendation, isPremium, generation rules.

## Behavior

- Topic selection should update the profile’s last-selected topic.
- Locked topics must be enforced both in the UI and in game-start logic.

## Integration Points

- Core gameplay uses selected topic ID to generate questions.
- Progress Dashboard reads `SkillMetric` per topic for proficiency bands.
- Monetization logic uses `isPremium` flag for lock behavior.
