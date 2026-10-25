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
