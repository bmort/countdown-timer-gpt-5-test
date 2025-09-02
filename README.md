# Countdown Timer

Monorepo-style layout with the Vite + React + TypeScript app in `web/`. This root README orients contributors and points to app docs.

## Quick Start
- Change into the app folder: `cd web`
- Install deps: `npm install`
- Start dev server: `npm run dev` (http://localhost:5173)
- Build: `npm run build` → outputs to `web/dist/`
- Preview production build: `npm run preview`
- Tests: `npm test` or `npm run test:watch`

## Repo Layout
- `web/`: Application source (Vite + React + TS). See `web/README.md` for details.
- `timer-prd.md`: Product notes and roadmap.
- `.gitignore`: Root ignore for OS/editor files; see also `web/.gitignore`.

## Conventions
- TypeScript + React function components
- Tailwind CSS for styling
- State via Zustand (`web/src/state/`)
- Tests via Vitest + Testing Library (`web/src/__tests__/`)

## Notes
- Run all CLI commands from `web/` unless otherwise noted.
- No secrets required for local dev. Review CSP before deploying if fetching external fonts.
