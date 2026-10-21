# DawaDekho — Implementation Plan

Agent-by-agent build tasks. Status reflects what is in the repo.

## A — Data ✅
- `data/jan_aushadhi.json` — curated PMBI generics snapshot (51 items).
- `data/brands.json` — ~45 common Indian brands → salt + strength.
- `scripts/validate-data.js` — integrity check (CI).

## B — Frontend ✅
- `index.html`, `style.css`, `app.js`, `i18n.js` — mobile-first, Hindi/English,
  result "receipt" card, editable MRP, no framework.
- `match.js` — Fuse-free matching engine (UMD, browser + Node tests).

## C — Gemma Function ✅
- `packages/api/read-strip/index.js` + `project.yml` — strict JSON prompt,
  shape validation, 413/429/timeout handling. Key only in Function env.

## D — Repo ✅
- `README.md`, `LICENSE` (MIT), `CONTRIBUTING.md`, `.do/app.yaml`,
  `.github/workflows/ci.yml`, SEO files, `og.png`.

## E — UI polish (this iteration)
- `docs/UI-AUDIT.md` — audit at 320/375/768/1280 px + dark mode.
- Fixes per priority group (home clarity, receipt card, states, confirm,
  desktop two-column, focus/sticky-bar/dark-mode polish).

## F — Kendra locator (this iteration)
- `data/kendras.json` — Lucknow Kendras (demo snapshot; see README for source
  and the `scripts/build-kendras.py` live-rebuild pipeline).
- `scripts/build-kendras.py` — pdfplumber extract → filter Lucknow → Nominatim
  geocode (1 req/s, PIN fallback, OSM/ODbL credit).
- `locator.js` — `nearest()` (haversine) and `byPin()`; pure and testable.
- `tests/locator.test.mjs` — distance, sorting, empty, invalid PIN.
- UI: list-first panel (works without map), "Use my location" + PIN fallback,
  lazy Mapbox GL map with clustering and list↔marker sync, graceful
  degradation when the token/CDN is unavailable.
- `config.js` — `MAPBOX_TOKEN` (public `pk.…`, URL-restricted).

## Testing
- `npm run check` = data validator + `node --test` (match + locator).
- Manual: typed search offline; photo path on a phone; locator in Lucknow.
