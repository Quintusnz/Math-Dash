# Math Dash – API Integration & Data Schema Guide

This document defines the data contracts between the Frontend (Next.js Client) and the Backend (Next.js API / Supabase). We use **Zod** for runtime validation and TypeScript type inference.

## 1. Shared Schemas (`src/lib/schemas`)

These schemas should be shared between client and server to ensure consistency.

### 1.1 Profile Schema
```typescript
import { z } from 'zod';

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid().optional(), // Optional for local-only profiles
  displayName: z.string().min(1).max(20),
  ageBand: z.enum(['5-6', '7-8', '9-10', '11+']),
  avatarId: z.string(),
  preferences: z.object({
    theme: z.enum(['default', 'high-contrast']).default('default'),
    soundEnabled: z.boolean().default(true),
    hapticsEnabled: z.boolean().default(true),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Profile = z.infer<typeof ProfileSchema>;
```

### 1.2 Game Session Schema
```typescript
export const GameSessionSchema = z.object({
  id: z.string().uuid(), // ULID in practice
  profileId: z.string().uuid(),
  topicId: z.string(),
  mode: z.enum(['timed_60', 'timed_120', 'practice', 'sudden_death']),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().nullable(),
  score: z.number().int().min(0),
  questionsAnswered: z.number().int().min(0),
  questionsCorrect: z.number().int().min(0),
  isCompleted: z.boolean(),
  deviceInfo: z.object({
    deviceId: z.string(),
    platform: z.string(),
  }),
});

export type GameSession = z.infer<typeof GameSessionSchema>;
```

### 1.3 Question Attempt Schema (Telemetry)
```typescript
export const QuestionAttemptSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string(),
  prompt: z.string(),
  selectedAnswer: z.string(),
  correctAnswer: z.string(),
  isCorrect: z.boolean(),
  responseTimeMs: z.number().int().min(0),
  timestamp: z.string().datetime(),
});
```

### 1.4 Sync Payload Schema
```typescript
export const SyncPayloadSchema = z.object({
  deviceId: z.string(),
  sessions: z.array(GameSessionSchema),
  attempts: z.array(QuestionAttemptSchema),
  metrics: z.array(z.any()), // Define MetricSchema separately
});
```

---

## 2. API Endpoints & Hooks

We use **TanStack Query** hooks to wrap these API calls.

### 2.1 Sync Hook (`useSync`)
*   **Endpoint:** `POST /api/v1/sessions:sync`
*   **Trigger:**
    *   `navigator.onLine` becomes `true`.
    *   `GameSession` completes.
    *   Manual "Sync Now" button.
*   **Behavior:**
    1.  Read `unsynced_sessions` from Dexie.
    2.  If empty, return.
    3.  POST to endpoint.
    4.  On 200 OK, delete from `unsynced_sessions` and move to `history`.

### 2.2 Entitlements Hook (`useEntitlements`)
*   **Endpoint:** `GET /api/v1/entitlements`
*   **Cache Time:** 1 hour (Stale-while-revalidate).
*   **Storage:** Persisted to Dexie `entitlements` store for offline access.
*   **Response:**
    ```typescript
    {
      coreUnlocked: boolean;
      premiumTopics: string[];
      aiCredits: number;
      signature: string; // For offline verification
    }
    ```

### 2.3 Leaderboard Hook (`useLeaderboard`)
*   **Endpoint:** `GET /api/v1/metrics/leaderboard`
*   **Params:** `?topicId=...&scope=global|class`
*   **Behavior:** Returns cached data. Disabled when offline.

---

## 3. Error Handling Strategy

All API clients must handle the following standard error codes:

| Status | Code | Action |
| :--- | :--- | :--- |
| **401** | `AUTH_REQUIRED` | Redirect to Login / Show Adult Gate. |
| **402** | `PAYMENT_REQUIRED` | Show Upgrade Modal. |
| **409** | `CONFLICT` | Server data wins; trigger re-fetch of canonical state. |
| **429** | `RATE_LIMITED` | Exponential backoff. |
| **503** | `MAINTENANCE` | Show "Server Maintenance" toast; continue in Offline Mode. |

---

## 4. Mocking for Development

To enable frontend development without a full backend:
1.  **MSW (Mock Service Worker):** Intercepts network requests and returns dummy data based on the Zod schemas.
2.  **Seed Data:** A script to populate Dexie with sample profiles and sessions.

