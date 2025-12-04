# Math Dash – Curriculum Alignment Feature: Analysis & Implementation Plan

**Version:** 1.0  
**Date:** December 2025  
**Status:** Planning Phase  
**Author:** Product & Engineering

---

## Executive Summary

This document provides a comprehensive analysis and implementation plan for adding **curriculum-aligned progress tracking** to Math Dash. The feature will enable parents and teachers to see how a child's math fluency compares to local curriculum expectations for their age and country.

### Key Objectives

1. **Show progress against curriculum benchmarks** – Display "on track", "ahead", or "needs focus" status relative to local expectations
2. **Support multi-country expansion** – Initially NZ, AU, UK, US, CA with architecture to add more
3. **Power adaptive recommendations** – Use curriculum data to suggest appropriate practice
4. **Enhance Coach AI insights** – Give parents contextual information about what's expected at each level
5. **Identify and close content gaps** – Ensure our game modes cover all curriculum-required skills

---

## Part 1: Current State Analysis

### 1.1 What We Have

#### Database & Data Model
| Component | Status | Notes |
|-----------|--------|-------|
| `Profile` entity | ✅ Has `ageBand` field | Currently stores age range like "6-7", "8-9" |
| `MasteryRecord` entity | ✅ Complete | Tracks per-fact mastery (attempts, correct, avgTime, status, weight) |
| `GameSession` entity | ✅ Complete | Links sessions to topics and profiles |
| `QuestionAttempt` entity | ✅ Complete | Detailed question-level tracking |
| Country/curriculum data | ❌ Missing | No country field on profile, no curriculum JSON |

#### Game Engine Components
| Component | Status | Coverage |
|-----------|--------|----------|
| Question Generator | ✅ Implemented | Add, Sub, Mult, Div, Number Bonds (10/20/50/100), Doubles, Halves, Squares |
| Mastery Tracker | ✅ Implemented | Per-fact tracking with status (new/learning/mastered) |
| Topic Suggestions | ✅ Implemented | Rule-based suggestions (weak facts, progression, stale topics) |
| Skill Radar | ✅ Implemented | Visual display of operation proficiency |
| Daily Dash | ✅ Implemented | Guided daily practice sessions |

#### Skills Supported in Game
| Skill ID (from Curriculum Doc) | Game Mode Available | Status |
|-------------------------------|---------------------|--------|
| NB10 (Number bonds to 10) | `number-bonds-10` | ✅ Full |
| NB20 (Number bonds to 20) | `number-bonds-20` | ✅ Full |
| NB100 (Number bonds to 100) | `number-bonds-100` | ✅ Full |
| NB_DEC1 (Decimal bonds to 1) | — | ❌ **GAP** |
| ADD_SUB_20 | `addition`/`subtraction` with range | ✅ Full |
| ADD_SUB_100 | `addition`/`subtraction` with range | ✅ Full |
| ADD_SUB_1000 | `addition`/`subtraction` with range | ✅ Full (range presets cover this) |
| TT_2_5_10 | `multiplication` with selected numbers | ✅ Full |
| TT_CORE | `multiplication` with selected numbers | ✅ Full |
| TT_1_10_ALL | `multiplication` full 1-10 | ✅ Full |
| TT_1_12_ALL | `multiplication` full 1-12 | ✅ Full |
| DIV_2_5_10 | `division` with selected numbers | ✅ Full |
| DIV_CORE | `division` with selected numbers | ✅ Full |
| DIV_1_10_ALL | `division` full 1-10 | ✅ Full |
| DIV_1_12_ALL | `division` full 1-12 | ✅ Full |
| DBL_10 (Doubles to 10) | `doubles` | ⚠️ Partial (covers 1-20) |
| DBL_20 (Doubles to 20) | `doubles` | ✅ Full |
| DBL_100 (Doubles 2-digit) | — | ❌ **GAP** |
| DBL_3DIG (Doubles 3-digit) | — | ❌ **GAP** |
| DBL_DEC (Doubles decimal) | — | ❌ **GAP** |
| SQ_1_10 (Squares 1-10) | `squares` | ✅ Full |
| SQ_1_12 (Squares 1-12) | `squares` | ✅ Full |

#### UI Components
| Component | Status | Notes |
|-----------|--------|-------|
| Dashboard page | ✅ Exists | Shows Skill Radar, streak, weekly goal, Daily Dash |
| Skill Radar chart | ✅ Exists | Recharts-based radar showing operation proficiency |
| Progress Dashboard | ⚠️ Basic | Doesn't compare to curriculum expectations |
| Country selector | ❌ Missing | Need to add to profile creation/settings |
| Benchmark comparison UI | ❌ Missing | "On track" / "Ahead" / "Needs focus" display |

---

### 1.2 Gap Analysis Summary

#### Content Gaps (Game Modes Missing)

| Priority | Skill | Description | Effort |
|----------|-------|-------------|--------|
| **High** | NB_DEC1 | Decimal number bonds to 1.0 (e.g., 0.3 + 0.7) | Medium |
| **Medium** | DBL_100 | Doubles of 2-digit numbers (e.g., double 45) | Medium |
| **Medium** | DBL_3DIG | Doubles of 3-digit numbers | Low |
| **Low** | DBL_DEC | Doubles of decimal numbers | Medium |
| **Medium** | NB50 | Number bonds to 50 | ✅ Already exists |

**Note:** Number bonds to 50 (`number-bonds-50`) is already implemented but not in the curriculum document. This is fine as an extension topic.

#### Data Model Gaps

| Gap | Impact | Solution |
|-----|--------|----------|
| No country on Profile | Can't determine local expectations | Add `country` field to Profile |
| No curriculum JSON in app | Can't compare to benchmarks | Create `curriculumData.json` in `/src/lib/constants/` |
| Skill-to-game-mode mapping | Need to link curriculum skill IDs to actual game modes | Create mapping configuration |
| Per-skill proficiency calculation | Need to aggregate mastery to skill level | Extend MasteryTracker |

#### UX Gaps

| Gap | Impact | Solution |
|-----|--------|----------|
| Country selection UX | Users can't set their country | Add to profile creation flow + settings |
| Curriculum status display | Parents can't see progress vs expectations | New "Curriculum Progress" view |
| "On track" messaging | No contextual progress feedback | Add status badges to dashboard |

---

## Part 2: System Design

### 2.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         UI Layer                                    │
├─────────────────────────────────────────────────────────────────────┤
│  Dashboard           │  Grown-Ups Area      │  Profile Settings    │
│  - Curriculum badge  │  - Full curriculum   │  - Country selector  │
│  - Quick status      │    progress view     │  - Year/Grade        │
│                      │  - Coach insights    │                       │
└──────────┬───────────┴──────────┬───────────┴──────────┬────────────┘
           │                      │                       │
┌──────────▼───────────────────────────────────────────────────────────┐
│                     Curriculum Progress Engine                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│  │ CurriculumData  │  │ ProgressCalc    │  │ BenchmarkComparison │  │
│  │ (JSON config)   │  │ (aggregate      │  │ (on-track logic)    │  │
│  │                 │  │  mastery→skill) │  │                     │  │
│  └────────┬────────┘  └────────┬────────┘  └─────────┬───────────┘  │
└───────────┼────────────────────┼─────────────────────┼───────────────┘
            │                    │                     │
┌───────────▼────────────────────▼─────────────────────▼───────────────┐
│                        Data Layer (Dexie/IndexedDB)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  Profile    │  │ MasteryRec  │  │ GameSession │  │ Curriculum  │ │
│  │ +country    │  │ (per-fact)  │  │             │  │ Cache       │ │
│  │ +yearGrade  │  │             │  │             │  │ (optional)  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Structures

#### 2.2.1 Profile Extension

```typescript
// Additions to Profile interface in src/lib/db/index.ts
export interface Profile {
  // ... existing fields ...
  
  // NEW: Curriculum alignment
  country?: 'NZ' | 'AU' | 'UK' | 'US' | 'CA';  // Optional, defaults to NZ
  yearGrade?: string;  // e.g., "Y3", "G2", "K" - derived from ageBand + country
  curriculumLastUpdated?: string;  // ISO date when curriculum progress was last calculated
}
```

#### 2.2.2 Curriculum Data Structure (JSON Config)

```typescript
// src/lib/constants/curriculum-data.ts
export interface Skill {
  id: string;              // e.g., "NB10", "TT_1_10_ALL"
  label: string;
  domain: string;
  subdomain: string;
  description: string;
  numberRange: string;
  gameModes: string[];     // Maps to TopicType or special config
}

export interface YearBenchmark {
  label: string;           // e.g., "Year 3"
  ageRange: string;        // e.g., "7-8"
  coreSkills: string[];    // Skill IDs expected by end of year
  extensionSkills: string[]; // Stretch goals
}

export interface CountryConfig {
  label: string;
  systemType: 'year' | 'grade';
  years: Record<string, YearBenchmark>;
}

export interface CurriculumData {
  version: number;
  skills: Skill[];
  countries: Record<string, CountryConfig>;
}
```

#### 2.2.3 Skill Progress Calculation

```typescript
// src/lib/game-engine/curriculum-tracker.ts
export interface SkillProgress {
  skillId: string;
  proficiency: 'not-started' | 'developing' | 'proficient' | 'mastered';
  accuracy: number;        // 0-100
  avgResponseTime: number; // ms
  totalAttempts: number;
  lastPracticed?: string;  // ISO date
}

export interface CurriculumProgress {
  profileId: string;
  country: string;
  yearGrade: string;
  
  // Overall status
  overallStatus: 'behind' | 'on-track' | 'ahead';
  
  // Per-skill breakdown
  coreSkillProgress: SkillProgress[];
  extensionSkillProgress: SkillProgress[];
  
  // Counts
  coreMastered: number;
  coreTotal: number;
  extensionMastered: number;
  extensionTotal: number;
  
  // Recommendations
  focusAreas: string[];    // Skill IDs needing attention
  readyToAdvance: string[]; // Skills ready for extension/next level
}
```

### 2.3 Key Algorithms

#### 2.3.1 Mapping Mastery Records to Skills

The challenge: Our `MasteryRecord` tracks individual facts (e.g., "7×8") but the curriculum tracks skills (e.g., "TT_1_10_ALL"). We need to aggregate.

```typescript
// Pseudocode for skill proficiency calculation
function calculateSkillProficiency(
  skillId: string, 
  masteryRecords: MasteryRecord[]
): SkillProgress {
  // 1. Get the skill definition
  const skill = curriculumData.skills.find(s => s.id === skillId);
  
  // 2. Filter mastery records that belong to this skill
  // This requires mapping skill → operations and number ranges
  const relevantRecords = filterRecordsForSkill(masteryRecords, skill);
  
  // 3. Calculate aggregate metrics
  const totalAttempts = sum(relevantRecords.map(r => r.attempts));
  const totalCorrect = sum(relevantRecords.map(r => r.correct));
  const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
  
  // 4. Calculate coverage (how many facts in the skill have been practiced?)
  const expectedFactCount = getExpectedFactCount(skill);
  const practicedFactCount = relevantRecords.length;
  const coverage = practicedFactCount / expectedFactCount;
  
  // 5. Determine proficiency level
  const proficiency = determineProficiency(accuracy, coverage, avgTime);
  
  return { skillId, proficiency, accuracy, ... };
}

function determineProficiency(accuracy: number, coverage: number, avgTime: number): string {
  if (coverage < 0.3) return 'not-started';
  if (accuracy < 70 || coverage < 0.6) return 'developing';
  if (accuracy >= 85 && avgTime < 3000 && coverage >= 0.8) return 'mastered';
  return 'proficient';
}
```

#### 2.3.2 Overall Curriculum Status

```typescript
function calculateOverallStatus(
  coreMastered: number,
  coreTotal: number,
  extensionMastered: number
): 'behind' | 'on-track' | 'ahead' {
  const corePercent = coreTotal > 0 ? coreMastered / coreTotal : 0;
  
  if (corePercent < 0.5) return 'behind';
  if (corePercent >= 0.8 && extensionMastered > 0) return 'ahead';
  return 'on-track';
}
```

### 2.4 Skill-to-Game-Mode Mapping

This is the critical configuration that links curriculum skills to our game implementation:

```typescript
// src/lib/constants/skill-game-mapping.ts
export const SKILL_GAME_MAPPING: Record<string, SkillGameConfig> = {
  // Number Bonds
  'NB10': {
    topics: ['number-bonds-10'],
    operations: ['addition', 'subtraction'],
    numberRange: { min: 0, max: 10, rangeType: 'answer' },
    expectedFactCount: 11, // 0+10, 1+9, 2+8, ..., 10+0
  },
  'NB20': {
    topics: ['number-bonds-20'],
    operations: ['addition', 'subtraction'],
    numberRange: { min: 0, max: 20, rangeType: 'answer' },
    expectedFactCount: 21,
  },
  'NB100': {
    topics: ['number-bonds-100'],
    operations: ['addition', 'subtraction'],
    numberRange: { min: 0, max: 100, rangeType: 'answer' },
    expectedFactCount: 19, // Multiples of 5
  },
  'NB_DEC1': {
    topics: ['number-bonds-decimal-1'], // NEW - needs implementation
    operations: ['addition'],
    numberRange: { min: 0, max: 1, rangeType: 'answer', decimals: true },
    expectedFactCount: 10,
  },
  
  // Addition/Subtraction fluency
  'ADD_SUB_20': {
    operations: ['addition', 'subtraction'],
    numberRange: { min: 0, max: 20, rangeType: 'operand' },
    expectedFactCount: 400, // Approximate
  },
  'ADD_SUB_100': {
    operations: ['addition', 'subtraction'],
    numberRange: { min: 0, max: 100, rangeType: 'operand' },
    expectedFactCount: 1000, // We'll use sampling
  },
  
  // Times Tables
  'TT_2_5_10': {
    operations: ['multiplication'],
    selectedNumbers: [2, 5, 10],
    expectedFactCount: 36, // 3 tables × 12 facts
  },
  'TT_CORE': {
    operations: ['multiplication'],
    selectedNumbers: [2, 3, 4, 5, 8, 10],
    expectedFactCount: 72,
  },
  'TT_1_10_ALL': {
    operations: ['multiplication'],
    selectedNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    expectedFactCount: 100, // 10×10 grid
  },
  'TT_1_12_ALL': {
    operations: ['multiplication'],
    selectedNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    expectedFactCount: 144,
  },
  
  // Division
  'DIV_2_5_10': {
    operations: ['division'],
    selectedNumbers: [2, 5, 10],
    expectedFactCount: 36,
  },
  // ... similar for other division skills
  
  // Doubles & Halves
  'DBL_10': {
    topics: ['doubles'],
    operations: ['addition'],
    numberRange: { min: 1, max: 10 },
    expectedFactCount: 10,
  },
  'DBL_20': {
    topics: ['doubles'],
    operations: ['addition'],
    numberRange: { min: 1, max: 20 },
    expectedFactCount: 20,
  },
  'DBL_100': {
    topics: ['doubles-2digit'], // NEW - needs implementation
    operations: ['addition'],
    numberRange: { min: 10, max: 99 },
    expectedFactCount: 30, // Selected 2-digit numbers
  },
  
  // Squares
  'SQ_1_10': {
    topics: ['squares'],
    operations: ['multiplication'],
    selectedNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    expectedFactCount: 10,
  },
  'SQ_1_12': {
    topics: ['squares'],
    operations: ['multiplication'],
    selectedNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    expectedFactCount: 12,
  },
};
```

---

## Part 3: Implementation Plan

### 3.1 Epic Breakdown

#### Epic 1: Data Foundation (Week 1-2)
Create the curriculum data structures and extend the database.

#### Epic 2: Curriculum Progress Engine (Week 2-3)
Build the calculation logic for mapping mastery to skill proficiency.

#### Epic 3: Content Gap Closure (Week 2-3, parallel)
Implement missing game modes (decimal bonds, 2-digit doubles).

#### Epic 4: UI - Country Selection (Week 3-4)
Add country/year selection to profile creation and settings.

#### Epic 5: UI - Curriculum Dashboard (Week 4-5)
Create the curriculum progress view for parents/teachers.

#### Epic 6: Coach AI Integration (Week 5-6)
Enhance Math Dash Coach with curriculum-aligned insights.

#### Epic 7: Testing & Documentation (Ongoing)
Comprehensive testing and documentation updates.

---

### 3.2 Detailed Work Breakdown

#### Epic 1: Data Foundation

| Task | Description | Est. Hours | Priority |
|------|-------------|------------|----------|
| 1.1 | Create `curriculum-data.ts` with full skill definitions | 4h | P0 |
| 1.2 | Create `skill-game-mapping.ts` configuration | 3h | P0 |
| 1.3 | Add `country` and `yearGrade` fields to Profile interface | 1h | P0 |
| 1.4 | Add database migration (version 9) for new Profile fields | 2h | P0 |
| 1.5 | Create `COUNTRY_CONFIG` constant with age→year mappings | 2h | P0 |
| 1.6 | Write unit tests for curriculum data validation | 2h | P1 |

#### Epic 2: Curriculum Progress Engine

| Task | Description | Est. Hours | Priority |
|------|-------------|------------|----------|
| 2.1 | Create `CurriculumTracker` class skeleton | 2h | P0 |
| 2.2 | Implement `getSkillProgress()` - aggregate mastery→skill | 6h | P0 |
| 2.3 | Implement `filterRecordsForSkill()` - match facts to skills | 4h | P0 |
| 2.4 | Implement `getCurriculumProgress()` - full status calc | 4h | P0 |
| 2.5 | Implement `getRecommendedFocus()` - priority suggestions | 3h | P1 |
| 2.6 | Add caching layer for expensive calculations | 3h | P1 |
| 2.7 | Write unit tests for CurriculumTracker | 4h | P0 |
| 2.8 | Integration tests with sample data | 3h | P1 |

#### Epic 3: Content Gap Closure

| Task | Description | Est. Hours | Priority |
|------|-------------|------------|----------|
| 3.1 | Add `number-bonds-decimal-1` topic type | 1h | P1 |
| 3.2 | Implement decimal bonds question generator | 4h | P1 |
| 3.3 | Add `doubles-2digit` topic type | 1h | P1 |
| 3.4 | Implement 2-digit doubles question generator | 3h | P1 |
| 3.5 | Add `doubles-3digit` topic type and generator | 2h | P2 |
| 3.6 | Add `doubles-decimal` topic type and generator | 3h | P2 |
| 3.7 | Update SPECIAL_TOPICS array with new topics | 1h | P1 |
| 3.8 | Add tests for new question generators | 3h | P1 |
| 3.9 | Update topic selection UI for new topics | 2h | P1 |

#### Epic 4: UI - Country Selection

| Task | Description | Est. Hours | Priority |
|------|-------------|------------|----------|
| 4.1 | Create `CountrySelector` component | 3h | P0 |
| 4.2 | Create `YearGradeSelector` component (dynamic per country) | 4h | P0 |
| 4.3 | Add country/year to profile creation flow | 3h | P0 |
| 4.4 | Add country/year to Settings page | 2h | P0 |
| 4.5 | Auto-derive year from age band (with override) | 2h | P1 |
| 4.6 | Style components with CSS modules | 2h | P0 |
| 4.7 | Add accessibility attributes and keyboard nav | 2h | P0 |

#### Epic 5: UI - Curriculum Dashboard

| Task | Description | Est. Hours | Priority |
|------|-------------|------------|----------|
| 5.1 | Design curriculum progress view wireframes | 2h | P0 |
| 5.2 | Create `CurriculumProgressCard` component | 4h | P0 |
| 5.3 | Create `SkillProgressGrid` component | 6h | P0 |
| 5.4 | Create `CurriculumStatusBadge` component | 2h | P0 |
| 5.5 | Add curriculum summary to main dashboard | 3h | P0 |
| 5.6 | Create detailed curriculum view in Grown-Ups area | 6h | P0 |
| 5.7 | Add skill drill-down modal (show facts within skill) | 4h | P1 |
| 5.8 | Add "practice this skill" action button | 2h | P1 |
| 5.9 | Style all components with CSS modules | 4h | P0 |
| 5.10 | Add animations with Motion (Framer Motion) | 2h | P2 |

#### Epic 6: Coach AI Integration

| Task | Description | Est. Hours | Priority |
|------|-------------|------------|----------|
| 6.1 | Update Coach prompt templates with curriculum context | 3h | P1 |
| 6.2 | Add curriculum benchmarks to AI input data | 2h | P1 |
| 6.3 | Generate curriculum-aligned practice recommendations | 4h | P1 |
| 6.4 | Add "grade level expectation" messaging | 2h | P1 |
| 6.5 | Create curriculum progress summary for Coach reports | 3h | P1 |

#### Epic 7: Testing & Documentation

| Task | Description | Est. Hours | Priority |
|------|-------------|------------|----------|
| 7.1 | Update PRD with curriculum alignment feature | 3h | P0 |
| 7.2 | Update design documentation | 2h | P0 |
| 7.3 | E2E tests for country selection flow | 3h | P1 |
| 7.4 | E2E tests for curriculum progress view | 3h | P1 |
| 7.5 | Performance testing with large mastery datasets | 2h | P1 |
| 7.6 | Accessibility audit for new components | 2h | P0 |
| 7.7 | Create user-facing help content | 2h | P2 |

---

### 3.3 Timeline

```
Week 1:  Epic 1 (Data Foundation)
Week 2:  Epic 2 (Progress Engine) + Epic 3 (Content Gaps, parallel)
Week 3:  Epic 2 (complete) + Epic 3 (complete) + Epic 4 (Country UI start)
Week 4:  Epic 4 (complete) + Epic 5 (Dashboard start)
Week 5:  Epic 5 (complete) + Epic 6 (Coach Integration)
Week 6:  Epic 6 (complete) + Epic 7 (Testing & Docs)
```

**Total estimated hours:** ~150-170 hours

---

## Part 4: Technical Recommendations

### 4.1 File Structure

```
src/lib/
├── constants/
│   ├── curriculum-data.ts       # NEW: Skills and country benchmarks
│   ├── skill-game-mapping.ts    # NEW: Skill → game mode mapping
│   └── country-config.ts        # NEW: Country/year/age mappings
├── game-engine/
│   ├── curriculum-tracker.ts    # NEW: Progress calculation engine
│   ├── question-generator.ts    # UPDATE: Add decimal bonds, 2-digit doubles
│   └── mastery-tracker.ts       # Minor updates for skill aggregation
├── db/
│   └── index.ts                 # UPDATE: Add country/yearGrade to Profile

src/components/features/
├── curriculum/                  # NEW folder
│   ├── CountrySelector.tsx
│   ├── YearGradeSelector.tsx
│   ├── CurriculumProgressCard.tsx
│   ├── SkillProgressGrid.tsx
│   ├── CurriculumStatusBadge.tsx
│   └── *.module.css

src/app/(app)/
├── grown-ups/
│   └── curriculum/              # NEW: Detailed curriculum view
│       └── page.tsx
```

### 4.2 Performance Considerations

1. **Caching:** Cache curriculum progress calculations for 5 minutes or until new session completes
2. **Lazy loading:** Only calculate detailed skill breakdown when user views Grown-Ups area
3. **Incremental updates:** Update skill progress after each session, not full recalculation
4. **Background calculation:** Consider Web Worker for heavy aggregation on large datasets

### 4.3 Extensibility for New Countries

Adding a new country requires:
1. Add entry to `countries` object in `curriculum-data.ts`
2. Add age-to-year mapping in `country-config.ts`
3. UI automatically supports new country (dropdown populated from config)

No code changes needed for new countries – purely data-driven.

---

## Part 5: PRD Updates Required

The following sections of `math-dash-prd-updated.md` should be updated:

### Section 4: Feature Specifications

Add new feature:

```markdown
### Feature 10: Curriculum Alignment & Progress Tracking (P1)

**User Story:**
As a parent or teacher, I want to see how my child's math fluency compares to typical expectations for their age and country, so I can understand if they are on track.

**Acceptance Criteria:**
- Profile includes country and year/grade selection.
- Dashboard shows "on track", "ahead", or "needs focus" status badge.
- Grown-Ups area shows detailed curriculum progress view.
- Skills are mapped to local curriculum expectations for NZ, AU, UK, US, CA.
- Coach insights reference curriculum benchmarks.

**Dependencies:** Progress Dashboard, Mastery Tracker, Profile system.
```

### Section 12: Math Dash Coach

Add curriculum alignment to Coach capabilities:

```markdown
#### 12.3.5 Curriculum-Aligned Insights (NEW)

**Per-child curriculum comparison:**
- Compare proficiency to local curriculum expectations for their year/grade.
- Identify skills where child is ahead or behind typical expectations.
- Example: "In Year 4, children are expected to know all times tables to 12×12. Alex has mastered 10 of 12 tables and is on track."

**Country-specific messaging:**
- Recommendations use local terminology (Year 3 vs Grade 2).
- Reference appropriate curriculum standards.
```

### Section 13: Analytics

Add curriculum-related events:

```markdown
### 13.5 Curriculum-Specific Events (NEW)

- CURRICULUM_COUNTRY_SET: When user selects country/year
- CURRICULUM_PROGRESS_VIEWED: When user views curriculum progress page
- CURRICULUM_STATUS_CHANGED: When overall status changes (behind → on-track)
```

---

## Part 6: Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Curriculum data inaccuracies | High | Medium | Review with educators, cite official sources, allow user feedback |
| Performance with large datasets | Medium | Low | Caching, incremental updates, lazy loading |
| Overwhelming parents with data | Medium | Medium | Progressive disclosure, simple summary first |
| Country selection reduces onboarding conversion | Low | Low | Make country optional, default to sensible value |
| Skill mapping complexity | Medium | Medium | Thorough testing, edge case handling |

---

## Part 7: Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Parents viewing curriculum progress | 30% of Coach subscribers | Analytics |
| Accuracy of "on track" status | <10% disputed by users | User feedback |
| Feature adoption | 60% of new profiles set country | Analytics |
| Coach recommendation follow-through | 20% increase | Session starts after recommendation |

---

## Part 8: Open Questions

1. **Default country:** Should we detect country from browser locale or require explicit selection?
2. **Curriculum updates:** How do we handle curriculum changes over time? Version the data?
3. **Teacher view:** Should teachers see class-level curriculum progress? (Future scope)
4. **Extension skills:** How prominently should we show extension/stretch goals?
5. **Historical comparison:** Should we show "where you were 3 months ago"?

---

## Appendix A: Linear Issues (Work Breakdown)

The following issues should be created in Linear:

### Epic: Curriculum Data Foundation
- [ ] Create curriculum-data.ts with skill definitions
- [ ] Create skill-game-mapping.ts configuration  
- [ ] Add country and yearGrade to Profile interface
- [ ] Database migration v9 for new Profile fields
- [ ] Create country-config.ts with age mappings
- [ ] Unit tests for curriculum data validation

### Epic: Curriculum Progress Engine
- [ ] Create CurriculumTracker class
- [ ] Implement getSkillProgress() aggregation
- [ ] Implement filterRecordsForSkill() matching
- [ ] Implement getCurriculumProgress() status calculation
- [ ] Implement getRecommendedFocus() suggestions
- [ ] Add caching for progress calculations
- [ ] Unit tests for CurriculumTracker
- [ ] Integration tests with sample data

### Epic: Content Gap Closure
- [ ] Add number-bonds-decimal-1 topic and generator
- [ ] Add doubles-2digit topic and generator
- [ ] Add doubles-3digit topic and generator
- [ ] Add doubles-decimal topic and generator
- [ ] Update SPECIAL_TOPICS array
- [ ] Tests for new question generators
- [ ] Update topic selection UI

### Epic: Country Selection UI
- [ ] Create CountrySelector component
- [ ] Create YearGradeSelector component
- [ ] Add to profile creation flow
- [ ] Add to Settings page
- [ ] Auto-derive year from age band
- [ ] Style with CSS modules
- [ ] Accessibility audit

### Epic: Curriculum Dashboard UI
- [ ] Design wireframes for curriculum progress view
- [ ] Create CurriculumProgressCard component
- [ ] Create SkillProgressGrid component
- [ ] Create CurriculumStatusBadge component
- [ ] Add curriculum summary to main dashboard
- [ ] Create detailed view in Grown-Ups area
- [ ] Add skill drill-down modal
- [ ] Add "practice this skill" button
- [ ] Style all components
- [ ] Add animations

### Epic: Coach AI Integration
- [ ] Update Coach prompts with curriculum context
- [ ] Add benchmarks to AI input data
- [ ] Generate curriculum-aligned recommendations
- [ ] Add grade level messaging
- [ ] Create curriculum summary for reports

### Epic: Testing & Documentation
- [ ] Update PRD with curriculum feature
- [ ] Update design documentation
- [ ] E2E tests for country selection
- [ ] E2E tests for curriculum view
- [ ] Performance testing
- [ ] Accessibility audit
- [ ] User-facing help content

---

## Appendix B: Sample Curriculum Progress UI

### Dashboard Badge (Compact)

```
┌──────────────────────────────────────────┐
│  🎯 Year 3 Progress                      │
│  ┌────────────────────────────────────┐  │
│  │ ████████████████░░░░  On Track     │  │
│  │ 7 of 10 core skills proficient     │  │
│  └────────────────────────────────────┘  │
│  [View Details]                          │
└──────────────────────────────────────────┘
```

### Detailed View (Grown-Ups)

```
┌──────────────────────────────────────────────────────────────┐
│  Emma's Curriculum Progress                                   │
│  Year 3 · New Zealand · Age 7-8                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Overall: ✅ On Track                                         │
│                                                               │
│  Core Skills (7/10 proficient)                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ● Number bonds to 20          ████████████████ Mastered│  │
│  │ ● Add/Sub within 100          ██████████████░░ Profic. │  │
│  │ ● Times tables 2, 5, 10       ████████████████ Mastered│  │
│  │ ○ Times tables 3, 4, 8        ████████░░░░░░░░ Developing│ │
│  │ ○ Division by 2, 5, 10        ████████░░░░░░░░ Developing│ │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  Recommended Focus: 3× and 4× times tables                   │
│  [Start Practice]                                             │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Conclusion

This curriculum alignment feature is a significant addition to Math Dash that will:

1. **Differentiate** the product from competitors by providing meaningful, localized progress tracking
2. **Empower parents** with clear understanding of where their child stands
3. **Support teachers** in identifying students who need additional support
4. **Enhance the Coach AI** with contextual, curriculum-aware recommendations
5. **Create a foundation** for expansion to more countries and educational systems

The implementation is designed to be:
- **Data-driven** – new countries can be added without code changes
- **Performant** – with caching and lazy loading strategies
- **Extensible** – architecture supports future enhancements
- **Tested** – comprehensive test coverage at unit and integration levels

**Recommended next steps:**
1. Review and approve this plan
2. Create Linear issues from Appendix A
3. Begin Epic 1 (Data Foundation) implementation
4. Parallel work on Epic 3 (Content Gaps) to close game mode gaps
