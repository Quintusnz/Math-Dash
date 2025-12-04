# Math Dash – Curriculum Alignment: Linear Work Breakdown

This document contains the issues to be created in Linear for the Curriculum Alignment feature implementation.

---

## Project: Curriculum Alignment & Progress Tracking

**Description:** Enable parents and teachers to see how a child's math fluency compares to local curriculum expectations for their age and country (NZ, AU, UK, US, CA).

**Labels to create:**
- `curriculum` - All curriculum-related work
- `data-model` - Database and data structure changes
- `game-engine` - Question generation and tracking logic
- `ui-component` - Frontend component work
- `testing` - Test coverage
- `documentation` - Docs and help content

---

## Epic 1: Data Foundation

### Issue 1.1: Create curriculum-data.ts with skill definitions
**Priority:** Urgent  
**Estimate:** 4 points  
**Labels:** curriculum, data-model

**Description:**
Create the master curriculum data file containing all skill definitions from the Curriculum document.

**Acceptance Criteria:**
- [ ] Create `src/lib/constants/curriculum-data.ts`
- [ ] Define `Skill` interface with id, label, domain, subdomain, description, numberRange, gameModes
- [ ] Define `YearBenchmark` interface with label, ageRange, coreSkills, extensionSkills
- [ ] Define `CountryConfig` interface with label, systemType, years
- [ ] Define `CurriculumData` interface
- [ ] Populate all 22 skills from the Curriculum document
- [ ] Populate all 5 countries (NZ, AU, UK, US, CA) with year/grade benchmarks
- [ ] Export typed curriculum data object
- [ ] Add version number for future migrations

---

### Issue 1.2: Create skill-game-mapping.ts configuration
**Priority:** Urgent  
**Estimate:** 3 points  
**Labels:** curriculum, data-model

**Description:**
Create the configuration that maps curriculum skill IDs to actual game modes and question generator parameters.

**Acceptance Criteria:**
- [ ] Create `src/lib/constants/skill-game-mapping.ts`
- [ ] Define `SkillGameConfig` interface with topics, operations, numberRange, selectedNumbers, expectedFactCount
- [ ] Create mapping for all 22 skills
- [ ] For each skill, specify:
  - Which TopicType(s) it maps to
  - Which operations it covers
  - Number range (if applicable)
  - Selected times table numbers (if applicable)
  - Expected fact count for coverage calculation
- [ ] Export `SKILL_GAME_MAPPING` constant

---

### Issue 1.3: Add country and yearGrade to Profile interface
**Priority:** Urgent  
**Estimate:** 1 point  
**Labels:** curriculum, data-model

**Description:**
Extend the Profile interface to store the user's country and year/grade level.

**Acceptance Criteria:**
- [ ] Add `country?: 'NZ' | 'AU' | 'UK' | 'US' | 'CA'` to Profile interface
- [ ] Add `yearGrade?: string` to Profile interface (e.g., "Y3", "G2", "K")
- [ ] Add `curriculumLastUpdated?: string` for cache invalidation
- [ ] Update Profile type exports

---

### Issue 1.4: Database migration v9 for new Profile fields
**Priority:** Urgent  
**Estimate:** 2 points  
**Labels:** curriculum, data-model

**Description:**
Add Dexie database migration to support the new Profile fields.

**Acceptance Criteria:**
- [ ] Increment database version to 9
- [ ] Add migration that preserves existing Profile data
- [ ] New profiles should work with optional country/yearGrade
- [ ] Existing profiles continue to work (fields are optional)
- [ ] Test migration with existing data

---

### Issue 1.5: Create country-config.ts with age mappings
**Priority:** Urgent  
**Estimate:** 2 points  
**Labels:** curriculum, data-model

**Description:**
Create configuration for mapping age bands to year/grade levels per country.

**Acceptance Criteria:**
- [ ] Create `src/lib/constants/country-config.ts`
- [ ] Define `CountryMetadata` interface with label, flag emoji, systemType, terminology
- [ ] Create `COUNTRY_METADATA` constant for all 5 countries
- [ ] Create `AGE_TO_YEAR_MAPPING` function that converts age band to year/grade
- [ ] Handle edge cases (e.g., 5-year-old in US = Kindergarten)
- [ ] Export helper functions for UI display

---

### Issue 1.6: Unit tests for curriculum data validation
**Priority:** High  
**Estimate:** 2 points  
**Labels:** curriculum, testing

**Description:**
Write comprehensive unit tests to validate curriculum data integrity.

**Acceptance Criteria:**
- [ ] Create `src/tests/curriculum-data.test.ts`
- [ ] Test that all skill IDs are unique
- [ ] Test that all coreSkills/extensionSkills reference valid skill IDs
- [ ] Test that all countries have all required year/grade entries
- [ ] Test that skill-game-mapping covers all skills in curriculum-data
- [ ] Test age band mappings for each country

---

## Epic 2: Curriculum Progress Engine

### Issue 2.1: Create CurriculumTracker class skeleton
**Priority:** Urgent  
**Estimate:** 2 points  
**Labels:** curriculum, game-engine

**Description:**
Create the main CurriculumTracker class with method stubs and types.

**Acceptance Criteria:**
- [ ] Create `src/lib/game-engine/curriculum-tracker.ts`
- [ ] Define `SkillProgress` interface
- [ ] Define `CurriculumProgress` interface
- [ ] Create `CurriculumTracker` class with static methods
- [ ] Add method stubs: getSkillProgress, getCurriculumProgress, getRecommendedFocus
- [ ] Export class and types

---

### Issue 2.2: Implement getSkillProgress() aggregation
**Priority:** Urgent  
**Estimate:** 6 points  
**Labels:** curriculum, game-engine

**Description:**
Implement the core logic to aggregate individual mastery records into skill-level proficiency.

**Acceptance Criteria:**
- [ ] Implement `getSkillProgress(profileId, skillId)` method
- [ ] Query all mastery records for profile
- [ ] Filter records that belong to the specified skill
- [ ] Calculate aggregate metrics: totalAttempts, totalCorrect, accuracy, avgResponseTime
- [ ] Calculate coverage (facts practiced / expected facts)
- [ ] Determine proficiency level: not-started, developing, proficient, mastered
- [ ] Return SkillProgress object

---

### Issue 2.3: Implement filterRecordsForSkill() matching
**Priority:** Urgent  
**Estimate:** 4 points  
**Labels:** curriculum, game-engine

**Description:**
Implement the logic to determine which mastery records belong to a specific curriculum skill.

**Acceptance Criteria:**
- [ ] Create `filterRecordsForSkill(records, skillId)` helper function
- [ ] Use skill-game-mapping to get skill configuration
- [ ] Match records by operation type
- [ ] For times tables, match by involved numbers
- [ ] For add/sub, match by number ranges
- [ ] Handle special topics (number bonds, doubles, squares)
- [ ] Handle edge cases (facts that could belong to multiple skills)

---

### Issue 2.4: Implement getCurriculumProgress() status calculation
**Priority:** Urgent  
**Estimate:** 4 points  
**Labels:** curriculum, game-engine

**Description:**
Implement the full curriculum progress calculation for a profile.

**Acceptance Criteria:**
- [ ] Implement `getCurriculumProgress(profileId)` method
- [ ] Get profile's country and yearGrade
- [ ] Get benchmark for that country/year
- [ ] Calculate progress for each coreSkill
- [ ] Calculate progress for each extensionSkill
- [ ] Determine overall status: behind, on-track, ahead
- [ ] Return CurriculumProgress object with all data

---

### Issue 2.5: Implement getRecommendedFocus() suggestions
**Priority:** High  
**Estimate:** 3 points  
**Labels:** curriculum, game-engine

**Description:**
Implement curriculum-aware practice recommendations.

**Acceptance Criteria:**
- [ ] Implement `getRecommendedFocus(profileId)` method
- [ ] Identify coreSkills that are not yet proficient
- [ ] Prioritize by: developing > not-started
- [ ] Return up to 3 focus areas with skill IDs and labels
- [ ] Include action config for starting practice

---

### Issue 2.6: Add caching for curriculum calculations
**Priority:** High  
**Estimate:** 3 points  
**Labels:** curriculum, game-engine

**Description:**
Implement caching to avoid recalculating curriculum progress on every page load.

**Acceptance Criteria:**
- [ ] Cache curriculum progress in memory
- [ ] Invalidate cache when new session completes
- [ ] Cache expires after 5 minutes
- [ ] Use curriculumLastUpdated field for cache key
- [ ] Update cache incrementally after sessions when possible

---

### Issue 2.7: Unit tests for CurriculumTracker
**Priority:** Urgent  
**Estimate:** 4 points  
**Labels:** curriculum, testing

**Description:**
Write comprehensive unit tests for the CurriculumTracker class.

**Acceptance Criteria:**
- [ ] Test getSkillProgress with various mastery data
- [ ] Test filterRecordsForSkill for all skill types
- [ ] Test getCurriculumProgress with different scenarios
- [ ] Test proficiency thresholds (developing at 70%, mastered at 85%+)
- [ ] Test overall status calculation
- [ ] Mock database for isolated testing

---

### Issue 2.8: Integration tests with sample data
**Priority:** High  
**Estimate:** 3 points  
**Labels:** curriculum, testing

**Description:**
Write integration tests that use realistic sample data.

**Acceptance Criteria:**
- [ ] Create sample mastery data fixtures
- [ ] Test complete flow: profile → curriculum progress
- [ ] Test for each country/year combination
- [ ] Verify UI-facing data structure is complete
- [ ] Test edge cases: new profile, no data, all mastered

---

## Epic 3: Content Gap Closure

### Issue 3.1: Add number-bonds-decimal-1 topic type
**Priority:** High  
**Estimate:** 1 point  
**Labels:** curriculum, game-engine

**Description:**
Add the TopicType for decimal number bonds to 1.0.

**Acceptance Criteria:**
- [ ] Add 'number-bonds-decimal-1' to TopicType union
- [ ] Add to SPECIAL_TOPICS array with label and description
- [ ] Update isSpecialTopic() function

---

### Issue 3.2: Implement decimal bonds question generator
**Priority:** High  
**Estimate:** 4 points  
**Labels:** curriculum, game-engine

**Description:**
Implement question generation for decimal number bonds to 1.0.

**Acceptance Criteria:**
- [ ] Create `generateDecimalBondsQuestion()` function
- [ ] Generate pairs like 0.3 + 0.7, 0.45 + 0.55
- [ ] Support 1 and 2 decimal places
- [ ] Format: "0.3 + ? = 1" and "1 - 0.3 = ?"
- [ ] Add to generateSpecialTopicQuestion switch
- [ ] Handle floating point precision issues

---

### Issue 3.3: Add doubles-2digit topic type
**Priority:** High  
**Estimate:** 1 point  
**Labels:** curriculum, game-engine

**Description:**
Add the TopicType for 2-digit doubles.

**Acceptance Criteria:**
- [ ] Add 'doubles-2digit' to TopicType union
- [ ] Add to SPECIAL_TOPICS array
- [ ] Update isSpecialTopic() function

---

### Issue 3.4: Implement 2-digit doubles question generator
**Priority:** High  
**Estimate:** 3 points  
**Labels:** curriculum, game-engine

**Description:**
Implement question generation for doubling 2-digit numbers.

**Acceptance Criteria:**
- [ ] Create `generate2DigitDoublesQuestion()` function
- [ ] Use friendly numbers: multiples of 5, 10, and simple 2-digit numbers
- [ ] Examples: double 24, double 35, double 48
- [ ] Include matching halves (half of 48 = 24)
- [ ] Add to generateSpecialTopicQuestion switch

---

### Issue 3.5: Add doubles-3digit topic and generator
**Priority:** Medium  
**Estimate:** 2 points  
**Labels:** curriculum, game-engine

**Description:**
Implement 3-digit doubles for advanced learners.

**Acceptance Criteria:**
- [ ] Add 'doubles-3digit' to TopicType union
- [ ] Implement question generator for 3-digit numbers
- [ ] Use friendly numbers (multiples of 25, 50, 100)
- [ ] Add to SPECIAL_TOPICS and switch

---

### Issue 3.6: Add doubles-decimal topic and generator
**Priority:** Medium  
**Estimate:** 3 points  
**Labels:** curriculum, game-engine

**Description:**
Implement decimal doubles for advanced learners.

**Acceptance Criteria:**
- [ ] Add 'doubles-decimal' to TopicType union
- [ ] Implement question generator for decimal numbers
- [ ] Examples: double 3.5, double 0.75
- [ ] Handle floating point precision
- [ ] Add to SPECIAL_TOPICS and switch

---

### Issue 3.7: Update SPECIAL_TOPICS array
**Priority:** High  
**Estimate:** 1 point  
**Labels:** curriculum, game-engine

**Description:**
Ensure all new topics are properly added to SPECIAL_TOPICS.

**Acceptance Criteria:**
- [ ] Add all new topics to SPECIAL_TOPICS in useGameStore
- [ ] Include appropriate labels and descriptions
- [ ] Set correct category for each topic
- [ ] Verify topics appear in UI

---

### Issue 3.8: Tests for new question generators
**Priority:** High  
**Estimate:** 3 points  
**Labels:** curriculum, testing

**Description:**
Add test coverage for all new question generators.

**Acceptance Criteria:**
- [ ] Test decimal bonds generates valid questions
- [ ] Test 2-digit doubles generates valid questions
- [ ] Test answer correctness for all new types
- [ ] Test fact string format
- [ ] Test edge cases (precision, range bounds)

---

### Issue 3.9: Update topic selection UI for new topics
**Priority:** High  
**Estimate:** 2 points  
**Labels:** curriculum, ui-component

**Description:**
Add new topics to the topic selection screen.

**Acceptance Criteria:**
- [ ] New topics appear in correct category groups
- [ ] Topics have appropriate icons
- [ ] Premium lock status is respected
- [ ] Topics are playable end-to-end

---

## Epic 4: Country Selection UI

### Issue 4.1: Create CountrySelector component
**Priority:** Urgent  
**Estimate:** 3 points  
**Labels:** curriculum, ui-component

**Description:**
Create a reusable country selection component.

**Acceptance Criteria:**
- [ ] Create `src/components/features/curriculum/CountrySelector.tsx`
- [ ] Display all 5 countries with flag emoji and label
- [ ] Support controlled and uncontrolled modes
- [ ] Include "I'm not sure" / auto-detect option
- [ ] Style with CSS modules matching design system
- [ ] Keyboard navigable

---

### Issue 4.2: Create YearGradeSelector component
**Priority:** Urgent  
**Estimate:** 4 points  
**Labels:** curriculum, ui-component

**Description:**
Create a year/grade selection component that adapts based on country.

**Acceptance Criteria:**
- [ ] Create `src/components/features/curriculum/YearGradeSelector.tsx`
- [ ] Show country-appropriate labels (Year 1-6 vs Grade K-5)
- [ ] Include age range hint for each option
- [ ] Auto-select based on profile's ageBand
- [ ] Allow override of auto-selection
- [ ] Style with CSS modules

---

### Issue 4.3: Add country/year to profile creation flow
**Priority:** Urgent  
**Estimate:** 3 points  
**Labels:** curriculum, ui-component

**Description:**
Integrate country and year selection into the profile creation flow.

**Acceptance Criteria:**
- [ ] Add country/year step after age band selection
- [ ] Pre-select year based on age band
- [ ] Save country and yearGrade to profile
- [ ] Allow skipping (optional fields)
- [ ] Update profile creation UX flow

---

### Issue 4.4: Add country/year to Settings page
**Priority:** Urgent  
**Estimate:** 2 points  
**Labels:** curriculum, ui-component

**Description:**
Allow users to change their country and year/grade in Settings.

**Acceptance Criteria:**
- [ ] Add curriculum section to Settings page
- [ ] Show current country and year
- [ ] Allow changing both values
- [ ] Persist changes to profile
- [ ] Show toast confirmation

---

### Issue 4.5: Auto-derive year from age band
**Priority:** High  
**Estimate:** 2 points  
**Labels:** curriculum, game-engine

**Description:**
Implement logic to automatically suggest year/grade based on age.

**Acceptance Criteria:**
- [ ] Create `deriveYearFromAge(country, ageBand)` function
- [ ] Map each country's age ranges to year/grade
- [ ] Handle edge cases (5-year-olds, 11-year-olds)
- [ ] Use in profile creation and settings

---

### Issue 4.6: Style components with CSS modules
**Priority:** Urgent  
**Estimate:** 2 points  
**Labels:** curriculum, ui-component

**Description:**
Apply design system styling to all curriculum UI components.

**Acceptance Criteria:**
- [ ] Create CSS module files for each component
- [ ] Use CSS variables from globals.css
- [ ] Match existing design patterns
- [ ] Ensure responsive design
- [ ] Support dark mode (if applicable)

---

### Issue 4.7: Accessibility for country selection
**Priority:** Urgent  
**Estimate:** 2 points  
**Labels:** curriculum, ui-component

**Description:**
Ensure country/year selection is fully accessible.

**Acceptance Criteria:**
- [ ] Add proper ARIA labels
- [ ] Full keyboard navigation
- [ ] Screen reader announces selections
- [ ] Focus management on state changes
- [ ] Test with screen reader

---

## Epic 5: Curriculum Dashboard UI

### Issue 5.1: Design curriculum progress wireframes
**Priority:** Urgent  
**Estimate:** 2 points  
**Labels:** curriculum, ui-component

**Description:**
Create wireframes for the curriculum progress views.

**Acceptance Criteria:**
- [ ] Compact dashboard badge design
- [ ] Detailed Grown-Ups view design
- [ ] Skill grid/list layout options
- [ ] Mobile responsive designs
- [ ] Document in design folder

---

### Issue 5.2: Create CurriculumProgressCard component
**Priority:** Urgent  
**Estimate:** 4 points  
**Labels:** curriculum, ui-component

**Description:**
Create the compact curriculum progress card for the main dashboard.

**Acceptance Criteria:**
- [ ] Create `src/components/features/curriculum/CurriculumProgressCard.tsx`
- [ ] Show year/grade label
- [ ] Display progress bar (X of Y skills)
- [ ] Show overall status badge (on-track, ahead, needs focus)
- [ ] Link to detailed view
- [ ] Style with CSS modules

---

### Issue 5.3: Create SkillProgressGrid component
**Priority:** Urgent  
**Estimate:** 6 points  
**Labels:** curriculum, ui-component

**Description:**
Create the skill progress grid showing individual skill status.

**Acceptance Criteria:**
- [ ] Create `src/components/features/curriculum/SkillProgressGrid.tsx`
- [ ] Display skills in a grid or list layout
- [ ] Show proficiency indicator for each skill (mastered/proficient/developing/not-started)
- [ ] Distinguish core vs extension skills
- [ ] Allow tap/click for drill-down
- [ ] Responsive layout

---

### Issue 5.4: Create CurriculumStatusBadge component
**Priority:** Urgent  
**Estimate:** 2 points  
**Labels:** curriculum, ui-component

**Description:**
Create the status badge component used throughout the app.

**Acceptance Criteria:**
- [ ] Create `src/components/features/curriculum/CurriculumStatusBadge.tsx`
- [ ] Three variants: ahead (green), on-track (blue), needs-focus (orange)
- [ ] Icon + text display
- [ ] Compact and full-size variants
- [ ] Accessible contrast

---

### Issue 5.5: Add curriculum summary to main dashboard
**Priority:** Urgent  
**Estimate:** 3 points  
**Labels:** curriculum, ui-component

**Description:**
Integrate the curriculum progress card into the main dashboard.

**Acceptance Criteria:**
- [ ] Add CurriculumProgressCard to dashboard page
- [ ] Position appropriately (below or alongside Skill Radar)
- [ ] Only show if profile has country set
- [ ] Show prompt to set country if not set
- [ ] Handle loading state

---

### Issue 5.6: Create detailed curriculum view in Grown-Ups area
**Priority:** Urgent  
**Estimate:** 6 points  
**Labels:** curriculum, ui-component

**Description:**
Create the full curriculum progress page for parents/teachers.

**Acceptance Criteria:**
- [ ] Create `src/app/(app)/grown-ups/curriculum/page.tsx`
- [ ] Show child's name and country/year
- [ ] Display overall status prominently
- [ ] Show SkillProgressGrid for core skills
- [ ] Show extension skills section
- [ ] Display recommended focus areas
- [ ] Link to practice sessions

---

### Issue 5.7: Add skill drill-down modal
**Priority:** High  
**Estimate:** 4 points  
**Labels:** curriculum, ui-component

**Description:**
Create a modal that shows detailed info for a specific skill.

**Acceptance Criteria:**
- [ ] Create modal component
- [ ] Show skill name and description
- [ ] Display accuracy, speed, coverage metrics
- [ ] List specific facts within the skill
- [ ] Show mastery status of each fact
- [ ] "Start Practice" button

---

### Issue 5.8: Add "practice this skill" action button
**Priority:** High  
**Estimate:** 2 points  
**Labels:** curriculum, ui-component

**Description:**
Enable direct navigation to practice a specific skill.

**Acceptance Criteria:**
- [ ] Add action button to skill cards
- [ ] Navigate to play page with skill pre-selected
- [ ] Use skill-game-mapping for configuration
- [ ] Handle skills with multiple topics

---

### Issue 5.9: Style all curriculum components
**Priority:** Urgent  
**Estimate:** 4 points  
**Labels:** curriculum, ui-component

**Description:**
Apply consistent styling to all curriculum components.

**Acceptance Criteria:**
- [ ] CSS modules for all components
- [ ] Use design system colors and spacing
- [ ] Consistent typography
- [ ] Proper visual hierarchy
- [ ] Mobile-first responsive design

---

### Issue 5.10: Add animations with Motion
**Priority:** Low  
**Estimate:** 2 points  
**Labels:** curriculum, ui-component

**Description:**
Add subtle animations for polish.

**Acceptance Criteria:**
- [ ] Animate progress bar fills
- [ ] Animate status badge changes
- [ ] Entrance animations for cards
- [ ] Keep animations subtle and performant
- [ ] Respect prefers-reduced-motion

---

## Epic 6: Coach AI Integration

### Issue 6.1: Update Coach prompts with curriculum context
**Priority:** High  
**Estimate:** 3 points  
**Labels:** curriculum, game-engine

**Description:**
Enhance Coach AI prompts to include curriculum alignment information.

**Acceptance Criteria:**
- [ ] Add curriculum progress to AI input data
- [ ] Include country and year context
- [ ] Add benchmark expectations to prompt
- [ ] Test AI responses include curriculum references

---

### Issue 6.2: Add benchmarks to AI input data
**Priority:** High  
**Estimate:** 2 points  
**Labels:** curriculum, game-engine

**Description:**
Structure curriculum data for AI consumption.

**Acceptance Criteria:**
- [ ] Format curriculum progress for AI prompts
- [ ] Include expected vs actual skill levels
- [ ] Add skill descriptions for context
- [ ] Keep data size reasonable

---

### Issue 6.3: Generate curriculum-aligned recommendations
**Priority:** High  
**Estimate:** 4 points  
**Labels:** curriculum, game-engine

**Description:**
Enhance Coach recommendations to consider curriculum benchmarks.

**Acceptance Criteria:**
- [ ] Prioritize curriculum-aligned skills
- [ ] Reference expectations in recommendations
- [ ] Use local terminology (Year 3 vs Grade 2)
- [ ] Actionable suggestions linked to practice

---

### Issue 6.4: Add grade level messaging
**Priority:** High  
**Estimate:** 2 points  
**Labels:** curriculum, ui-component

**Description:**
Add curriculum-aware messaging to Coach outputs.

**Acceptance Criteria:**
- [ ] "On track for Year 3" type messages
- [ ] "Ahead of typical Year 3 in times tables"
- [ ] Encouraging tone for "needs focus" areas
- [ ] Country-appropriate language

---

### Issue 6.5: Create curriculum summary for Coach reports
**Priority:** High  
**Estimate:** 3 points  
**Labels:** curriculum, ui-component

**Description:**
Add curriculum alignment section to Coach reports.

**Acceptance Criteria:**
- [ ] Include curriculum summary in monthly reports
- [ ] Show progress over time vs curriculum
- [ ] Highlight skills mastered and remaining
- [ ] Keep report concise and actionable

---

## Epic 7: Testing & Documentation

### Issue 7.1: Update PRD with curriculum feature
**Priority:** Urgent  
**Estimate:** 3 points  
**Labels:** curriculum, documentation

**Description:**
Add curriculum alignment feature to the PRD.

**Acceptance Criteria:**
- [ ] Add Feature 10: Curriculum Alignment
- [ ] Update Coach section with curriculum capabilities
- [ ] Add curriculum analytics events
- [ ] Update success metrics
- [ ] Review all sections for consistency

---

### Issue 7.2: Update design documentation
**Priority:** Urgent  
**Estimate:** 2 points  
**Labels:** curriculum, documentation

**Description:**
Update design docs with curriculum feature documentation.

**Acceptance Criteria:**
- [ ] Create curriculum feature folder
- [ ] Add README, implementation, accessibility docs
- [ ] Update main features README
- [ ] Add component documentation

---

### Issue 7.3: E2E tests for country selection flow
**Priority:** High  
**Estimate:** 3 points  
**Labels:** curriculum, testing

**Description:**
Write end-to-end tests for the country selection flow.

**Acceptance Criteria:**
- [ ] Test profile creation with country
- [ ] Test changing country in settings
- [ ] Test year auto-selection
- [ ] Test for all 5 countries

---

### Issue 7.4: E2E tests for curriculum view
**Priority:** High  
**Estimate:** 3 points  
**Labels:** curriculum, testing

**Description:**
Write end-to-end tests for the curriculum progress views.

**Acceptance Criteria:**
- [ ] Test dashboard card display
- [ ] Test Grown-Ups detailed view
- [ ] Test skill drill-down
- [ ] Test practice action button
- [ ] Test different progress scenarios

---

### Issue 7.5: Performance testing with large datasets
**Priority:** High  
**Estimate:** 2 points  
**Labels:** curriculum, testing

**Description:**
Test curriculum calculations with large mastery datasets.

**Acceptance Criteria:**
- [ ] Generate test data with 1000+ mastery records
- [ ] Measure calculation time
- [ ] Verify caching works
- [ ] Ensure UI remains responsive
- [ ] Document performance characteristics

---

### Issue 7.6: Accessibility audit for new components
**Priority:** Urgent  
**Estimate:** 2 points  
**Labels:** curriculum, testing

**Description:**
Conduct accessibility audit of all curriculum components.

**Acceptance Criteria:**
- [ ] Test with keyboard navigation
- [ ] Test with screen reader
- [ ] Verify color contrast
- [ ] Check focus indicators
- [ ] Document any issues and fixes

---

### Issue 7.7: Create user-facing help content
**Priority:** Low  
**Estimate:** 2 points  
**Labels:** curriculum, documentation

**Description:**
Create help content explaining curriculum alignment to users.

**Acceptance Criteria:**
- [ ] FAQ: "How do we determine if my child is on track?"
- [ ] Explanation of country differences
- [ ] Guide to using curriculum progress view
- [ ] Parent-friendly language

---

## Summary

**Total Issues:** 45
**Total Estimate:** ~150 points

**Priority Distribution:**
- Urgent (P0): 20 issues
- High (P1): 20 issues
- Medium (P2): 3 issues
- Low (P3): 2 issues

**Epic Summary:**
| Epic | Issues | Points |
|------|--------|--------|
| 1. Data Foundation | 6 | 14 |
| 2. Progress Engine | 8 | 29 |
| 3. Content Gaps | 9 | 20 |
| 4. Country Selection UI | 7 | 16 |
| 5. Curriculum Dashboard | 10 | 35 |
| 6. Coach Integration | 5 | 14 |
| 7. Testing & Docs | 7 | 17 |
