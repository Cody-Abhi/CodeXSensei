# Architecture

```
Browser (React 18 SPA, Vite 8, TypeScript strict, Zustand)
   │  fetch /api/*  (same origin, no keys in client)
   ▼
Node 20 + Express (TS) ── Zod validate ── rate-limit ── Helmet / strict CSP
   │
   ▼
Google Gemini API (@google/genai, gemini-2.5-flash, JSON schema output)

Single container on Cloud Run serves /dist (static client) and /api.
Secrets: Google Secret Manager → env GEMINI_API_KEY.
```

## Request flow

1. The client collects `EventInput` via a 3-step wizard and `POST`s it to `/api/plan`.
2. The server validates the body (Zod `.strict()`), checks an in-memory LRU cache (1h TTL), and
   otherwise builds a delimited, injection-resistant prompt and calls Gemini with a JSON
   `responseSchema`.
3. The model output is Zod-validated; on failure, one repair retry runs, then a local rule-based
   template fallback. The budget is re-normalised so categories sum to the input budget exactly.
4. The validated `Plan` is cached and returned. The client renders budget, timeline, vendors and
   ideas, persists to versioned localStorage, and can refine via `/api/chat` (SSE) returning a
   JSON patch or `/api/ideas/regenerate` for per-category idea regeneration.

## Client architecture

- **State:** Zustand store (`planStore`) with auto-save to `localStorage` via `subscribe()`.
  Hydration on page load; schema validation on every load.
- **Routing:** React Router 7 with `React.lazy` code-splitting (Wizard, PlanPage, StyleGuide).
- **Design system:** CSS custom properties (`tokens.css`), neobrutalism (3px borders, 6px shadows),
  light/dark themes, `prefers-reduced-motion` support. 8 reusable components.
- **Exports:** Markdown copy, JSON download, ICS calendar, Google Calendar links, print view.

## Server architecture

- **DI pattern:** `createApp(options)` accepts injected services for testability.
- **Plan service:** cache → Gemini → repair → fallback pipeline with 20s timeout.
- **Chat service:** SSE streaming with optional JSON patch for inline plan refinement.
- **Security:** Helmet + strict CSP, rate limiting (20 req/min/IP), 20KB body limit, prompt
  injection guard (delimited data blocks, control char stripping).

## Folder map

```
src/client/   React SPA: components, features, hooks, store, styles
src/server/   Express: routes, services, middleware
src/shared/   Zod schemas, types, money/date pure utils, fallback templates
tests/        unit, component, api, e2e
docs/         architecture, decisions, build log, accessibility
```

## Build & run

- `npm run build` → `vite build` (client → `dist/client`) + esbuild bundle (server → `dist/server`).
- Production server serves `dist/client` statically with an SPA fallback and mounts `/api`.
- Bundle budget: < 150 KB gzipped; current: ~62 KB gz initial + lazy chunks.
