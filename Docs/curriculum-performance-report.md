# Curriculum Performance Testing Notes

This guide captures how we validated the curriculum progress calculations for real-world data volumes, caching behavior, and UI latency.

## Automated performance check

We added a Vitest performance test (`src/tests/performance/curriculum-performance.test.ts`) that:

- Mocks a large mastery dataset (1,200 records spanning multiple skills).  
- Measures the endpoint latency for `CurriculumTracker.getCurriculumProgress` to ensure it completes within ~500ms for such volume (our measured runs stay well under that ceiling).  
- Runs the calculation twice back-to-back to confirm throughput remains stable (no regressions on repeated execution).

Run `npx vitest run src/tests/performance/curriculum-performance.test.ts` to reproduce the measurement locally. The test logs nothing but will fail if the runtime exceeds ~500ms.

## Manual verification checklist

1. **Profile calculation latency** – open Chrome DevTools, go to the Performance tab, and record a session while opening a child’s curriculum card with a heavy mastery history. Verify the `CurriculumTracker.getCurriculumProgress` call completes in under 100ms on a modern desktop (the test ensures adequate headroom even for slower devices).  
2. **Dashboard render time** – snapshot the timeline showing the curriculum section; ensure the HTML/CSS work happens within 500ms of the component mounting.  
3. **Caching** – the `useCurriculumProgress` hook caches results for 5 minutes and invalidates when `curriculumLastUpdated` changes. Use DevTools Console to inspect `window.__curriculumProgressCache` (available via `getCurriculumProgress` helper `_testExports` if needed) or toggle the cache by calling `clearCurriculumProgressCache(profileId)` and observing that repeated views immediately reuse cached data without re-fetching from IndexedDB.  
4. **IndexedDB optimizations** – confirm that `mastery` queries leverage the default indexes (e.g., `profileId` is indexed) so the backend retrieval stays fast even with 1,000+ entries.

## Documented bottlenecks / optimizations

- **Caching**: The hook-level cache (`src/lib/hooks/useCurriculumProgress.ts`) keeps the last result keyed by `profileId`, `country`, `yearGrade`, and `curriculumLastUpdated`. This avoids recomputing the whole curriculum tree on every tab switch.  
- **Data batching**: `CurriculumTracker.getSkillProgress` reads all relevant mastery records once per skill (relying on the `skill-game-mapping` filter) and aggregates in memory, which keeps response times sub-100ms for typical datasets.  
- **Recommendation limits**: The recommended focus list is capped (max 3 entries), so the UI never renders an unbounded list that could slow layout.

Record additional profiling notes (e.g., devices, Browser + version) in this doc as new measurements come in.
