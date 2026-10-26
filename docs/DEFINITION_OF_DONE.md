# PlanPop — Definition of Done (§15 Checklist)

Evidence from `npm run verify` run on the final commit.

---

## Code Quality

- [x] **TypeScript strict mode, no `any`**: `tsc --noEmit` clean
- [x] **ESLint 0 warnings**: `eslint . --max-warnings=0` passes
- [x] **Prettier clean**: `prettier --check .` passes
- [x] **JSDoc on public APIs**: all exported functions documented
- [x] **Small pure functions for money/date math**: `shared/money.ts`, `shared/dates.ts`
- [x] **Conventional commits**: all commits use `feat:`, `fix:`, `docs:` prefixes

## Security

- [x] **Gemini key server-side only**: `git grep -i AIza` — only test assertion references
- [x] **Zod `.strict()` on all inputs**: `z.strictObject()` in `shared/schemas.ts`
- [x] **Helmet + strict CSP**: configured in `server/app.ts`
- [x] **Rate limiting**: 20 req/min/IP on AI routes (`middleware/rateLimit.ts`)
- [x] **Prompt-injection guard**: delimited `<<<USER_DATA>>>` blocks, control chars stripped (`services/sanitize.ts`)
- [x] **Text-only rendering of AI output**: no `dangerouslySetInnerHTML` anywhere
- [x] **`npm audit` 0 high/critical**: `found 0 vulnerabilities`
- [x] **Non-root Docker**: `USER node` in `Dockerfile`
- [x] **No .env/node_modules/dist committed**: `.gitignore` enforced

## Efficiency

- [x] **Bundle < 150 KB gzipped**: initial JS 62 KB gz (total with CSS: ~65 KB gz)
- [x] **Code-splitting**: `React.lazy` for Wizard, PlanPage, StyleGuide
- [x] **LRU cache**: 1h TTL server-side cache keyed by SHA-256 of normalized input
- [x] **20s timeout**: `AbortController` on Gemini calls
- [x] **Compression**: gzip middleware enabled in production

## Testing

- [x] **Coverage ≥ 90% all metrics**: 96.4% stmts, 91.5% branches, 95.3% funcs, 97.8% lines
- [x] **266 unit/component/API tests**: all pass
- [x] **26 E2E tests**: Playwright, desktop + mobile Chromium, light + dark themes
- [x] **axe-core 0 violations**: all routes, both themes, both viewports
- [x] **Tests never hit real Gemini**: DI-mocked client
- [x] **3 event types tested E2E**: wedding (Aisha & Rohan), birthday (Kiaan 7th), community (Diwali Mela)

## Accessibility (WCAG 2.2 AA)

- [x] **Semantic landmarks**: `header`, `nav`, `main`, `footer`; single `h1` per page
- [x] **Logical heading order**: no skipped levels
- [x] **Skip-to-content link**: visible on focus, first focusable element
- [x] **Full keyboard operation**: including modal focus trap
- [x] **Form labels always visible**: `aria-describedby` for hints/errors, `aria-invalid` on error
- [x] **AI output `aria-live="polite"`**: loading state `aria-busy`
- [x] **Charts**: `role="img"` + `aria-label` + visually-hidden data table
- [x] **Touch targets ≥ 44×44 px**: enforced via CSS `min-height`/`min-width`
- [x] **`lang="en"` on `<html>`**: set in `index.html`
- [x] **Status not by colour alone**: icon + text always accompany colour
- [x] **Motion ≤ 150ms**: disabled under `prefers-reduced-motion`
- [x] **Contrast ≥ 4.5:1**: black text on all coloured fills (both themes)
- [x] **eslint-plugin-jsx-a11y**: 0 warnings

## Problem-Statement Alignment

- [x] **3 event types**: wedding, birthday, community — type-specific prompts & templates
- [x] **AI-powered plan generation**: Gemini 2.5 Flash with JSON schema output
- [x] **Budget tracking**: editable amounts, overspend warning, SVG bar chart
- [x] **Timeline**: back-scheduled milestones, done/overdue, ICS download, GCal links
- [x] **Vendor checklist**: category grouping, status cycling, Maps links, progress bar
- [x] **Personalized ideas**: generated from vibes/dietary preferences, per-category regenerate
- [x] **Chat refinement**: SSE streaming, JSON patch with accept/reject UI
- [x] **Dashboard**: countdown, budget/timeline/vendor health
- [x] **Persistence**: versioned localStorage with schema validation
- [x] **Export**: Markdown copy, JSON download, print view
- [x] **Fallback**: rule-based templates when Gemini is unavailable
- [x] **Design system**: neobrutalism (3px borders, 6px shadows, flat saturated colors)
- [x] **Light/dark themes**: auto + manual toggle
- [x] **Responsive**: mobile-first, works at all viewports

## Deployment

- [x] **Dockerfile**: multi-stage build, non-root, port 8080
- [x] **Cloud Run deploy instructions**: in README with Secret Manager integration
- [x] **Demo script**: 3 flows documented in `docs/DEMO_SCRIPT.md`

## Documentation

- [x] **README**: problem statement, tech stack, run locally, scripts, deploy, docs links
- [x] **ARCHITECTURE.md**: request flow, client/server architecture, folder map
- [x] **A11Y.md**: WCAG 2.2 AA checklist with evidence
- [x] **DECISIONS.md**: 10 documented decisions
- [x] **BUILD_LOG.md**: chronological build record, all 10 phases
- [x] **SECURITY.md**: security model documentation
- [x] **DEMO_SCRIPT.md**: 3 end-to-end demo flows
