# Countdown Timer

![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=061A2A)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?logo=tailwindcss&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-2.0-6E9F18?logo=vitest&logoColor=white)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

Monorepo-style layout with the Vite + React + TypeScript app in `web/`. This root README orients contributors and points to app docs.

## Demo
Short GIF preview of the timer UI. Place a file at `web/public/demo.gif` to render below (served at `/demo.gif` in dev):

![Countdown Timer demo](web/public/demo.gif)

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
