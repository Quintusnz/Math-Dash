# Ready Steady Math – Architecture Blueprint

> **Note:** Ready Steady Math was previously referred to as 'Math Dash' in earlier internal drafts.

## Executive Summary

- **Mission**: Deliver a browser-first, kid-friendly math fluency game that remains fully offline-capable while surfacing clear upgrade paths (one-time core unlock + optional AI credit packs) for parents and teachers.
- **System Shape**: Next.js 14 (App Router) experience deployed on **Vercel**. Client-side gameplay runs offline; authenticated CRUD, sync, and insights are handled through Next.js Route Handlers + Server Actions that interact with **Supabase** (Postgres, Auth, Storage, Edge Functions). **Stripe** powers all paid upgrades and credit packs.
- **Key Components**: Next.js UI/gameplay engine, Supabase Postgres schema (profiles, sessions, metrics, entitlements), Supabase Auth (adult/teacher accounts), Supabase Storage bucket for topic/config assets, Supabase Edge Functions for heavier async/AI work, Stripe checkout & webhook handler, and a Segment-based analytics pipeline.
- **Data Strategy**: Local IndexedDB for ultra-low-latency gameplay plus append-only sync logs; Supabase Postgres becomes source of truth once a device links to an account. RLS policies isolate per-account data, and Supabase Storage hosts topic catalogs + AI output artifacts.
- **Security & Compliance**: Supabase Auth-issued JWTs secure API calls; database Row-Level Security enforces tenancy; Stripe adult-gated flows keep payments isolated from children; TLS 1.2+ end-to-end; encryption at rest handled by Supabase (Postgres + Storage) and client-side obfuscation for IndexedDB.
- **Release Phasing**:
  1. **MVP (P0)** – Core gameplay, topic library, base modes, local profiles, skill radar, freemium gating with local entitlements + manual Stripe fulfillment, analytics logging.
  2. **P1 Enhancements** – Adaptive mode, engagement layer (streaks/goals/achievements), Supabase-backed account sync, AI credit scaffolding.
  3. **P2** – Dash Duel, richer teacher tooling, Supabase Edge Function AI analyses, expanded monetization experiments.
- **Critical Constraints**: Tap-to-feedback < 50 ms, initial load ≤ 3 s on Chromebooks/low-end tablets, ≥8 profiles/device, seamless offline play, and the ability to toggle premium/AI features via config/entitlements without redeploying.

---

## For Backend Engineers

### 1. Architecture Overview

**Runtime topology**:
1. **Next.js App Router** on Vercel serves UI, gameplay logic, and `/api/v1/*` route handlers. Server Actions provide direct access to Supabase using service-role keys confined to the server.
2. **Supabase** supplies Postgres (primary data store), Auth (adult/teacher accounts), Storage (topic configs, AI reports), Edge Functions (longer-running or scheduled jobs), and Realtime (broadcasts for entitlement changes).
3. **Stripe** handles all upgrades and AI credit packs. Webhooks terminate in a Next.js API route that validates signatures and updates entitlements/credit ledgers atomically.
4. **Segment** ingests analytics. A proxy endpoint in Next.js validates payloads before sending to Segment to avoid exposing API keys in the client.
5. **AI providers** (OpenAI/Bespoke) are invoked from Supabase Edge Functions or Vercel Cron Jobs so secrets never ship to the browser.

CI/CD: GitHub Actions runs lint/tests, Next.js build, and `supabase db diff/push`. Successful runs trigger Vercel deployments (Preview for PRs, Production on `main`) and apply Supabase migrations to the matched environment.

### 2. Core Services & Responsibilities

| Service | Responsibility | Notes |
| --- | --- | --- |
| **Next.js API Layer** | HTTP endpoints + Server Actions for accounts, profiles, sessions, metrics, entitlements, analytics, AI job orchestration | Shared Zod schemas across client/server; only server code uses Supabase service key. |
| **Supabase Postgres** | Source of truth for accounts, profiles, sessions, aggregates, entitlements, AI jobs, feature flags | Managed via Prisma or SQL migrations; PITR enabled; RLS isolates by `account_id`. |
| **Supabase Auth** | Adult/teacher authentication (magic links + optional password/passkeys) | Tokens validated via JWKS inside API routes; row-level policies check `auth.uid()`. |
| **Topic Config Service** | Supabase Storage bucket with JSON configs served through `/api/v1/topics` using ISR + cache tags | Metadata enriched with entitlement state before returning to client. |
| **Sync Orchestrator** | Next.js API route that ingests batched sessions/metrics, dedupes via ULIDs, and upserts using `INSERT ... ON CONFLICT` | Conflict detection leverages `updated_at` and a `conflict_log` table. |
| **Engagement Engine** | SQL views + scheduled Edge Function recomputing streaks/goals for synced users | Mirrors client logic for teacher dashboards and notifications. |
| **Monetization Service** | Stripe Checkout creation, Customer Portal links, webhook ingestion updating `entitlements` + `ai_credit_transactions` | Emits Supabase Realtime events and triggers Vercel `revalidateTag('entitlements')`. |
| **AI Task Runner** | Supabase Edge Function queues AI jobs, calls OpenAI, stores summaries in Storage, decrements credits atomically | Job lifecycle tracked in `ai_jobs` table with status + error metadata. |
| **Analytics Collector** | `/api/v1/events` validates payloads, strips PII, forwards to Segment | Failed batches persisted in `analytics_errors` for reprocessing. |

### 3. Data Storage & Schema

**Datastores**: Supabase Postgres (primary), Supabase Storage (configs + AI outputs), IndexedDB (local-first data + telemetry queue).

**Representative tables**:

1. `adult_accounts`
   - `id UUID PK`, `email UNIQUE`, `account_type (home|teacher)`, `region`, `marketing_opt_in`, `supabase_user_id` (fk → Auth users), `billing_customer_id` (Stripe), `created_at`.
   - Indexes: unique on `supabase_user_id`; partial index on `lower(email)`.

2. `linked_profiles`
   - `profile_id UUID PK`, `account_id FK`, `display_name`, `age_band`, `avatar_id`, `preferences JSONB`, `last_active_at`, `device_id`, `analytics_opt_out BOOL`.
   - RLS: `account_id = auth.uid()` for standard access; service role bypass for device bootstrap.

3. `game_sessions`
   - Columns per requirements (`topic_id`, `mode`, `questions_answered`, etc.), plus `ended_at`, `is_completed`, `was_abandoned`, `device_id`.
   - Index `(profile_id, started_at DESC)`; partial index on `(topic_id)` for dashboards.

4. `question_attempts`
   - `id UUID PK`, `session_id FK`, `topic_id`, `prompt`, `selected_answer`, `is_correct`, `response_time_ms`, `sequence`.
   - Partition monthly if volume demands; aggregated views support analytics.

5. `skill_metrics`
   - Composite PK `(profile_id, topic_id)` with aggregate columns (`questions_answered`, `correct_answers`, `best_score_timed60`, `best_accuracy`, `proficiency_band`, `trend_score`, `last_synced_at`).

6. `engagement_states`
   - `profile_id PK`, `current_streak`, `best_streak`, `daily_goal`, `weekly_goal`, `goal_progress`, `achievements_unlocked JSONB`.

7. `achievements` / `player_achievements`
   - Catalog table + junction table storing `unlocked_at`, `celebrated_at`.

8. `entitlements`
   - `account_id PK`, `core_plan_unlocked BOOL`, `premium_topics JSONB`, `ai_credits_remaining INT`, `last_purchase_id`, `token_version`, `updated_at`.

9. `ai_credit_transactions`
   - `id UUID PK`, `account_id FK`, `delta INT`, `reason`, `related_job_id`, `processed_at`.

10. `ai_jobs`
    - `id UUID PK`, `account_id`, `profile_id?`, `analysis_type`, `status (queued|running|complete|failed)`, `result_url`, `error`, `credits_spent`.

11. `sync_checkpoints`
    - PK `(account_id, device_id)` with `last_session_sync_at`, `last_metric_sync_at`, `conflict_log JSONB`.

12. `app_config`
    - Stores feature flags, experiment knobs, copy variations. Cached via ISR.

**Config assets**: Topic definitions + design tokens stored as JSON in Supabase Storage `config/topics`. Signed public URLs cached via Vercel CDN with tag-based revalidation.

**Local IndexedDB**: `profiles`, `topics`, `sessions`, `attempts`, `skillMetrics`, `engagement`, `entitlements`, `factPerformance`, `unsyncedChanges`, `telemetryQueue`. Dexie migrations keep schema backward compatible.

**Adaptive data flow**:
- Question attempts update `factPerformance` and recalculated `skillMetrics` locally.
- Sync payloads include compressed fact stats; server persists to `fact_performance` table for teacher analytics.
- Supabase Edge Function reconciles conflicts and returns canonical overrides when server detected divergence.

### 4. API Contract Specifications

**General**: JSON payloads, base path `/api/v1`. Authentication via `X-Device-Id` for anonymous flows and Supabase Auth JWT for adult/teacher actions. `Idempotency-Key` header required for mutation endpoints.

| Endpoint | Method | Auth | Purpose | Request | Response | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `/api/v1/accounts` | POST | None | Create adult account (magic link) | `{ email, accountType, region }` | `{ accountId, magicLinkSent }` | Uses Supabase Admin API; optional password creation later. |
| `/api/v1/accounts/login` | POST | None | Start password/magic login | `{ email, password? }` | `{ accessToken, refreshToken, expiresIn }` | Mirrors Supabase Auth flows. |
| `/api/v1/accounts/token/refresh` | POST | Refresh | `{ refreshToken }` | `{ accessToken, expiresIn }` | 401 on invalid token. |
| `/api/v1/profiles` | POST | Device or JWT | Link local profile to account | `{ profileId, displayName, ageBand, avatarId, deviceId }` | Profile DTO | Adult gate validated client-side before linking. |
| `/api/v1/profiles/{profileId}` | PATCH | JWT | Update profile prefs | Partial DTO | Updated profile | Requires adult token. |
| `/api/v1/topics` | GET | Optional | Fetch topic catalog + entitlement metadata | `?locale=en-US&platform=web` | `{ version, topics[], premiumSummary }` | Response cached with `revalidateTag('topics')`. |
| `/api/v1/sessions:sync` | POST | Device or JWT | Upload sessions + attempts | `{ profileId, deviceId, sessions[], attempts[] }` | `{ storedSessionIds[], conflicts[] }` | Deduped via `changeId`. |
| `/api/v1/metrics:sync` | POST | Device or JWT | Upsert metrics/streaks | `{ skillMetrics[], engagement }` | `{ status, overrides }` | Overrides include canonical data + conflict reasons. |
| `/api/v1/metrics/{profileId}` | GET | JWT | Fetch canonical metrics for dashboards | `?topicId` optional | `{ skillMetrics[], engagement, summaries }` | Teacher dashboards use teacher account scope. |
| `/api/v1/entitlements` | GET | JWT | Read entitlements + AI credits | None | `{ coreUnlocked, premiumTopics[], aiCreditsRemaining, tokenVersion }` | Response signed for offline caching. |
| `/api/v1/purchases/stripe/session` | POST | JWT | Create Stripe Checkout | `{ planType, successUrl, cancelUrl }` | `{ checkoutUrl }` | Metadata stores device + profile context. |
| `/api/v1/purchases/webhook` | POST | Stripe | Handle webhook | Stripe payload | `{ ok: true }` | Validates signature + idempotency. |
| `/api/v1/ai/analyses` | POST | JWT + entitlement | Start AI analysis | `{ profileId? , classId?, analysisType }` | `{ jobId, creditsRemaining }` | Triggers Edge Function job. |
| `/api/v1/ai/analyses/{jobId}` | GET | JWT | Poll job status | None | `{ status, resultUrl? }` | Result stored in Supabase Storage signed URL. |
| `/api/v1/events` | POST | Device or JWT | Upload analytics batch | `{ events[] }` | `{ accepted, rejected[] }` | Rejects invalid schemas + logs. |
| `/api/v1/config` | GET | Device | Fetch feature flags | None | `{ version, flags }` | Cached offline with TTL. |

Error envelope: `{ errorCode, message, retryable, details? }` with canonical codes `VALIDATION_ERROR`, `AUTH_REQUIRED`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `INTERNAL_ERROR`.

### 5. Sync & Offline Logic

- **Change capture**: Each mutation stored with ULID `changeId`, `entityType`, payload snapshot, and `deviceTimestamp` in IndexedDB.
- **Upload**: Sync endpoints accept ≤200 entities per request. Server dedupes by `changeId`, resolves conflicts via `updated_at`, and responds with canonical rows for reconciliation.
- **Download**: `metrics`, `topics`, and `config` endpoints include `version`/ETag for conditional fetching. New devices perform initial sync using keyset pagination by `profile_id`/`updated_at`.
- **Entitlements offline**: After Stripe webhook, server mints short-lived entitlement token (JWT) including `planType`, `premiumTopics`, `aiCredits`, `tokenVersion`. Client caches token to unlock content offline; revocation occurs by incrementing `tokenVersion` in Supabase.
- **Background sync**: Service worker schedules background sync when connectivity resumes; failsafe manual “Sync now” action surfaces in grown-ups area.

### 6. Monetization & AI Credit Model

- Core plan: one-time Stripe Checkout; entitlements table flips `core_plan_unlocked=true` and unlocks premium topics.
- AI credits: credit packs sold via Stripe (metadata `credit_pack_size`); ledger maintained in `ai_credit_transactions`. Each AI job consumes credits inside a transaction to prevent negative balances.
- Refunds/revocations: admin interface toggles entitlements and inserts compensating ledger entries. Supabase Realtime broadcast invalidates cached tokens.
- Stripe Customer Portal (optional) accessible via `/api/v1/purchases/portal-link` for teachers managing licenses.
- Native store support (App Store/Play) can be layered later; Stripe remains canonical.

### 7. Infrastructure & Operations

- **Environments**:
  - Vercel: Preview (per PR), `staging`, `production`.
  - Supabase: separate projects with matching schemas + secrets.
- **CI/CD**: GitHub Actions pipeline runs ESLint, Vitest/Jest, Playwright smoke tests, and `supabase db diff/push`. Successful pipeline triggers Vercel deployment via `vercel deploy --prebuilt`.
- **Monitoring**: Vercel Observability (Core Web Vitals, Edge logs), Supabase metrics (DB load, auth errors), Stripe webhook logs, Segment delivery metrics. Optional log drain to Logtail/Datadog for SIEM.
- **Config & Feature Flags**: Flags stored in `app_config` table and optionally LaunchDarkly for multi-variant experiments. `/api/v1/config` caches via ISR.
- **Backups & DR**: Supabase PITR enabled; nightly logical backups shipped to Supabase Storage (versioned). Storage bucket replication ensures topic + AI artifacts available cross-region. Target RTO 2h, RPO ≤5m.
- **Cron / Scheduled tasks**: Vercel Cron Jobs or Supabase Cron trigger Edge Functions for streak recompute, analytics rollups, AI job cleanup.

### 8. Analytics & Telemetry Architecture

- **Capture**: Client telemetry module batches events (≤50) into IndexedDB; flushes via `/api/v1/events` when online.
- **Schema**: `eventId ULID`, `eventType`, `timestamp`, `profileId`, `deviceId`, optional `accountId`, `context` object (topicId, mode, duration, experimentId). Adult account identifiers hashed client-side.
- **Opt-out**: `analyticsOptOut` per profile; events dropped locally + flagged in Supabase when disabled.
- **Server**: Next.js route validates events with Zod, strips PII, forwards to Segment HTTP API. Failed batches stored in `analytics_errors` with `retry_after` schedule.
- **Downstream**: Segment → Amplitude (engagement dashboards) + BigQuery/Snowflake for long-term storage. dbt jobs compute KPIs nightly.
- **Monitoring**: Alerts if rejection rate >2% within 5 minutes or Segment responses fail >20% for 3 minutes. Kill-switch flag disables telemetry if regulatory request arrives.

---

## For Frontend Engineers

### 1. Technology Stack

- **Framework**: Next.js 14 (App Router) with React 18 + TypeScript.
- **Routing**: App Router segments for `play`, `topics`, `progress`, `grown-ups`, `settings`, `duel`, `auth`. Use nested layouts to share profile context, grown-ups gate, and offline banners.
- **State Management**: Zustand for global state (profiles, entitlements, network status, feature flags); TanStack Query with persistence for Supabase-backed queries; local reducers for gameplay loop.
- **Persistence**: Dexie-managed IndexedDB `mathdash_v1` w/ stores mirroring backend schema.
- **PWA Shell**: Next.js PWA plugin + Workbox for offline caching, `backgroundSync` for telemetry + session uploads, manifest + icons from design tokens.
- **Styling**: Design system from `design-documentation/` with CSS Modules + tokens-as-CSS-variables. Framer Motion for micro-interactions with reduced-motion fallbacks.

### 2. Application Architecture

- `app/layout.tsx` loads feature flags + entitlements; gates gameplay until minimal data ready.
- Domain modules: `profiles`, `play`, `topics`, `progress`, `engagement`, `monetization`, `settings`, `sync`, `duel` (future).
- Container components handle data fetching via Suspense-friendly hooks; presentational components remain pure.
- Telemetry hook publishes key events (session start/complete, upgrade view, AI request) with minimal coupling.

### 3. Gameplay Engine Details

- `GameLoop` maintains rolling queue of next 3 questions to keep latency <50 ms.
- Timer uses `requestAnimationFrame` to avoid throttling; fallback to `setInterval` when page hidden.
- Input handler debounces taps, supports pointer + keyboard navigation; haptic feedback uses Web Vibration API when available.
- Pause/resume triggered by `visibilitychange`; session state persisted to IndexedDB for crash recovery.
- Adaptive mode references `factPerformance` store; RNG seeded per session for deterministic debugging.

### 4. Offline, Sync, and Error UX

- Network hook monitors `navigator.onLine` + periodic `/api/health` ping; surfaces offline banner.
- Background sync worker flushes sessions, metrics, and telemetry when network resumes; manual “Sync now” CTA accessible for adults.
- Conflict UI: toast summarizing overrides; grown-ups view can show diff modal when Supabase returns canonical metrics.
- Adult-only operations (delete profile, export data, purchases) always route through `AdultGate` component implementing local math challenge + optional PIN.

### 5. Accessibility & Internationalization

- Follow `design-documentation/accessibility/*` guidance (focus outlines, motion alternatives, color contrast ≥ 4.5:1 where text).
- Implement i18next with lazy-loaded namespaces; store locale preference per profile.
- Provide narration/voice-over toggle using Web Speech API when available; degrade gracefully.
- Ensure all tappable targets ≥48dp, include SR labels for icon-only controls, respect reduced motion + reduced data preferences.

### 6. Performance & Tooling

- Next.js code splitting via route segments; prefetch `play`/`topics` bundles post-shell load.
- Use React Profiler + Vercel Web Vitals to monitor hydration/interaction timings.
- Testing: Vitest + RTL for unit/UI; Playwright for E2E (offline/resume/purchase flows); Storybook for component QA with Chromatic.
- Tooling: ESLint (next/core-web-vitals), Stylelint, Prettier, Husky pre-commit hooks, Nx optional for monorepo ergonomics.

### 7. Dash Duel & Future Work

- Dash Duel uses CSS Grid to split screen; each pane hosts independent `GameLoop` with synchronized start messages via BroadcastChannel API for same-device multiplayer.
- Multi-touch support via Pointer Events; disable double-tap zoom; ensure input focus for external keyboards.
- Teacher features reuse grown-ups layout; surfaces class rosters and aggregated charts only when `accountType === 'teacher'` entitlement present.

### 8. Monetization & Adult Gate UX

- Locked content displays consistent badge + CTA reading from Zustand entitlements; `UpgradeGateModal` orchestrates adult challenge → plan explanation → CTA.
- Payment flow never begins until adult gate success; `/api/v1/purchases/stripe/session` call occurs inside modal with spinner + cancel fallback.
- Offline entitlement tokens stored encrypted in IndexedDB; invalid tokens trigger refresh once network available.
- AI credit packs share gating + CTA patterns; UI communicates optional nature and credit balance clearly.
- Error handling: friendly copy + telemetry for cancellations, rate limiting for repeated taps.

---

## For QA Engineers

### 1. Test Matrix by Feature

| Feature | Primary Tests | Edge Cases |
| --- | --- | --- |
| Core Gameplay | timed & untimed modes, pause/resume, summary stats | background mid-question, rapid taps, offline play → sync later |
| Topic Library | catalog filters, lock states, config versioning | missing asset fallback, entitlement mismatch |
| Game Modes | switching modes, defaults, summary labeling | rapid toggles, persisted preferences |
| Profiles & Avatars | create/edit/delete, avatar picker, adult gate | max profiles (8), duplicate names, gate bypass attempts |
| Progress Dashboard | radar, topic drill-down, empty states | >10k sessions, server override reconciliation |
| Adaptive Mode | weighting bias, insufficient data fallback | data reset mid-session, multi-profile interplay |
| Engagement Layer | streak/goal increment, notifications, achievements | timezone shifts, device clock tampering |
| Dash Duel | split play, simultaneous input, winner resolution | rotation, aspect ratio extremes |
| Accounts & Sync | login, link device, conflict resolution | partial uploads, revoked entitlements, concurrent sync |
| Monetization & Access Control | lock consistency, adult gate, checkout, offline entitlement | payment cancel, reinstall, offline token expiry |
| AI Credit Packs | credit debit, insufficient balance flow, result delivery | job timeout, cancellation |

### 2. Data Validation & Integrity

- Validate profile constraints (length, characters), question generation (one correct option, distractor logic), session integrity (questionsAnswered ≥ questionsCorrect), streak calculations over multi-week timelines.
- Ensure Supabase RLS prevents cross-account leakage by attempting unauthorized API calls during testing.

### 3. Performance & Load

- Client: TTI on Chromebook/Android tablet <3 s, interaction latency <50 ms.
- Backend: k6/Artillery tests hitting `/api/v1/sessions:sync` and `/api/v1/metrics` at ≥200 RPS with p95 <250 ms; observe Supabase pool health.
- Offline flood: queue 10k sessions locally, reconnect, verify ingestion + UI responsiveness.

### 4. Integration & Automation

- Unit/UI: Vitest + RTL; backend modules tested with Jest + Supertest hitting Next.js route handlers.
- Contract tests: ensure client models align with `/api/v1` schemas via generated Zod validators.
- E2E: Playwright covering first-run, upgrade, sync, AI job, offline/resume. Use MSW to stub Supabase/Stripe when necessary.
- Device coverage: Chrome/Edge desktop, Safari iPadOS, Android Chrome, ChromeOS. Include screen reader smoke tests (NVDA/VoiceOver).
- Test data: Supabase seed scripts + Dexie fixtures versioned in repo; `supabase db reset --linked` resets QA environment nightly via GitHub Action.

### 5. Observability & Test Data Management

- QA environment wired to Segment dev source + Stripe test keys. `?qaMode=true` enables debug overlays (network status, store snapshots, sync queue).
- Nightly cleanup resets Supabase dev project + Storage buckets to known state.
- Provide scripts to export/import local profile data for reproducible bug reports.

---

## For Security Analysts

### 1. Threat Model Summary

- **Assets**: child gameplay data (low sensitivity), adult PII (email, billing IDs), entitlement state, AI outputs.
- **Attack Surfaces**: Next.js APIs, Supabase Auth, Stripe webhooks, local IndexedDB, service worker cache, AI download links.
- **Adversaries**: curious children bypassing gates, malicious actors targeting Stripe/webhooks, MITM on public Wi-Fi, scrapers.

### 2. Authentication & Authorization

- Supabase Auth handles adult accounts (magic link + optional password/passkey). Access tokens 15 min, refresh 30 days. JWKS validation in middleware with caching.
- Device identity: UUID stored per installation, attached to anonymous API requests; rate limiting + anomaly detection rely on device + IP.
- Role enforcement: Next.js middleware + server actions require entitlements for teacher routes; Supabase RLS enforces `account_id` scoping server-side.
- Adult gate ensures irreversible operations still require Supabase JWT even if a child bypasses UI challenge.

### 3. Data Protection

- **In Transit**: HTTPS via Vercel edge + Supabase-managed TLS; HSTS, CSP, secure cookies, SameSite enforced.
- **At Rest**: Supabase Postgres + Storage encrypted; sensitive columns (profile names) optionally encrypted using pgcrypto. IndexedDB values obfuscated using AES-GCM with device secret.
- **Secrets**: Stored in Vercel + Supabase secret managers; service role key never exposed client-side.
- **Deletion**: `/api/v1/accounts/delete` triggers background job removing Supabase rows + Storage assets; confirms via email. Local delete wipes IndexedDB immediately.

### 4. Compliance & Privacy

- COPPA/GDPR-K: no child emails collected, adult consent required for sync. Privacy notice accessible from grown-ups area.
- Data exports: adult can request JSON export via `/api/v1/accounts/export` (future) fulfilled within 30 days.
- Retention: gameplay data retained until deletion request; analytics stored aggregated without PII.
- AI outputs scrubbed for child names; use profile nicknames only.

### 5. Security Controls & Monitoring

- **Rate Limiting**: Upstash Redis or Supabase Ratelimit (pg_net) enforce 100 req/min anon, 500 req/min authenticated. Stripe webhooks validated + replay-protected via `Idempotency-Key` + event IDs.
- **Input Validation**: Shared Zod schemas sanitize payloads; parameterized queries prevent SQL injection.
- **CSP / Headers**: `default-src 'self'`, `script-src 'self' vercel-insights.com`, `img-src 'self' data: supabase.co`, etc.; `Permissions-Policy` restricts sensors.
- **Dependency Hygiene**: Dependabot PRs, `pnpm audit --prod`, Snyk (optional) in CI.
- **Logging**: Supabase audit logs, Vercel log drains, Stripe webhook logs aggregated in Logtail/Datadog; anomaly alerts for failed logins, AI job failures, webhook retries.
- **Incident Response**: Runbooks for payment webhook compromise, Supabase credential leak, AI misuse; retain detailed logs 14 days, aggregated 90 days.

---

## Next Steps

1. Confirm Vercel + Supabase environment structure, secrets, and access controls with DevOps.
2. Break this blueprint into sprint-sized stories (client gameplay, Supabase schema, sync APIs, entitlements, analytics, AI plumbing).
3. Stand up reference implementation: Next.js shell on Vercel Preview + Supabase local project + Stripe test mode to validate end-to-end flows before scaling.
