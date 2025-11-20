---
title: Progress Dashboard & Skill Radar – Implementation Notes
description: Implementation details for aggregating and displaying per-topic progress.
feature: progress-dashboard-skill-radar
last-updated: 2025-11-19
version: 0.1.0
related-files:
  - ../../../requirements2.md
  - ../../design-system/components.md
  - ../../design-system/tokens/colors.md
dependencies:
  - domain-model
  - topic-and-skill-library
status: draft
---

# Progress Dashboard & Skill Radar – Implementation Notes

## Data Model

- Uses `SkillMetric`, `GameSession`, and `QuestionAttempt` aggregates from `requirements2.md` §2.

## Aggregation

- Precompute or lazily compute per-topic accuracy and speed.
- Store derived proficiency band for fast retrieval.

## Integration

- Child view and adult view read from the same underlying aggregates with different presentation.
- Dashboard links from summary screens should include context (topic ID, time window).
