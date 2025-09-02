# Repository Guidelines

## Project Structure & Module Organization
- Root: `web/` (Vite + React + TypeScript app). `timer-prd.md` contains product notes. Build output lives in `web/dist/`.
- `web/src/pages/`: Route-level components (`HomeEditor.tsx`, `Player.tsx`).
- `web/src/state/`: App state with Zustand (`config.ts`).
- `web/src/utils/`: Logic helpers (`color.ts`, `sound.ts`).
- `web/src/hooks/`: Reusable hooks (`useGoogleFont.ts`).
- `web/src/types/`: Type declarations (`luxon.d.ts`).
- Assets and static files: `web/src/assets/`, `web/public/`.

## Build, Test, and Development Commands
Run all commands from `web/`:
- `npm install`: Install dependencies.
- `npm run dev`: Start Vite dev server (default http://localhost:5173).
- `npm run build`: Type-check and build (`tsc -b && vite build`) to `dist/`.
- `npm run preview`: Serve the production build locally.
- `npm run lint`: Lint source with ESLint.
- `npm test`: Run Vitest in CI mode.
- `npm run test:watch`: Run tests in watch mode.
- `npm run test:coverage`: Generate coverage report (text, HTML, LCOV).

## Coding Style & Naming Conventions
- Language: TypeScript + React function components.
- Indentation: 2 spaces. Prefer explicit types on public APIs; avoid `any`.
- Files: Components PascalCase (`Player.tsx`), hooks start with `use` (`useGoogleFont.ts`), utilities lowercase (`color.ts`).
- Styling: Tailwind CSS. Reuse theme tokens (see `tailwind.config.js`, e.g., `text-brand`). Keep class lists readable and grouped by layout/spacing/typography.
- Linting: ESLint config in `web/eslint.config.js` (React hooks rules enabled). Fix issues before pushing.

## Testing Guidelines
- Frameworks: Vitest + React Testing Library (`jsdom` env).
- Location: `web/src/__tests__/` or colocated `*.test.ts(x)` (e.g., `Player.test.tsx`).
- Setup: global matchers loaded via `src/test/setup.ts`.
- Target: pure utilities (`utils/`) and critical page behaviors.

## Commit & Pull Request Guidelines
- Commits: concise, imperative mood (e.g., "Add progress bar animation"). Group related changes.
- PRs: include a clear description, linked issues, screenshots/GIFs for UI, and steps to verify. Keep scope focused and update docs if behavior/config changes.

## Security & Configuration Tips
- No secrets required for local dev. Avoid committing build output or credentials.
- External fonts may be fetched; review CSP if deploying. Adjust build and theming via `vite.config.ts` and `tailwind.config.js`.
