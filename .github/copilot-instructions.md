# Ready Steady Math - AI Coding Instructions

> **Note:** Ready Steady Math was previously referred to as 'Math Dash' in earlier internal drafts.

## Project Context
Ready Steady Math is a **local-first, offline-capable PWA** for math practice, built with **Next.js 16** and **React 19**. It focuses on speed, accessibility, and engagement.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand (`src/lib/stores`)
- **Database**: Dexie.js (IndexedDB wrapper) for local-first data (`src/lib/db`)
- **Styling**: CSS Modules (`*.module.css`) + CSS Variables (`globals.css`)
- **Animation**: Motion (Framer Motion)
- **Testing**: Vitest + React Testing Library

## Architecture & Patterns

### Directory Structure
- `src/app`: Next.js App Router pages and layouts.
- `src/components/features`: Feature-specific components (auth, profiles, etc.).
- `src/components/game`: Core gameplay components.
- `src/lib/db`: Dexie database schema and instance.
- `src/lib/stores`: Zustand stores for global state (Game, User, UI).
- `src/lib/sync`: Synchronization logic for cloud backup.

### Data Flow (Local-First)
1.  **Read/Write**: All user data (profiles, scores, history) is written to **Dexie (IndexedDB)** first.
2.  **State**: UI components subscribe to **Zustand** stores or use `useLiveQuery` from Dexie.
3.  **Sync**: Background processes (`src/lib/sync`) handle cloud synchronization (if applicable).
4.  **Pattern**: Prefer `db.table.add()` or `db.table.put()` for data mutations.

### Styling
- **Method**: Use **CSS Modules** (`*.module.css`) for all component-level styling.
- **Variables**: Use CSS variables defined in `src/app/globals.css` for colors, spacing, and typography (e.g., `var(--color-primary-500)`).
- **Strict Rule**: **DO NOT use Tailwind CSS**. Tailwind is not configured in this project. Remove any Tailwind classes if found and replace with CSS Modules.
- **Example**:
  ```tsx
  import styles from './MyComponent.module.css';
  return <div className={styles.container}>...</div>;
  ```


### State Management (Zustand)
- Create separate stores for distinct domains (e.g., `useGameStore`, `useUserStore`).
- Keep stores focused on UI state and transient session data.
- Persist long-term data in Dexie, not just in Zustand.

## Testing
- **Runner**: Vitest
- **Command**: `npx vitest` (or add `"test": "vitest"` to package.json)
- **Location**: `src/tests` or co-located `__tests__`.
- **Philosophy**: Test critical user flows and game logic (scoring, timing).

## Critical Workflows
- **Dev Server**: `npm run dev`
- **Database Changes**: When modifying `src/lib/db/index.ts`, increment the version number and define the schema upgrade path.
- **PWA**: The app uses `next-pwa`. Ensure service worker logic in `public/sw.js` is respected.
