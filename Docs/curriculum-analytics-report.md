# Curriculum Analytics Reporting

This page documents the curriculum-specific analytics instrumentation that helps the team track feature adoption, status shifts, and recommended actions without leaking sensitive information.

## Event catalog

| Event | Description | Key properties |
| --- | --- | --- |
| `curriculum_profile_set` | Fired whenever a profile saves curriculum settings (country/year). | `country`, `yearGrade`, `source`, `actionStage`, `curriculumVariant`. |
| `curriculum_progress_viewed` | Emitted when a parent views the curriculum progress card. | `overallStatus`, `curriculumVariant`. |
| `curriculum_skill_detailed` | Logged when a skill card is opened (via keyboard or click). | `skillId`, `skillStatus`, `curriculumVariant`. |
| `curriculum_recommendation_clicked` | Sent when a recommended focus action launches practice. | `skillId`, `source`, `curriculumVariant`. |

Each event also carries the local `profileId` and a timestamp. The analytics queue is exposed via `src/lib/analytics/curriculum-analytics.ts` for debugging and unit testing.

## Key metrics

1. **Migration completion rate** – count `curriculum_profile_set` events where `actionStage` is `migration`, then divide by the number of eligible profiles (those lacking curriculum settings).  
2. **Country/year popularity** – aggregate the `country` and `yearGrade` fields from `curriculum_profile_set` to build dashboards reporting the most common benchmarks.  
3. **Status ↔ engagement correlation** – join `curriculum_progress_viewed` events (which expose `overallStatus`) with session engagement (e.g., `session_completed`) upstream to understand how status relates to playtime and practice sessions.

## A/B testing infrastructure

All curriculum analytics events include `curriculumVariant`, which is derived from `getCurriculumVariant(profileId)` in `src/lib/analytics/curriculum-analytics.ts`. The variant is deterministic (based on a simple hash of the profile ID) but can be overridden via the `curriculumVariantOverride` key in `localStorage` for experimentation. Use this variant field as a segment key when comparing UI treatments or onboarding flows.

## Compliance & privacy

Events never contain profile names, email addresses, or any freeform answers. They only transmit IDs, status labels, and categorical properties required by the PRD. The analytics client respects the same opt-out controls that guard the rest of the app (`Docs/information-architecture.md` section on analytics governance).
