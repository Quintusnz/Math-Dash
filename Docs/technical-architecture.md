# Math Dash – Technical Architecture (High‑Level)

## 1. Overview

Math Dash is a web‑first application with:

- A rich client (browser‑based, potentially wrapped for app stores).
- Local‑first storage of gameplay and progress.
- Optional backend services for:
  - Account sync (adult/teacher).
  - Analytics.
  - Payment integrations.
  - AI‑powered features (post‑MVP).

### 1.1 Platform Decisions (Confirmed)

- **Frontend runtime**: Next.js 14 (App Router) with React 18 + TypeScript, deployed on **Vercel** (Preview/Staging/Prod environments).
- **Backend platform**: **Supabase** (Postgres, Auth, Storage, Edge Functions, Realtime). Next.js Route Handlers + Server Actions communicate directly with Supabase using service-role keys that remain server-side.
- **Payments**: **Stripe** (Checkout + Billing Portal + Webhooks) for the one-time core unlock and optional AI credit packs. App Store / Play Billing remain optional future wrappers but Stripe is canonical.
- **Analytics**: Segment for downstream fan-out (Amplitude, warehouse). Events proxied through Next.js API to avoid exposing keys.
- **Infrastructure management**: GitHub Actions for CI/CD (lint/test/build, Supabase migrations, Vercel deploy). Supabase PITR + Storage versioning provide backups/DR.

## 2. Client Architecture

### 2.1 Stack (Aligned with Platform Decisions)

- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript; deployed on Vercel with streaming SSR where helpful. Zustand + TanStack Query manage shared state; Dexie persists IndexedDB data.
- **Backend integration**: Next.js Route Handlers / Server Actions calling Supabase (Postgres, Auth, Storage) via official JS client. Supabase Edge Functions handle heavier async work (AI jobs, batch recalcs).
- **Storage**:
  - Local: IndexedDB (profiles, sessions, metrics, telemetry queues).
  - Cloud: Supabase Postgres (accounts, sessions, metrics, entitlements) + Supabase Storage (topic configs, AI reports).
- **Payments**: Stripe Checkout sessions triggered from Next.js API, webhook handler updates Supabase entitlements + AI credit ledgers.

### 2.2 Application Layers

- **UI Layer**
  - Screens and components for child play, topics, progress, grown‑ups.
- **Domain Layer**
  - Entities from `requirements2.md` (PlayerProfile, Topic, GameSession, etc.).
  - Services for question generation, scoring, proficiency calculation, adaptivity.
- **Infrastructure Layer**
  - Local persistence (serialization / deserialization).
  - Network clients (analytics, sync, payments).

---

## 3. Data Model (Summary)

See `requirements2.md` Section 2 for detailed fields.

Key entities:

- `PlayerProfile`
- `Topic`
- `SkillMetric`
- `GameSession`
- `QuestionAttempt`
- `Achievement`
- `PlayerAchievement`
- Post‑MVP: `AdultAccount`, `Class`.

Relationships:

- One `PlayerProfile` → many `GameSession`s, `SkillMetric`s, `PlayerAchievement`s.
- One `Topic` → many `GameSession`s via `topicId`.

---

## 4. Offline‑First Design

- All free single‑player gameplay (including premium‑locked content in trials) runs fully offline.
- Core gameplay does not depend on network:
  - Question generation is deterministic and local.
  - Session logging occurs locally; sync is a background concern.

Sync strategy (post‑MVP for accounts):

- Store changes in local append‑only logs.
- When online:
  - Push unsynced sessions/metrics with timestamps.
  - Pull server updates and merge (conflict‑aware).
- Prefer additive merges; avoid destructive overwrites without explicit user action.

---

## 5. Analytics & Telemetry

- Event logging controlled by:
  - Analytics service client in the client app.
  - Configurable opt‑out via adult settings.

Sample events:

- App open/close.
- Profile created/deleted.
- Session started/completed/abandoned.
- Upgrade modal shown / upgrade started / upgrade completed.
- AI actions invoked and completed (post‑MVP).

PII minimization:

- Pseudonymous IDs, child names only as provided.
- No child email/surname required.

---

### 6. Monetization Architecture

- **Core Upgrade (One‑Time Purchase)**
  - Entitlements stored locally (signed tokens) and server-side in Supabase `entitlements` table.
  - Browser payments run through Stripe Checkout sessions created by Next.js API routes; Stripe webhooks (verified) update Supabase and broadcast entitlement changes.
  - Native wrappers (App Store / Play Billing) remain optional future wrappers; Stripe is canonical per platform decision.

- **AI Credit Packs (Post‑MVP)**
  - Per-adult account `ai_credit_transactions` ledger in Supabase with balances enforced by database transactions.
  - Each AI action (Edge Function) decrements credits atomically; results stored in Supabase Storage with signed URLs.
  - Strict adult gating and separation from child flows, matching Stripe requirements.

---

## 7. Security & Privacy

- All network traffic over HTTPS (Vercel edge + Supabase-managed TLS). HSTS + CSP enforced in Next.js middleware.
- Authentication handled by Supabase Auth (magic link + optional password/passkey). Tokens validated in server routes; Row-Level Security protects data even if tokens leak.
- Minimal PII: no required child surname or email; adult email stored hashed + unique for login.
- Per-profile / per-account deletion paths:
  - Local profile delete wipes IndexedDB.
  - Server-side account delete (Next.js API + Supabase jobs) removes Postgres rows + Storage artifacts within defined SLA.

---

## 8. Performance Targets

- Initial load ≤ 3 seconds on mid‑range mobile over 4G.
- Tap‑to‑feedback latency < 50 ms.
- Question‑to‑question transitions ≤ 500 ms.
- Cap memory usage to run smoothly on low‑spec Chromebooks and tablets.

---

## 9. Extensibility Considerations

- Topics and categories are data‑driven (config files or backend‑driven).
- New topics added post‑MVP inherit same freemium structure unless overridden.
- Adaptive logic is modular and replaceable:
  - Phase one: heuristics.
  - Future: AI/ML models subject to compute cost and policy.
