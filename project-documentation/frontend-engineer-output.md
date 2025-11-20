# Math Dash – Frontend Engineering Specification

## 1. Executive Summary

This document defines the frontend implementation strategy for **Math Dash**, a high-performance, offline-first educational web application. The architecture prioritizes **low-latency gameplay (<50ms)**, **robust offline capabilities**, and a **strict separation of concerns** between the child-focused "Play" experience and the adult-focused "Management" dashboards.

We will utilize **Next.js 14 (App Router)** as the framework, leveraging **React Server Components (RSC)** for initial shell rendering and **Client Components** for the interactive gameplay engine. State management will be hybrid: **Zustand** for global app state, **TanStack Query** for server synchronization, and **Dexie.js** for local-first persistence.

---

## 2. Technology Stack & Tooling

> **Note:** For specific version details, import patterns, and code snippets (especially for Motion and React 19), please refer to `project-documentation/tech-stack-reference.md`.

| Category | Technology | Justification |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14 (App Router)** | Server Actions for secure mutations, nested layouts for distinct "Play" vs "Admin" modes, and robust PWA support. |
| **Language** | **TypeScript 5.x** | Strict type safety for complex game logic and shared Zod schemas with the backend. |
| **Styling** | **CSS Modules + CSS Variables** | Scoped styling prevents leakage; CSS Variables drive the dynamic theming (Design Tokens) without runtime overhead. |
| **State (Global)** | **Zustand** | Lightweight, unopinionated store for UI state (modals, user preferences) and game session coordination. |
| **State (Server)** | **TanStack Query v5** | Manages async data, caching, and background synchronization with Supabase. |
| **Persistence** | **Dexie.js (IndexedDB)** | Type-safe wrapper for IndexedDB, essential for storing offline profiles, sessions, and telemetry. |
| **Animation** | **Motion (formerly Framer Motion)** | Declarative animations for complex UI transitions and game feedback (success/failure states). |
| **Testing** | **Vitest + React Testing Library** | Fast unit/component testing. |
| **E2E Testing** | **Playwright** | Critical for testing offline flows, service workers, and cross-browser gameplay. |
| **Linting** | **ESLint + Prettier** | Enforcing code quality and consistent formatting. |

---

## 3. Project Structure

We will adopt a **feature-based** folder structure within the `app` directory, supported by a robust `lib` and `components` architecture.

```
/src
  /app                    # Next.js App Router
    /(marketing)          # Marketing pages (landing, about)
    /(app)                # Main application shell
      /play               # Gameplay routes
      /dashboard          # Progress & Stats
      /settings           # User settings
      /grown-ups          # Adult/Teacher area (Protected)
    /api                  # Route Handlers (Proxy to Supabase/Stripe)
    layout.tsx            # Root Layout (Providers: Query, Theme, Auth)
    global.css            # Global styles & CSS Variables (Tokens)

  /components
    /ui                   # Atomic Design System Components (Buttons, Cards, Inputs)
    /game                 # Gameplay specific components (Timer, Keypad, Feedback)
    /layout               # Structural components (Headers, Nav, Shells)
    /features             # Feature-specific complex components
      /auth               # Login/Signup forms
      /onboarding         # Wizard flows
      /analytics          # Charts & Graphs

  /lib
    /db                   # Dexie database schema & configuration
    /supabase             # Supabase client & server utilities
    /stores               # Zustand stores (useUserStore, useGameStore)
    /hooks                # Custom React hooks (useNetwork, useSync)
    /utils                # Helper functions (math, formatting, validation)
    /constants            # Static config (routes, limits, defaults)

  /styles
    /tokens               # Design token definitions
    /mixins               # Shared CSS mixins

  /types                  # Global TypeScript definitions
```

---

## 4. Component Architecture & Design System

### 4.1 Design Token Implementation
We will transform `design-tokens.json` into a global CSS variable file (`src/app/global.css`) during the build process or via a utility script.

**Example:**
```css
:root {
  /* Colors */
  --color-primary-500: #3056D3;
  --color-secondary-500: #1FB8A6;
  
  /* Spacing */
  --space-md: 16px;
  
  /* Typography */
  --font-heading: 'Nunito', sans-serif;
}
```

### 4.2 Atomic Components (`/components/ui`)
These are "dumb" components that rely solely on props and CSS variables. They must be accessible and theme-aware.
*   `Button`: Variants (Primary, Secondary, Ghost), Sizes (Sm, Md, Lg).
*   `Card`: Container with standardized padding and elevation.
*   `Input`: Accessible form fields with error states.
*   `Modal`: Accessible dialog overlay (Radix UI primitives recommended).

### 4.3 Game Components (`/components/game`)
Optimized for performance and touch interaction.
*   `GameCanvas`: The main play area.
*   `Numpad`: Large touch targets for rapid input.
*   `TimerBar`: Visual countdown using `requestAnimationFrame`.
*   `FeedbackFlash`: Immediate visual response (Green/Red overlay).

---

## 5. Data Layer & Offline Strategy

### 5.1 The "Local-First" Principle
The application treats **IndexedDB (via Dexie)** as the single source of truth for the active session.
1.  **Read:** UI reads from Dexie (using `useLiveQuery`).
2.  **Write:** User actions write to Dexie immediately.
3.  **Sync:** A background process (Service Worker or Hook) pushes changes from Dexie to Supabase when online.

### 5.2 Sync Architecture
*   **Change Tracking:** Every local mutation (Session Complete, Profile Update) creates a `SyncQueue` entry in Dexie.
*   **Batch Upload:** `useSync` hook monitors network status. When online, it batches `SyncQueue` items and sends them to `/api/v1/sync`.
*   **Conflict Resolution:** Server wins. If the server rejects a change, the local state is updated to match the server's canonical state.

### 5.3 State Management Split
*   **Zustand (`useGameStore`)**:
    *   Current Question
    *   Score / Streak
    *   Timer Status (Running/Paused)
    *   Input Buffer
*   **TanStack Query**:
    *   Fetching "Read-Only" data from server (Leaderboards, Class Rosters).
    *   Managing the "Sync" mutation status.
*   **Dexie**:
    *   Persisting Profiles, Session History, and Settings.

---

## 6. Routing & Navigation Strategy

### 6.1 Route Groups
We use Route Groups `(group)` to apply different layouts without affecting the URL structure.
*   **(app)/play**: Minimalist layout. No heavy nav bars. Focus on the game.
*   **(app)/grown-ups**: Admin layout. Sidebar navigation, denser information density.

### 6.2 The "Adult Gate"
Routes under `/grown-ups` and sensitive actions (Delete Profile) will be protected by an `AdultGate` component.
*   **Mechanism:** Intercept navigation -> Show Modal -> Challenge (e.g., "What is 12 x 11?") -> On Success, allow navigation.
*   **Persistence:** "Adult Mode" session persists for X minutes in Zustand.

---

## 7. Performance & Optimization

### 7.1 Core Web Vitals Targets
*   **LCP (Largest Contentful Paint):** < 2.5s (Optimized asset loading).
*   **FID (First Input Delay):** < 100ms (Hydration prioritization).
*   **CLS (Cumulative Layout Shift):** 0 (Fixed aspect ratios for game containers).

### 7.2 Game Loop Optimization
*   **No React Render on Timer:** The visual timer bar should use CSS transitions or direct DOM manipulation via refs to avoid re-rendering the entire React tree every frame.
*   **Input Latency:** Touch events (`touchstart`) will be bound with `passive: false` to prevent scrolling delay. Audio feedback (Web Audio API) will be preloaded.

---

## 8. Security & Compliance

*   **COPPA/GDPR-K:** No PII collected for child profiles. All child data is associated with a random UUID or the Parent's Account ID.
*   **Content Security Policy (CSP):** Strict CSP headers to prevent XSS.
*   **Sanitization:** All user input (Profile Names) sanitized via Zod before storage/transmission.

---

## 9. Implementation Roadmap (Frontend)

### Phase 1: Foundation (Sprint 1-2)
- [x] Initialize Next.js 14 project with TypeScript.
- [x] Configure CSS Modules & Design Tokens.
- [x] Set up Dexie.js schema.
- [x] Implement "Play" layout and "Grown-ups" layout.

### Phase 2: Core Gameplay (Sprint 3-4)
- [x] Build Game Loop (Question Generator -> Input -> Feedback).
- [x] Implement `GameStore` (Zustand).
- [x] Create Result Screen & Local History.

### Phase 3: Profiles & Progress (Sprint 5)
- [x] Profile Creator & Switcher.
- [x] Skill Radar Chart (Recharts or Visx).
- [x] Dashboard UI.

### Phase 4: Sync & Monetization (Sprint 6+)
- [x] Implement `SyncQueue` and Background Sync.
- [x] Integrate Stripe Checkout flow.
- [x] Implement Adult Gate.

### Phase 5: Adaptive Practice & Engagement (Sprint 7-8)
- [x] **Adaptive "Smart Mode"**: Implement `MasteryTracker` and weighted `QuestionGenerator`.
- [x] **Engagement Layer**: Implement Streaks, Daily Goals, and Achievements system.
- [x] **Data Wiring**: Connect Dashboard/Skill Radar to real `db.mastery` and `db.sessions` data.

### Phase 6: Multiplayer "Dash Duel" (Sprint 9)
- [x] **Split Screen UI**: Implement 2-player local layout.
- [x] **Duel Game Loop**: Parallel state management for two players.
- [x] **Handicap System**: Allow different difficulty levels per player.

### Phase 7: Polish & Launch Prep (Sprint 10)
- [x] **Sound & Haptics**: Integrate `useSound` and `navigator.vibrate`.
- [x] **PWA Assets**: Manifest, icons, and offline service worker tuning.
- [x] **Accessibility Audit**: Keyboard navigation and screen reader verification.
- [x] **Performance Tuning**: Bundle analysis and LCP optimization.

