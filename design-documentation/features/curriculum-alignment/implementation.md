---
title: Curriculum Alignment – Implementation Notes
description: Implementation details for curriculum progress tracking and display.
feature: curriculum-alignment
last-updated: 2025-12-04
version: 1.0.0
related-files:
  - ./README.md
  - ../../../Docs/curriculum-alignment-implementation-plan.md
  - ../../../src/lib/game-engine/mastery-tracker.ts
dependencies:
  - domain-model
  - topic-and-skill-library
  - progress-dashboard-skill-radar
status: planned
---

# Curriculum Alignment – Implementation Notes

## Data Model

### Profile Extensions

```typescript
interface Profile {
  // ... existing fields ...
  country?: 'NZ' | 'AU' | 'UK' | 'US' | 'CA';
  yearGrade?: string;  // e.g., "Y3", "G2", "K"
  curriculumLastUpdated?: string;  // ISO date for cache invalidation
}
```

### Curriculum Data Structure

Stored in `src/lib/constants/curriculum-data.ts`:

- **Skills**: 22 standardized skills with IDs, labels, descriptions
- **Countries**: 5 countries with year/grade benchmarks
- **Benchmarks**: Per-year coreSkills and extensionSkills arrays

### Skill-to-Game Mapping

Stored in `src/lib/constants/skill-game-mapping.ts`:

Maps curriculum skill IDs to:
- TopicType(s) they correspond to
- Operations covered
- Number ranges (for add/sub skills)
- Selected numbers (for times table skills)
- Expected fact count (for coverage calculation)

## Core Classes

### CurriculumTracker

Location: `src/lib/game-engine/curriculum-tracker.ts`

Key methods:
- `getSkillProgress(profileId, skillId)` – Calculate proficiency for one skill
- `getCurriculumProgress(profileId)` – Full curriculum status for a profile
- `getRecommendedFocus(profileId)` – Priority practice recommendations
- `filterRecordsForSkill(records, skillId)` – Match mastery records to skills

### Proficiency Calculation

Aggregate mastery records to skill level:

```
coverage = practicedFacts / expectedFacts
accuracy = totalCorrect / totalAttempts

if coverage < 0.3: NOT_STARTED
if accuracy < 70% OR coverage < 0.6: DEVELOPING  
if accuracy >= 85% AND avgTime < 3s AND coverage >= 0.8: MASTERED
else: PROFICIENT
```

### Overall Status

```
corePercent = coreMastered / coreTotal

if corePercent < 0.5: BEHIND
if corePercent >= 0.8 AND extensionMastered > 0: AHEAD
else: ON_TRACK
```

## Caching Strategy

- Cache curriculum progress in memory
- Invalidate on session completion
- TTL: 5 minutes
- Use `curriculumLastUpdated` field as cache key
- Consider incremental updates for performance

## File Structure

```
src/lib/
├── constants/
│   ├── curriculum-data.ts       # Skills and country benchmarks
│   ├── skill-game-mapping.ts    # Skill → game mode mapping
│   └── country-config.ts        # Country metadata and age mappings
├── game-engine/
│   └── curriculum-tracker.ts    # Progress calculation engine

src/components/features/curriculum/
├── CountrySelector.tsx
├── YearGradeSelector.tsx
├── CurriculumProgressCard.tsx
├── SkillProgressGrid.tsx
├── CurriculumStatusBadge.tsx
└── *.module.css

src/app/(app)/grown-ups/curriculum/
└── page.tsx                     # Detailed curriculum view
```

## Integration Points

1. **Profile Creation** – Add country/year selection step
2. **Settings Page** – Allow changing country/year
3. **Dashboard** – Show CurriculumProgressCard
4. **Grown-Ups Area** – Detailed curriculum progress page
5. **Coach AI** – Include curriculum context in prompts
6. **Topic Suggestions** – Prioritize curriculum-required skills

## Performance Considerations

- Lazy load detailed calculations only when user views Grown-Ups area
- Dashboard shows cached summary only
- Large mastery datasets (1000+ records) should calculate in <200ms
- Consider Web Worker for heavy aggregation if needed
