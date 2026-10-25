# Architecture

```
Browser (React SPA, Vite, TS)
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

1. The client collects `EventInput` via the wizard and `POST`s it to `/api/plan`.
2. The server validates the body (Zod `.strict()`), checks an in-memory LRU cache, and otherwise
   builds a delimited, injection-resistant prompt and calls Gemini with a JSON `responseSchema`.
3. The model output is Zod-validated; on failure, one repair retry runs, then a local rule-based
   template fallback. The budget is re-normalised so categories sum to the input budget exactly.
4. The validated `Plan` is cached and returned. The client renders budget, timeline, vendors and
   ideas, persists to localStorage, and can refine via `/api/chat` (SSE) returning a JSON patch.

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
