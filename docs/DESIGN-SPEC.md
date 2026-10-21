# DawaDekho — Design Spec (Hackfest Lucknow, PS3)

**Problem:** "The Prescription You Cannot Read" — show the cost of medicine before it is paid.
**Tracks:** Best Use of Gemma 4 · DigitalOcean Best Open-Source AI Project
**Budget:** ₹0 (free tiers only) · **Build time:** ~2 hrs

## 1. What it does (minimum demo)
1. User types a brand name (typos OK) **or** photographs a medicine strip/box.
2. App identifies **salt + strength** of the medicine.
3. App shows the **Jan Aushadhi generic** with the same salt + strength and a headline: `₹240 → ₹28 (save 88%)`.
4. Disclaimer + "confirm with your doctor/pharmacist" + link to find a Jan Aushadhi Kendra.

## 2. Golden rule (from the PS brief)
- Gemma **only reads and normalises**: photo → `{brand, salt, strength, form, mrp_printed}` as JSON.
- Every generic name, price and alternative shown comes **only from the Jan Aushadhi dataset**. Gemma never generates drug info, dosage or advice.
- If no confident dataset match → say "Not found — ask your pharmacist." Never guess.
- No handwritten prescription OCR (brief calls it a trap). Printed strips/boxes only.

## 3. Architecture (all free)
| Part | Tech | Free tier |
|---|---|---|
| Frontend | Static HTML + vanilla JS + Fuse.js (CDN) | DO App Platform static site (3 free apps) |
| AI endpoint | DO Function (Node 18) `POST /api/read-strip` | DO Functions 90,000 GiB-s/month free |
| Model | `gemma-4-26b-a4b-it` via Gemini API (image input) | Gemini API free key (low caps — fine for demo) |
| Data | `data/drugs.json` bundled in repo | — |

API key lives only in the DO Function env var `GEMINI_API_KEY`, never in the browser.

**Flow:** photo (resized to ≤1024px in browser) → DO Function → Gemma 4 (strict JSON prompt) → JSON back → browser fuzzy-matches `salt + strength` in `drugs.json` → result card.
Typed search skips Gemma entirely (works even if the API is rate-limited).

## 4. Data
- `data/jan_aushadhi.json` — ~200 common generics from the official PMBI product list: `{code, generic_name, salts[], strength, unit, mrp, group}`.
- `data/brands.json` — ~60 common brand names → `{brand, salts[], strength, form, typical_mrp, source_note}` (typical MRP labelled "approx — check strip").
- For photos, savings use the **MRP printed on the strip** (read by Gemma, user can edit) — no invented brand prices.
- Source + date listed in README.

## 5. Components (one agent each)
- **A Data:** build both JSON files + `scripts/validate-data.js`.
- **B Frontend:** `index.html`, `app.js`, `match.js` (Fuse.js), `style.css`; mobile-first; Hindi/English toggle; result card; editable MRP.
- **C Gemma Function:** `packages/api/read-strip/index.js` + `project.yml`; prompt returns JSON only; validates shape; 413/429/timeout errors handled.
- **D Repo:** README (problem, demo, tools, model, what Gemma does/doesn't, limits), MIT LICENSE, CONTRIBUTING.md, `.do/app.yaml`.

## 6. Error handling
- Gemma unreadable/blurry → "Couldn't read clearly — type the name instead."
- 429 / timeout → fall back to typed search, message shown.
- Low match score → "Not in our list" (no guess).

## 7. Testing
- `match.test.js`: typos ("crocin", "dolo65o", "pan 40") resolve correctly; unknown → no match.
- Data validator: every entry has salt, strength, numeric MRP.
- Manual: 3 real strip photos on a phone; airplane-mode typed search.

## 8. Out of scope
Handwriting OCR, accounts, stock availability, dosage info, store map (link only).

## 9. Timeline
0–60 min A/B/C/D in parallel · 60–100 integrate + test on phone · 100–120 deploy to DO + rehearse demo.
