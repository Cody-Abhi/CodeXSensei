# DawaDekho — दवा देखो

> **Dawa dekho, daam dekho.** See the medicine. See the price. Before you pay.

Photograph or type a branded Indian medicine and DawaDekho shows you the
**Jan Aushadhi generic with the same salt and strength**, and how much you
save — big, in Hindi or English, on a cheap phone, at the chemist's counter.

Built for **Hackfest Lucknow** (GDG on Campus SRMCEM × MLH, 21 Oct 2026),
problem statement **#3 "The Prescription You Cannot Read"**.
Tracks: **Best Use of Gemma 4** · **DigitalOcean Best Open-Source AI Project**.

---

## The idea in 20 seconds

A patient is handed a prescription of brand names and pays whatever the chemist
says. The *same molecule* is often sold under a government Jan Aushadhi generic
for a fraction of the price — but nobody shows the patient the cheaper option
before the bill is paid.

DawaDekho closes that gap:

```
Ramesh's strip:  Dolo 650   ₹30.00
Jan Aushadhi:    Paracetamol 650mg   ₹14.40
                 ─────────────────────────
                 YOU SAVE  ₹15.60  (52%)
```

- **Type** a name (typos welcome) → answer in **< 1 s**, works offline.
- **Photo** a strip → **Gemma 4** reads the printed brand, salt, strength and
  MRP → you confirm → see the generic and the saving.

## The golden rule (why you can trust it)

> **Gemma only reads. The data decides.**

| Gemma 4 **may** | Gemma 4 **must never** |
|---|---|
| Read printed text from a strip/box photo | Invent a drug, salt, price or alternative |
| Normalise a misspelt brand into `{brand, salts, strength}` | Give dosage or medical advice |
| Return `null` when unsure | Fill gaps with guesses |

Every generic name, pack size, drug code and price shown to the user comes
**only** from [`data/jan_aushadhi.json`](data/jan_aushadhi.json). Gemma's output
is used by the browser **only as a search key**. If nothing matches
confidently, the app says *"Not in our list — ask your pharmacist"* and never
guesses. This boundary is enforced in both the prompt
([`packages/api/read-strip/index.js`](packages/api/read-strip/index.js)) and
the matcher ([`match.js`](match.js)), and covered by tests.

## What Gemma does, and where it fails

**Does well:** reads a clean, flat, well-lit **printed** strip or box —
brand, salt, strength, form, and the printed MRP. Normalises odd spacings and
brand-vs-molecule naming into a search key.

**Fails / we handle it:**
- **Handwriting** — out of scope by design (the brief calls it a trap). The
  function detects it and returns `handwriting:true`; the UI says *"We read
  printed strips and boxes, not handwriting."*
- **Blurry / glare / folded strip** — may misread. That is exactly why the
  photo flow has an **editable confirm step** before any result.
- **A medicine not in our ~200-item demo dataset** — honest no-match, no guess.
- **Rate limit / timeout / offline** — the typed path needs no AI at all and
  is always offered as a fallback.

## Try it

**Live demo:** _add your DigitalOcean URL here after deploy_
(`https://dawadekho.ondigitalocean.app/`)

**Run locally** (no build, no install needed for the site):

```bash
# any static server works; Python is everywhere
python3 -m http.server 8080
# open http://localhost:8080
```

Typed search works fully offline/local. The **photo** path needs the
serverless function running with a Gemini API key (see *Deploy* below).

## How it works

```
Browser (static site — DigitalOcean App Platform, free)
 ├─ index.html · style.css · app.js · i18n.js
 ├─ match.js   ── salt+strength normalisation & fuzzy search over bundled JSON
 ├─ data/jan_aushadhi.json · data/brands.json   (bundled → typed search is offline)
 └─ photo ──► POST /api/read-strip
                 │  (image resized to ≤1024px JPEG in the browser)
      DigitalOcean Function (Node 18 — free tier)
                 │  env: GEMINI_API_KEY  (never sent to the browser)
                 ▼
      Gemini API → Gemma 4 (image + strict JSON prompt → {brand,salts,strength,form,mrp_printed})
```

**Matching** ([`match.js`](match.js)): salts are normalised (lowercased,
aliased — e.g. *acetaminophen = paracetamol* — and sorted) and strengths are
reduced to an order-independent multiset, so `telmisartan+amlodipine 40mg+5mg`
and `amlodipine + telmisartan 5 mg + 40 mg` are the same key. Typed queries
fuzzy-resolve a brand/salt first (Levenshtein-based, tuned threshold), then the
key is looked up in the Jan Aushadhi data. Savings use the **strip-printed MRP**
when available (exact), otherwise a clearly-labelled **approx** brand price.

## Find a Kendra (locator)

Every result links to **"Find nearest Jan Aushadhi Kendra"**, and the footer has
a persistent **"Kendras near me"**. The locator:

- Offers **"Use my location"** (geolocation, explained before the prompt and
  never stored) **and** a **PIN code** fallback — if location is denied it moves
  you to the PIN field, no dead end.
- Shows a **list first** (works with no map): each Kendra has its address,
  distance, **Directions** (Google Maps) and **Call** (when a phone is known),
  with an "Approx location" tag where the coordinate is approximate.
- Loads an optional **Mapbox** map **lazily** (only when you open the Map tab,
  to save map loads), with clustering, a "you are here" marker, and list ↔
  marker sync. If no Mapbox token is set or the map fails to load, the map tab
  is simply hidden and the list keeps working.

The locator logic (`locator.js`) is pure and covered by `tests/locator.test.mjs`.

## Project layout

| Path | What |
|---|---|
| `index.html`, `style.css`, `app.js`, `i18n.js` | Static front end (no framework) |
| `match.js` | Matching engine (UMD — runs in browser **and** Node tests) |
| `locator.js` | Kendra distance + PIN logic (UMD, pure) |
| `config.js` | Public runtime config (Mapbox token — no secrets) |
| `data/jan_aushadhi.json` | Jan Aushadhi generics (curated PMBI snapshot) |
| `data/brands.json` | ~45 common Indian brands → salt + strength |
| `data/kendras.json` | Lucknow Jan Aushadhi Kendras (demo snapshot) |
| `packages/api/read-strip/` | Gemma 4 serverless function |
| `scripts/validate-data.js` | Dataset integrity check (CI) |
| `scripts/build-kendras.py` | Reproducible Kendra geocoding pipeline (Nominatim) |
| `tests/match.test.js`, `tests/locator.test.mjs` | Tests (`node --test`) |
| `project.yml`, `.do/app.yaml` | DigitalOcean deploy config |
| `docs/` | PRD, design system, UX copy, SEO, UI audit |

## Develop & test

No dependencies to install — tests use Node's built-in runner.

```bash
npm run validate-data   # dataset clean: salt/strength/price; Kendras in Lucknow bbox
npm test                # matching, savings, Gemma boundary, locator (distance/PIN)
npm run check           # both of the above
```

## Deploy (₹0, free tiers)

1. **Static site** — DigitalOcean App Platform reads [`.do/app.yaml`](.do/app.yaml)
   and serves the repo root. Push to `main` → auto-deploy.
2. **Function** — `doctl serverless deploy .` using [`project.yml`](project.yml),
   or App Platform deploys it from the same spec.
3. **Secret** — set `GEMINI_API_KEY` as an encrypted env var in the DO
   dashboard (never in the repo). Get a free key from Google AI Studio.
4. **Mapbox token (optional, for the Kendra map)** — put a **public** token
   (`pk.…`) in [`config.js`](config.js) as `MAPBOX_TOKEN`. Restrict it by URL
   to your app domain and `localhost`, with only the map read scopes
   (styles/fonts/sprites/tiles). **Never** use a secret token (`sk.…`) in the
   browser. Leave it empty to run the locator in list-only mode. Mapbox's free
   tier covers 50,000 web map loads/month, and the map loads lazily.
5. **Rebuild the Kendra data (optional)** — run
   `pip install pdfplumber requests && python3 scripts/build-kendras.py --pdf-url <url> --district Lucknow`
   to regenerate `data/kendras.json` from the official PDF with live Nominatim
   geocoding.
6. Replace the placeholder URLs (`dawadekho.ondigitalocean.app`) in
   `index.html`, `robots.txt`, `sitemap.xml` and this README with your real URL.

## Data & honesty

- **Source:** official Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)
  product list, [janaushadhi.gov.in](https://janaushadhi.gov.in/).
  **Snapshot: 2026-10-01.** This repo ships a **curated ~200-item demo subset**,
  not the full list — the problem statement rightly warns that *200 drugs done
  well beats 20,000 done badly*. Verify prices against the live PMBI list before
  any real-world use.
- Brand `approx_mrp` values are typical retail prices, **always labelled
  "approx"** in the UI; the real branded price is the MRP on your own strip.
- **Kendra data:** records come from the all-India Jan Aushadhi Kendra list PDF
  (PMBI, dated **Oct 2025**). `data/kendras.json` ships a **curated ~35-Kendra
  Lucknow demo** with approximate area coordinates (`approx_location: true`,
  phones left `null`) so the locator works out of the box. Run
  `scripts/build-kendras.py` to regenerate the authoritative, geocoded version.
  Coordinates are **© OpenStreetMap contributors (ODbL)**, geocoded via
  Nominatim; Mapbox is used only to *display* the map, never to store geocodes.
- **Not medical advice.** Every result says: *"Information only. Confirm with
  your doctor or pharmacist before switching."*

## Accessibility

WCAG 2.1 AA target: 18px base text, ≥48px touch targets, visible 3px focus
ring, full keyboard combobox, status in **words + icon** (readable in
grayscale), `lang` switches with the language, works at 200% zoom and 320px
width, respects `prefers-reduced-motion`, and the saving is announced to
screen readers ("You save 15 rupees, 52 percent").

## Credits & tools

- **[Gemma 4](https://ai.google.dev/gemma)** via the **[Gemini API](https://ai.google.dev/)** — reads the printed strip.
- **[DigitalOcean App Platform & Functions](https://www.digitalocean.com/products/app-platform)** — free static hosting + serverless.
- **[PMBI / Jan Aushadhi](https://janaushadhi.gov.in/)** — the generic medicine data this is all built on.
- **[Google Fonts](https://fonts.google.com/)** — Mukta (Devanagari + Latin) and IBM Plex Mono (receipt figures).
- **[Mapbox GL JS](https://www.mapbox.com/)** — the Kendra map. Note: Mapbox GL
  JS v2+ is under the **Mapbox Terms of Service** (not an OSI licence); it is a
  runtime dependency loaded from Mapbox's CDN and is **not** redistributed in
  this repo. The DawaDekho application code itself stays **MIT**.
- **[OpenStreetMap](https://www.openstreetmap.org/copyright) / [Nominatim](https://nominatim.org/)** — Kendra coordinates (geocoded data), **© OpenStreetMap contributors, ODbL**.
- Matching and locator maths are small hand-written engines (no Fuse.js) so the test suite runs with **zero installs**.
- Built with the help of **AI coding assistants** (Claude) during the hackathon build window.

## License

[MIT](LICENSE). Contributions welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).
