---
title: Curriculum Alignment & Progress Tracking – Overview
description: Feature overview for curriculum-aligned progress tracking across countries.
feature: curriculum-alignment
last-updated: 2025-12-04
version: 1.0.0
related-files:
  - ../../design-system/overview.md
  - ../../design-system/components.md
  - ../../../Docs/Cirriculum
  - ../../../Docs/curriculum-alignment-implementation-plan.md
dependencies:
  - progress-dashboard-skill-radar
  - player-profiles-and-avatars
  - topic-and-skill-library
status: planned
---

# Curriculum Alignment & Progress Tracking – Overview

## Overview

This feature enables Math Dash to show parents and teachers how a child's math fluency compares to typical curriculum expectations for their age, country, and year/grade level. It transforms raw mastery data into contextual insights that answer the question: "Is my child on track?"

## Primary User Goals

- **Parents** can quickly see if their child is meeting grade-level expectations without being math experts themselves.
- **Teachers** can identify students who need additional support or enrichment relative to curriculum standards.
- **Children** benefit from practice recommendations that align with what they're learning in school.

## The Problem We're Solving

Parents often don't know:
1. What math facts their child should know at their age
2. Whether their child is ahead, behind, or on track
3. What to prioritize for practice

Different countries have different curricula (UK expects 12×12 by age 9, US focuses on 10×10 by age 9), making generic progress displays less meaningful.

## Our Solution

1. **Country and Year/Grade Selection** – Profile includes the child's country and school year
2. **Curriculum Skill Framework** – 22 standardized skills mapped to 5 countries' expectations
3. **Proficiency Calculation** – Aggregate mastery records to skill-level proficiency
4. **Status Display** – Clear "On Track", "Ahead", or "Needs Focus" messaging
5. **Detailed Breakdown** – Per-skill progress in the Grown-Ups area
6. **Coach Integration** – AI-powered insights reference curriculum context

## Supported Countries (Initial)

| Country | System | Levels Supported |
|---------|--------|------------------|
| New Zealand | Year 1-6 | Ages 5-11 |
| Australia | Year 1-6 | Ages 5-11 |
| United Kingdom | Year 1-6 | Ages 5-11 |
| United States | Grades K-5 | Ages 5-11 |
| Canada (Ontario) | Grades 1-5 | Ages 6-11 |

Architecture supports adding new countries with data changes only (no code changes).

## Success Criteria

- 60% of new profiles select a country during setup
- Parents viewing curriculum progress: 30% of Coach subscribers
- User satisfaction: <10% dispute "on track" status accuracy
- 20% increase in Coach recommendation follow-through

## Related Documentation

- `Docs/Cirriculum` – Full curriculum research and skill framework
- `Docs/curriculum-alignment-implementation-plan.md` – Technical implementation plan
- `Docs/curriculum-linear-issues.md` – Work breakdown for Linear
- `Docs/math-dash-prd-updated.md` Section 4, Feature 10 – PRD feature specification
