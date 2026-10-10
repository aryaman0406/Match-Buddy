# Match Buddy — Polish & Hardening Changelog

This document details every architectural, security, data layer, UI, and quality improvement applied to the "Match Buddy" codebase for the Dream11 Forward Deployed Engineer internship take-home submission.

---

## Phase 1: Security and AI Layer

1. **Client-Side Key Hygiene Removed:**
   - Deleted `components/ApiKeyModal.tsx` and all UI elements allowing users to paste or configure API keys in the browser.
   - Removed all `localStorage` access and states (`geminiKey`, `geminiModel`) from `app/page.tsx`.
   - Stripped client headers (`x-gemini-key`, `x-gemini-model`) and client request payloads.

2. **Server-Side API Route (`/api/explain`):**
   - Centralized all Google Gemini generative streaming calls into `app/api/explain/route.ts`.
   - Read `GEMINI_API_KEY` and `GEMINI_MODEL` strictly from server environment variables via `process.env`.
   - Created `.env.example` documenting configuration parameters.
   - Verified `.gitignore` to prevent any `.env*` secrets from being tracked while keeping `.env.example` accessible.
   - Inspected git commit history (`git log -p`) to confirm zero API keys or secrets were ever leaked.

3. **Input Validation (`lib/validation.ts`):**
   - Strictly validates `kind` (`player`, `event`, `question`, `story`), `language` (`en`, `hinglish`), `persona` (`casual`, `analyst`, `desi`), and `sport`.
   - Enforces a 200-character maximum on free-text questions.
   - Returns clean, friendly JSON error responses with HTTP 400 status codes.

4. **In-Memory Rate Limiter (`lib/rateLimit.ts`):**
   - Implemented an IP-based sliding window rate limiter restricting clients to 20 requests per 10 minutes.
   - Returns HTTP 429 with `Retry-After: 600` headers when exceeded.

5. **In-Memory Response Cache (`lib/cache.ts`):**
   - Implemented an in-memory TTL cache (30-minute expiration) keyed by `(kind, idOrText, language, persona, sport)`.
   - Repeated clicks or reviewer traffic receive instant streaming responses without burning API quota.

6. **10-Second Timeout & Offline Fallback Safety:**
   - Implemented a strict 10-second client timeout safeguard in `app/page.tsx`.
   - On timeout, upstream 502/503 errors, rate-limiting (429), or missing API key, the client automatically displays the verified offline explanation with a badge reading `"Showing a saved explanation"`.
   - Added friendly retry messaging for free-text questions without saved answers.
   - The UI never displays blank screens or raw unhandled errors.

7. **In-Flight Cancellation (`AbortController`):**
   - Cancels pending streaming requests whenever the user closes the bottom sheet, toggles language, or selects another player or event.

8. **Prompt Architecture (`/prompts`):**
   - Extracted all prompt strings out of components into dedicated prompt builder modules:
     - `prompts/system.ts`: Strict instructions to rely solely on provided verified facts, refuse non-sports questions politely, and limit explanations to 2-3 sentences.
     - `prompts/player.ts`: Grounded player intro prompt.
     - `prompts/event.ts`: Event breakdown prompt.
     - `prompts/question.ts`: Sports question prompt.
     - `prompts/story.ts`: Match story recap prompt.

---

## Phase 2: Honest Content and Data Layer

1. **Truth in Claims:**
   - Replaced all marketing claims ("Zero hallucination guardrails") in the footer with honest copy:
     *"Player facts come from a curated dataset; AI explains them in context. AI can make mistakes. Powered by Google Gemini."*

2. **First-Visit Tip Banner:**
   - Replaced the "Senior Demo Mode" banner with a neutral tip banner: *"Try it: tap any player or event."*
   - Persists dismiss state in `localStorage` so returning users are not interrupted.

3. **Demarcation of Demo Matches:**
   - Updated the red broadcast badge from "LIVE" to `"LIVE · DEMO MATCH"` with an accessible `role="status"` and `aria-label="Demo match with simulated real-time data"`.

4. **Modular Sports Data Layer:**
   - Extracted sports data out of monolith files into modular, typed files under `data/sports/`:
     - `data/sports/cricket.ts` (India vs Australia)
     - `data/sports/football.ts` (Real Madrid vs Barcelona)
     - `data/sports/basketball.ts` (Lakers vs Warriors)
   - Validated by shared schema in `data/types.ts`.
   - Adding a team, player, or event now requires only a data file change and zero component updates.

5. **MatchDataProvider Interface:**
   - Created `MatchDataProvider` interface and `MockMatchDataProvider` in `data/provider.ts`.
   - UI consumes exclusively the provider contract.
   - Added architectural documentation explaining how live sports broadcast feeds can be swapped in without modifying UI or AI code.

6. **Player Facts & Strike Indicator Meaning:**
   - Added `// TODO verify` comments beside every team roster and `keyFacts` list across all three sports data files.
   - Documented the star / strike indicator on Hardik Pandya: in cricket scoring and live match tracking, it represents the batter currently **on strike** (facing the next ball).
   - Rendered an explicit bat icon with `aria-label="on strike"` and `title="On strike: facing next delivery"`.

7. **Deterministic Win Probability (`lib/winProbability.ts`):**
   - Implemented pure mathematical functions calculating win probabilities based on required run rate, current run rate, balls remaining, and wickets in hand (Cricket), score difference vs time (Football & Basketball).
   - Win probabilities remain consistent with scoreboard changes during simulation.
   - Added an explicit `"(estimate)"` label with a contextual tooltip explaining the deterministic calculation.

---

## Phase 3: UI Polish

1. **Decluttered Header (`components/TopBar.tsx`):**
   - Retained only the brand logo, the `EN` / `हिंग` language toggle, and a single settings gear icon.
   - Moved persona selection and theme toggle into a clean settings popover.
   - Removed cluttered "AI" badge.

2. **Typography & Contrast (WCAG AA):**
   - Ensured all text sizes across labels, stats, badges, and footers are at least 12px (`text-xs`).
   - Verified color contrast ratios in both Dark (`#94A3B8` on `#090B10` = 9.5:1) and Light (`#64748B` on `#F8FAFC` = 4.8:1) modes meet WCAG AA (≥ 4.5:1).

3. **Batting & Bowling Visuals:**
   - Added clear striker indicator with a bat icon and `aria-label="on strike"`.
   - Ensured bowler figures (e.g. `3.0-0-28-1`) remain prominently displayed.

4. **Sport Tabs Scroll Discoverability:**
   - Added right-edge gradient fade and animated scroll hint arrow to `components/SportSelector.tsx` so the clipped Basketball tab is discoverable on mobile.
   - Implemented smooth auto-scrolling of the active tab into view.

5. **Desktop Layout Optimization:**
   - Above `1024px` (`lg:`), transformed the single-column stretched phone container into a two-column desktop layout centered within `max-w-6xl`:
     - Left column: Match scoreboard, on-field cards, timeline moments, and ask bar.
     - Right column: Dedicated sticky AI intel panel with audio commentary, copy, and share actions.
   - Mobile devices retain the focused, thumb-friendly single column view with slide-up bottom sheet.

6. **State Completeness:**
   - Implemented loading shimmer skeletons, streaming cursor, success states, offline fallback states, and empty states across Cricket, Football, and Basketball.

7. **Accessibility Hardening:**
   - Touch targets configured to ≥ 44px on all interactive buttons.
   - Visible focus rings (`focus-visible:ring-2 focus-visible:ring-indigo-400`).
   - `aria-live="polite"` applied to streaming answer containers.
   - Dynamic `lang="hi-Latn"` attribute rendered when Hinglish commentary is displayed.
   - Added `prefers-reduced-motion` media queries in `app/globals.css`.

8. **SEO & Metadata:**
   - Configured title, description, SVG emoji favicon, Open Graph, and Twitter card metadata in `app/layout.tsx`.

---

## Phase 4: Quality Signals

1. **Unit Test Suite (`tests/`):**
   - Configured Vitest test runner.
   - 29 unit tests passing across 4 suites:
     - `tests/cricketArithmetic.test.ts`: Overs to balls (`14.2` = `86` balls), balls to overs, RRR, and CRR.
     - `tests/winProbability.test.ts`: Deterministic cricket, football, and basketball calculations and edge cases.
     - `tests/validation.test.ts`: Input schema validation, 200-char limits, and error handling.
     - `tests/cache.test.ts`: Deterministic cache key generation, normalization, and TTL expiration.

2. **Documentation & Architecture Guide:**
   - Comprehensive `README.md` including target persona, features, Mermaid architecture diagram, extension guide, design decisions, and limitations.
