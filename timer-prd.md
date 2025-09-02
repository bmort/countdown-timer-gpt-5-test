# Countdown Timer Website — Product Requirements Document (PRD)

## 1) Summary

A modern, shareable countdown timer web app that supports counting down either to a specific date/time or a specified number of minutes. The timer supports full‑screen display, rich styling controls (fonts, sizes, colors), and a share‑by‑URL preset for easy embedding in meetings and docs. Built with a modern JS framework and modern CSS.

---

## 2) Goals & Non‑Goals

**Goals**

* Provide an easy, reliable countdown to a target instant (absolute date/time) or a duration (e.g., 15 minutes).
* Full‑screen display suitable for presentations/meetings.
* On‑page controls for typography, color scheme, and layout density.
* One‑click URL sharing that encodes the timer configuration for deep‑linking and embedding.
* Modern visual style with strong, legible typography that “pops.”

**Non‑Goals (initial release)**

* Multi‑timer dashboards.
* Server‑side accounts, sign‑in, or saved presets in the cloud (beyond URL presets).
* Mobile native app (PWA support optional/stretch).
* Audio libraries beyond a small set of built‑in alert sounds.

---

## 3) Users & Use Cases

**Primary users**: Facilitators, presenters, teachers, meeting hosts, streamers.

**Key use cases**

1. Presenter sets a 10‑minute break timer and shares it on screen, full‑screen.
2. Teacher schedules a countdown to a fixed class end time (e.g., 15:30 local).
3. Meeting host shares a preset timer URL in a calendar invite and embeds it in a meeting agenda doc.
4. Streamer embeds an iframe preset with custom brand colors and font.

---

## 4) Core User Stories & Acceptance Criteria

**US‑1: Countdown by duration**

* As a user, I can start a timer for N minutes/seconds so I can time a break or activity.
* **Acceptance**: Given a duration (e.g., 15:00), when I press Start, the timer decrements to 00:00 with accurate pacing (≤ 50ms drift/minute under active tab conditions).

**US‑2: Countdown to date/time**

* As a user, I can pick a target date/time (with timezone awareness) so the timer reaches zero at that wall‑clock instant.
* **Acceptance**: When I set a target timestamp (e.g., 2025‑12‑31T23:59:59) and press Start, the remaining time updates continuously and reaches 00:00 at the correct instant in the chosen timezone.

**US‑3: Full‑screen mode**

* As a presenter, I can toggle full‑screen to show a clean, distraction‑free timer.
* **Acceptance**: Full‑screen fills the display; controls auto‑hide (with a small hover/keyboard reveal). Escape or a control exits full‑screen.

**US‑4: Styling controls**

* As a user, I can change font family, weight, font size scale, foreground/background colors, and accent color.
* **Acceptance**: Styling changes apply immediately and persist in the sharable URL. WCAG contrast warnings are shown when contrast < 4.5:1.

**US‑5: Share as URL / Embed**

* As a user, I can copy a URL that reproduces my timer configuration and state.
* **Acceptance**: Clicking “Share preset” copies a URL with query params that, when opened, pre‑configures the timer. An “Embed” tab provides an iframe snippet.

**US‑6: End‑of‑timer alert**

* As a user, I can choose an alert behavior (sound, flash, both, none) and optionally repeat every N seconds for M repetitions.
* **Acceptance**: The chosen alert triggers at 00:00, respecting browser autoplay rules (with a pre‑arming click)

---

## 5) Functional Requirements

### 5.1 Timer Modes

* **Duration mode**: HH\:MM\:SS (with quick‑set chips: 5, 10, 15, 25, 30, 45, 60 min).
* **Date/Time mode**: Date picker + time picker + timezone selector (default to user’s local TZ).
* **Pause/Resume/Reset**: Keyboard shortcuts (Space = start/pause, R = reset, F = full‑screen).
* **Overrun**: Optional “count up” after zero (shows +MM\:SS) with configurable color.

### 5.2 Styling & Layout

* Font families: A curated set (e.g., Inter, Poppins, Bebas Neue, Roboto Mono) plus a system default.
* Font sizing presets: Small/Medium/Large/XL, plus granular slider.
* Colors: Foreground, background, accent; provide **theme presets** (Dark, Light, High Contrast, Brandable).
* Layout density: Compact / Spacious.
* Optional elements: Title text, subtext, progress bar, ring indicator (circular progress), and current time.

### 5.3 Shareable URL Schema

* All configuration serializes into query params; URL‑safe base64 for complex values.
* **Example**:

  * Duration: `/timer?mode=duration&d=15m&title=Break&font=Poppins&fs=xl&fg=%23FFFFFF&bg=%23000000&accent=%23FF4D4D&alert=sound&repeat=3&fullscreen=1`
  * Date/time: `/timer?mode=until&to=2025-12-31T23:59:59&tz=Europe/London&title=New%20Year%20Countdown&font=Bebas%20Neue&bar=1`
* URL decoding rules: Missing params fall back to defaults. Unknown params ignored.

### 5.4 Embedding

* Provide an **Embed** dialog with:

  * `<iframe src="https://app.example/timer?..." width="800" height="400" style="border:0;" allow="fullscreen; autoplay"></iframe>`
  * Toggle to **hide UI controls** (`&ui=0`).
  * **Responsive** sizing guidance and sandbox recommendations.

### 5.5 Alerts

* Built‑in sounds (3–5 short tones), with volume control and preview.
* Visual flash (invert colors or accent pulse) for 3–10 seconds.
* Accessibility: Vibrate API on supported devices; aria‑live status update.

### 5.6 Persistence

* Last used settings stored in localStorage.
* “Save as preset” copies URL; optional name stored locally for quick access list.

### 5.7 Accessibility (A11y)

* Keyboard navigable controls and full‑screen toggle.
* WCAG 2.2 AA contrast by default; warnings when user drops below.
* Screen‑reader friendly labels and aria‑live announcements (e.g., “5 minutes remaining”).

### 5.8 Internationalization & Timezones

* Locale‑aware time formatting.
* Timezone selector with search; default to system timezone.
* 24‑hour/12‑hour display toggle (based on locale; override allowed).

### 5.9 Performance & Accuracy

* Smooth updates at 60fps for visual components; numerical updates at 1Hz.
* Use monotonic time (Performance API) to avoid drift during tab throttling; reconcile with wall clock for date/time mode.
* Maintain accuracy within ±100ms after 30 minutes in foreground; display “low‑power/tab throttled” indicator if backgrounded.

### 5.10 Offline & PWA (Stretch)

* Optional PWA install: offline shell, cached fonts, basic functionality without network.

---

## 6) Non‑Functional Requirements

* **Availability**: 99.9% monthly (static hosting + CDN).
* **Compatibility**: Evergreen browsers (latest 2 versions of Chrome, Edge, Firefox, Safari). Graceful fallback for older.
* **Security & Privacy**: No accounts; no personal data. URLs may contain titles; advise users not to include sensitive info. CSP with `frame-ancestors` guidance.
* **Analytics**: Anonymous usage metrics (page views, mode used, full‑screen usage) with opt‑out toggle.

---

## 7) UX / UI

**Design principles**: Bold, legible, minimal chrome, high contrast. Strong typography with large numerals.

**Key screens**

1. **Home/Editor**: Mode toggle (Duration/Until), controls panel, live preview.
2. **Full‑screen Player**: Timer only (optional title/progress). Tiny “reveal controls” affordance.
3. **Share/Embed Modal**: URL field with copy button, iframe snippet, UI‑hide toggle.

**States**: Idle, Running, Paused, Finished, Overrun.

**Error cases**: Invalid date/time; past date; malformed URL params → clear messaging + safe defaults.

---

## 8) Tech Stack & Architecture

* **Framework**: React (Vite) or SvelteKit (choose one at kickoff; default React).
* **Styling**: Tailwind CSS + CSS variables for theming. Optionally CSS container queries for responsive typography.
* **Fonts**: Modern web fonts via Google Fonts or self‑hosted (Inter, Poppins, Bebas Neue, Roboto Mono). Preload numeric glyphs.
* **State**: URL query params as the single source of truth; Zustand or Redux for local UI state if needed.
* **Routing**: Client‑side router with a single `/timer` route.
* **Build/Deploy**: Static export + CDN; optional edge redirects.

**High‑level flow**

* Editor updates → serialize to URL → Start → Navigate to Player with `ui=0` for clean display → End alerts fire.

---

## 9) URL Parameter Reference (v1)

* `mode`: `duration` | `until`
* `d`: duration string (`90s`, `15m`, `1h30m`)
* `to`: ISO local or UTC timestamp (`YYYY-MM-DDTHH:mm[:ss][Z]`)
* `tz`: IANA timezone (`Europe/London`)
* `title`: string (URL‑encoded)
* `ui`: `1` (show) | `0` (hide)
* `font`: `Inter|Poppins|Bebas Neue|Roboto Mono|system`
* `fs`: font size preset `s|m|l|xl` (or `px=72` optional advanced)
* `fg`, `bg`, `accent`: hex color (`%23RRGGBB`)
* `bar`: `1` to show progress bar; `ring=1` for circular
* `alert`: `none|sound|flash|both`
* `repeat`: integer repetitions; `repevery`: seconds between repeats
* `overrun`: `0|1`
* `fullscreen`: `0|1` (attempt full‑screen on load if user interaction already occurred)

---

## 10) API & Data (Optional/Future)

No backend required for v1. Future: short‑link service that maps compact codes to long parameter sets.

---

## 11) Telemetry & KPIs

* D1 retention of shared URLs.
* % sessions entering full‑screen.
* Error rate on URL parsing.
* Time to interactive (TTI) < 1.5s on mid‑range laptop.

---

## 12) Testing & QA

* Unit tests for time parsing/formatting, URL (de)serialization, and countdown accuracy.
* E2E tests (Playwright) for the main flows: set duration, full‑screen, share URL, embed iframe loads.
* Visual regression tests for themes.

---

## 13) Accessibility & Compliance

* Keyboard shortcuts documented and discoverable.
* Proper roles/labels; aria‑live polite updates every 10s, assertive at final 10s and 3..2..1.
* Focus management when entering/exiting full‑screen.

---

## 14) Milestones

**M1 (Week 2)**: Duration mode MVP (start/pause/reset), basic styling presets, full‑screen.

**M2 (Week 4)**: Date/time mode with timezone; share URL; embed snippet; alert sounds.

**M3 (Week 6)**: Polished UI, accessibility pass, performance hardening, docs/demo site.

---

## 15) Open Questions

* Should we support millisecond precision display for esports/speed‑run use cases?
* Support for multiple simultaneous timers in v1.1?
* Provide brand presets (e.g., “Meeting Dark”, “Classroom Light”)?
* PWA install + offline default?

---

## 16) Out of Scope (v1)

* Server‑side storage of presets, auth, or collaboration.
* Mobile app store distribution.
* Live shared control across multiple clients.
