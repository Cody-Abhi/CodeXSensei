# Build log

A chronological, honest record of how PlanPop was built, phase by phase.

> **Build tool note:** This project was built with **Claude Code** (Anthropic), driven from the
> PRD as the single source of truth. The PRD references Google Antigravity; see `docs/DECISIONS.md`
> (D3). This log is the real evidence of the build process — prompts, phases and verification output.

## Phase 1 — Scaffold & toolchain

**Goal:** a working Vite + Express + TypeScript monorepo-in-one with lint, format, typecheck,
tests (unit/component/API), E2E + axe, CI, Dockerfile, docs skeleton — `npm run verify` green on a
minimal app.

**Built:**

- Root `package.json` with all scripts (`dev`, `build`, `start`, `lint`, `format`, `typecheck`,
  `test`, `test:coverage`, `test:e2e`, `verify`, `audit:ci`).
- TypeScript strict config; Vite config (client in `src/client`); Vitest config with ≥90% coverage
  thresholds; Playwright config (desktop + mobile Chromium, light + dark axe).
- ESLint 9 flat config (typescript-eslint, jsx-a11y, react-hooks, security) + Prettier; Husky +
  lint-staged pre-commit hook.
- Minimal client (`App.tsx` with landmarks + skip link), server (`createApp` factory, `/api/health`,
  Helmet strict CSP, compression, 20 KB body limit, JSON 404 + error handler), shared `version.ts`.
- Tests: unit (`version`), component (`App`), API (`health`), E2E smoke + axe (light & dark).
- `.github/workflows/ci.yml`, Dockerfile (multi-stage, non-root), `.env.example`, README, SECURITY.md,
  docs skeleton.

**Verification (`npm run verify`, all green):**

- ESLint `--max-warnings=0`: 0 warnings.
- Prettier `--check`: clean.
- `tsc --noEmit`: clean.
- Vitest: 16 tests passed across 4 files; **coverage 100%** statements/branches/functions/lines.
- Build: client `dist/client` (JS **45.92 KB gzip**, well under the 150 KB budget) + server bundle.
- Playwright E2E + axe: 6 passed (desktop + mobile Chromium, light + dark, 0 axe violations).
- `npm audit --audit-level=high`: **0 vulnerabilities**.

## Phase 2 — Neobrutalism design system

**Goal:** design tokens + 8 reusable components + a demo route, light/dark/print, reduced-motion,
axe 0.

**Built:**

- `styles/tokens.css` (exact PRD §10 palette + semantic layer, auto + explicit dark, 8-pt grid,
  focus/motion tokens) and `styles/base.css` (reset, typography, global 4px dashed focus ring,
  `.visually-hidden`, skip link, print view, `prefers-reduced-motion`).
- Self-hosted fonts via `@fontsource` (Inter + Space Grotesk) under the strict same-origin CSP.
- Components: Button (press-down + 7 tones), Card (coloured header strip), Badge, Field
  (render-prop with `aria-describedby`/`aria-invalid`/`aria-required`), ProgressBar
  (`role="progressbar"` + numeric %), Modal (native `<dialog>`, Esc + focus return), Toast
  (`role="status"`), SkipLink, plus a ThemeToggle backed by a Zustand theme store.
- Routing (react-router) with a `Layout`, a `Home` hero + event-type cards, and a `/style-guide`
  demo route exercising every component.

**Verification (`npm run verify`, all green):**

- Lint 0 warnings · Prettier clean · `tsc` clean.
- Vitest: 39 tests / 6 files; coverage 95.9% stmts, 94.1% branches, 93.6% funcs, 95.7% lines
  (all ≥ 90%).
- Build: client JS **62.1 KB gzip** (< 150 KB budget); server bundle.
- Playwright E2E + axe: 16 passed — axe 0 violations on `/` and `/style-guide`, light + dark,
  desktop + mobile, including an open modal; skip-link is first focusable.
- `npm audit`: 0 vulnerabilities.

## Phase 3 — Shared schemas & money/date utils (TDD)

**Goal:** Zod schemas (strict) + integer money math + date back-scheduling + rule-based fallback
templates, 100% unit coverage on `shared/`.

**Built:**

- `shared/schemas.ts`: `z.strictObject` schemas (EventInput with future-date refinement, Plan,
  Budget/Timeline/Vendor/Idea, ChatRequest, IdeasRegenerate, PlanPatch, ChatResult) + `types.ts`
  inferring all types from the schemas.
- `shared/money.ts`: integer minor-unit helpers — `toMinor`, `sumMinor`, `percentOf`, `isOverspent`,
  `formatMinor` (Intl), and `normaliseBudget` (scales weights to the exact budget, remainder to the
  largest categories).
- `shared/dates.ts`: `toISODate`, `parseISODate`, `addDays`, `daysBetween`, `daysUntil`,
  `isFutureISODate`, and `backSchedule` (milestones back-scheduled from the event date).
- `shared/templates/`: data-driven `buildFallbackPlan` for wedding / birthday / community — budget
  re-normalised to the exact input budget, contingency ≥5%, personalized ideas from vibes.

**Verification (`npm run verify`, all green):**

- Lint 0 warnings · Prettier clean · `tsc` clean.
- Vitest: 88 tests / 10 files. **`shared/` is 100% on all metrics**; overall 97.5% stmts, 95.5%
  branches, 96.1% funcs, 97.3% lines.
- Build + Playwright E2E + axe: 16 passed. `npm audit`: 0 vulnerabilities.

## Phase 4 — Server: plan API, Gemini service, security, cache, fallback

**Goal:** `POST /api/plan` backed by a mockable Gemini service with retry → repair → fallback,
exact-budget normalisation, LRU cache, prompt-injection guard, rate limiting — Supertest suite green.

**Built:**

- `services/gemini.ts`: `GeminiJsonClient` interface (DI — real API never hit in tests),
  `PLAN_RESPONSE_SCHEMA`, `createGeminiClient` (@google/genai, JSON `responseSchema`),
  `createGeminiFromEnv` (key stays server-side).
- `services/planService.ts`: cache → Gemini → one repair retry → local fallback; 20s timeout via
  `AbortController`; re-normalises the AI budget to the exact total (PRD §8).
- `services/cache.ts`: LRU (1h TTL) keyed by a SHA-256 of normalized input.
- `services/promptBuilder.ts` + `services/sanitize.ts`: system/user/repair prompts, type guidance,
  few-shot from templates; control-char stripping + delimited USER_DATA block (injection guard).
- `middleware/rateLimit.ts`: 20 req/min/IP on AI routes → friendly JSON 429.
- `routes/plan.ts`: Zod-validated `POST /api/plan` returning `{ plan, source }`.
- `app.ts`: DI options (clientDir / planService / aiRateLimit); default service is Gemini-or-fallback.

**Verification (`npm run verify`, all green):**

- Lint 0 · Prettier · `tsc` clean.
- Vitest: 118 tests / 16 files; coverage 98.3% stmts, 96.7% branches, 97.3% funcs, 98.2% lines
  (server modules fully covered; Gemini SDK mocked).
- API tests cover: 200 happy, 400 invalid, 429 rate limit, invalid→repair→fallback, timeout,
  client error, and no-secret-leak on failure.
- Build + E2E/axe 16 passed; `npm audit` 0 vulnerabilities. Live smoke: `/api/plan` returns a
  budget-exact plan; invalid body → 400.
