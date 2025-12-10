# Curriculum Feature User Acceptance Plan

This document defines the tasks, data, and feedback capture steps for the `NEX-157` user acceptance run with parents and students. You can execute these steps locally using the DevTools MCP to monitor analytics/behaviour and capture any issues.

## Objectives

1. Confirm that parents understand and can set the country/year for their child profiles.  
2. Verify that the curriculum progress panel communicates status (behind/on-track/ahead) and that recommendations launch practice.  
3. Ensure the override flow (age band → explicit year) and the recommendation hint resonate with parents who know their child is held back or accelerated.  
4. Observe whether the offline-first experience and curriculum dashboard remain usable during connectivity drops.

## Test Scenarios

| Scenario | Task | Notes |
| --- | --- | --- |
| New profile flow | Use the Create Profile wizard to add a child, select an age band, and go through the country/year step. | Confirm the selector pre-selects a year, but allow override & capture comprehension of the hint text. |
| Curriculum dashboard after play | Select a profile that has some sessions (or seed `Johnny` demo data), open the Progress tab, expand the curriculum section, and observe skill statuses and chips. | Record if the status badge text is clear and whether the "Recommended next steps" panel offers actionable practice. |
| Recommendation bootstrapping | Tap a recommendation and ensure it launches `/play?source=recommendation`. | Monitoring `trackCurriculumRecommendationClicked` via DevTools MCP (see `getAnalyticsQueue`) can confirm the event fires. |
| Status transitions | Simulate improvement (e.g., mark more facts as mastered via seeded data or manually mark bool) and verify the overall status shifts from `behind` to `on-track` or `ahead`. | Capture the Skill list and status badge at each stage for artifacts. |
| Existing profile migration | Open a profile without curriculum settings, go through Settings > Country/Year, and ensure the update persists; verify the `curriculum_profile_set` event contains `actionStage: migration`. | Use DevTools MCP to inspect `window.__curriculumProgressCache` (via `_testExports`) to verify invalidations. |
| Offline experience | Toggle offline mode (via DevTools Network tab or Playwright's `context.setOffline(true)`), reload the grown-ups dashboard, and confirm the curriculum panel still renders with cached data and the offline banner appears. | Document any UI differences or disabled actions. |

## Data & environment

- **Profile seeds**: Use the existing `Johnny` demo data plus create a fresh test profile so recommendations and progress exist.  
- **DevTools MCP usage**: Open the DevTools console, run `window.__curriculumProgressCache` when evaluating the caching note from `Docs/curriculum-performance-report.md`.  
- **Analytics inspection**: After running each scenario, inspect `window.analytics.track` calls or the in-memory queue exported via `getAnalyticsQueue()` to confirm curriculum events log correctly.  
- **Mobile/tablet validation**: Repeat scenarios on screen sizes using Chrome DevTools device toolbar; ensure curriculum cards, the selector, and buttons remain readable.

## Feedback capture

Create a shared feedback template with the following fields:

- Tester name / relation (parent/teacher).  
- Devices used (desktop/tablet/phone, offline/online).  
- Scenario (profile creation, dashboard, recommendations, migration, offline).  
- Observations (what worked, what confused the tester).  
- Metrics (time to complete flow, status reading clarity).  
- Bugs or follow-up tasks (record exact steps & expected vs. observed behaviour).

Store feedback in `project-documentation/product-manager-output.md` or the curriculum project board so it feeds into follow-up issues.
