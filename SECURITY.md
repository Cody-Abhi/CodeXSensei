# Security

PlanPop is built to the PRD §9 security bar. This document summarises the controls; it is
expanded with evidence during the hardening phase.

## Secrets

- `GEMINI_API_KEY` lives **only** in the server environment / Google Secret Manager.
- `.env` is git-ignored; `.env.example` ships with placeholders only.
- The key is never bundled into client code and never returned in any response or error.

## Input validation

- Every request body is validated with Zod using `.strict()` (unknown keys rejected).
- JSON body size is capped at 20 KB.

## Prompt-injection defence

- User-supplied text is wrapped in a delimited data block and labelled as data, never
  instructions, in the system prompt.
- Control characters are stripped and lengths are capped before the text reaches the model.

## Output safety

- Model output is schema-validated (Zod) before use.
- AI output is rendered as **text only** — no `dangerouslySetInnerHTML`.
- Outbound links are restricted to `https://www.google.com/maps` and `calendar.google.com`.

## Transport & headers

- Helmet with a strict Content-Security-Policy (`default-src 'self'`, no inline scripts),
  HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.

## Rate limiting & CORS

- AI routes are rate-limited (default 20 req/min/IP) and return a friendly 429.
- Same-origin only; errors never leak stack traces in production.

## Supply chain

- `npm audit --audit-level=high` runs in CI; Dependabot recommended.
- Docker image runs as a non-root user from a minimal base; runtime installs
  production dependencies only.

## Reporting

Please open a private security advisory on the GitHub repository for any vulnerability.
