# Decisions log

Decisions taken where the PRD left room, chosen to maximise the six scoring parameters.

## D1 — Replace repo root (Phase 0)

The repo previously held an unrelated app ("dawadekho"). PlanPop needs the root for its PRD §7
layout, Cloud Run `--source .` deploy, bundle budget and single-purpose cleanliness. We removed
the old source (recoverable in git history) and built PlanPop at the root. **Confirmed with the user.**

## D2 — Branch, not `main`

The PRD says "commit to `main`", but this build runs under a harness that restricts commits to the
designated branch `claude/trusting-hopper-rv6v5z` and forbids pushing to `main` without explicit
permission. All work is committed to the designated branch; it can be merged to `main` via PR.

## D3 — Build tool is Claude Code, not Google Antigravity

The PRD (§1, §18) requires Antigravity-usage evidence in `docs/BUILD_LOG.md`. This project was
built with Claude Code. `BUILD_LOG.md` honestly records the real build process rather than
fabricating Antigravity artifacts. Flag for submission if Antigravity usage is mandatory.

## D4 — Toolchain pinned for a clean audit

Initially pinned Vite 5 + Vitest 2 to prioritise `verify` stability, but that set shipped a
**critical** advisory (tinypool RCE via Vitest) and a **high** (Zod) that only the current majors
fix. Since the DoD requires `npm audit` 0 high/critical, the toolchain was moved to the current
coherent set: **Vite 8 · Vitest 5 · @vitejs/plugin-react 6 · esbuild 0.28 · Zod 4 · react-router 7**,
plus ESLint 9 flat config. Result: `npm audit` reports **0 vulnerabilities**. React stays on 18 per PRD.

## D10 — Playwright browser via env var (sandbox)

Playwright uses its normally-installed browser in CI. In this sandboxed container the browser is
pre-installed at a different revision, so E2E runs with `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`
and `PLAYWRIGHT_CHROMIUM_PATH` pointing at the pre-installed Chromium; `playwright.config.ts` only
applies `executablePath` when `PLAYWRIGHT_CHROMIUM_PATH` is set, and always passes `--no-sandbox`,
so CI is unaffected.

## D5 — Relative imports, no path aliases

Shared code is imported with relative paths so the same source resolves identically across Vite,
esbuild (server bundle) and Vitest without per-tool alias config.

## D6 — Self-host fonts (planned, Phase 2)

Space Grotesk + Inter will be self-hosted (woff2 in the bundle) rather than loaded from Google
Fonts, to keep a strict same-origin CSP, avoid third-party requests (privacy + Lighthouse), and
remove render-blocking external CSS.

## D7 — Gemini mocked via dependency injection (not MSW)

Tests never hit the real Gemini API. The Gemini client is injected into the plan/chat services,
so tests pass a fake. This removes the MSW dependency (smaller `npm audit` surface) while meeting
the PRD "MSW / DI" requirement via DI.

## D8 — CSP without `upgrade-insecure-requests`

Omitted so the app loads over plain HTTP locally and in E2E. TLS is terminated by Cloud Run in
production and enforced with HSTS. `style-src 'unsafe-inline'` is tolerated in early phases and
revisited during hardening.

## D9 — E2E browser matrix

Playwright runs Chromium desktop + Pixel 5 mobile, each tested in light and dark. "Latest Chrome,
Edge, Firefox, Safari" in the PRD is a support statement; Chromium-family coverage in CI keeps the
pipeline fast while axe runs across viewport + theme combinations.
