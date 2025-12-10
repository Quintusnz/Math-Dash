# Repository Guidelines

## Project Structure & Modules
- `src/app`: Next.js 16 App Router pages, layouts, and API routes.
- `src/components`: UI and gameplay components (`features`, `game`, `ui`).
- `src/lib`: Shared logic (game engine, stores, Dexie DB, sync, hooks).
- `src/tests`: Unit/integration tests (Vitest + Testing Library).
- `tests/e2e`, `tests/perf`: Playwright end-to-end and performance tests.
- `Docs`, `design-documentation`, `project-documentation`: Product, design, and architecture references.

## Build, Test, and Development
- `npm run dev`: Start the development server on `http://localhost:3000`.
- `npm run build`: Production build (required for CI and deploys).
- `npm run start`: Run the built app locally.
- `npm run lint`: Run ESLint with Next.js core-web-vitals rules.
- `npx vitest`: Run unit/integration tests in `src/tests`.
- `npm run test:e2e`: Run Playwright E2E suite (ensure dev server is running).

## Coding Style & Naming
- Language: TypeScript with `strict` mode; prefer explicit types over `any`.
- Components: React function components, `PascalCase` filenames (e.g., `PauseModal.tsx`).
- Hooks: `useCamelCase` naming (e.g., `useGameSound.ts`).
- Styling: CSS Modules (`*.module.css`) only; use tokens from `src/app/globals.css`. Do **not** introduce Tailwind.
- Keep Dexie schemas, Zustand stores, and sync utilities under their existing folders.

## Testing Guidelines
- Place tests in `src/tests` or beside the code as `*.test.ts[x]`.
- Use Vitest + React Testing Library for component and game-logic tests.
- Prefer fast, deterministic tests that cover curriculum logic, scoring, timing, and accessibility.

## Commit & PR Guidelines
- Write clear, concise commit messages in the imperative (e.g., `feat: add quick-play analytics` or `Fix pause modal focus trap`).
- For PRs, include: short summary, key implementation notes, and links to relevant docs in `Docs/` or acceptance criteria when applicable.
- List how you validated changes (commands run, screenshots for UI changes, and any E2E runs).
 - When work relates to a Linear issue, include the Linear issue ID in the commit message or PR title (e.g., `NEX-123: refine curriculum tracker analytics`).

## Project Management
- We use Linear for project and issue tracking, integrated via Linear MCP.
- Current focus project: **Curriculum Alignment & Progress Tracking**.
- Keep Linear issues up to date, link relevant PRs, and mark issues as completed once the implementation and tests are done.

## AI & Automation Notes
- AI contributors should also follow `.github/copilot-instructions.md` and `.github/agents/*` for deeper architecture and workflow context.
