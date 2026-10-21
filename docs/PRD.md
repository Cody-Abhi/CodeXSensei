# DawaDekho — Product Requirements Document

> **Dawa dekho, daam dekho.** See the medicine. See the price. Before you pay.

| | |
|---|---|
| **Event** | GDG on Campus SRMCEM × MLH — Hackfest Lucknow, 21 Oct 2026 |
| **Problem statement** | #3 "The Prescription You Cannot Read" (Pharmacy retail) |
| **Tracks** | Best Use of Gemma 4 · DigitalOcean Best Open-Source AI Project |
| **Owner** | Richa |
| **Status** | Approved · Build window ~2 hrs |
| **Cost** | ₹0 — free tiers only |
| **Licence** | MIT (OSI) |

---

## 1. Problem

A patient gets a prescription with brand names, goes to a chemist and pays what they're told.

- The same salt and strength is often sold at many prices. A Jan Aushadhi generic can cost a fraction of the branded medicine.
- The patient can't read the handwriting and doesn't know the molecule, so they can't compare.
- The bill is paid before anyone shows them the cheaper option.

**Job to be done:** *"Before I pay, tell me what this medicine really is and the cheapest trusted version of it."*

## 2. Users

| Persona | Context | Needs |
|---|---|---|
| **Ramesh, 58** — retired, diabetic | Monthly refills; low digital confidence; reads Hindi best | Big text, one tap, Hindi, no login |
| **Pooja, 27** — buys for her parents | Smartphone-savvy, in a hurry at the counter | Photo → answer in under 10 seconds, a clear saving figure |
| **Chemist / Kendra staff** (secondary) | Asked "is there a generic?" | Fast lookup by salt |

**Design target:** a first-time user with low digital confidence on a ₹8,000 Android phone, on a weak signal, standing at a counter.

## 3. Goals and success metrics

| Goal | Metric (demo-day) |
|---|---|
| Show the true cost fast | Typed search → result in **< 1 s**; photo → result in **< 8 s** |
| Be correct, never invent | **0** prices or salts on screen that are not from the dataset |
| Handle real-world typos | ≥ 90% of a 20-item typo test set matches correctly |
| Usable by new users | Judge completes a lookup with **no instructions** |
| Both tracks visibly used | Gemma reads the strip live; app runs on DigitalOcean |

**Non-goals:** dosage advice, buying online, stock availability, user accounts, reading handwriting.

## 4. Scope

### 4.1 Must have (MVP — the demo)

| # | Requirement | Acceptance criteria |
|---|---|---|
| M1 | **Type a medicine name** | Typos and spacing variants ("dolo65o", "pan 40", "crocin") resolve to the right salt and strength. Shows the top match plus up to 2 alternatives. |
| M2 | **Photograph a strip or box** | Camera opens on mobile; upload works on desktop. Gemma 4 returns `{brand, salts, strength, form, mrp_printed}`. The user can correct any field before the result. |
| M3 | **Show the Jan Aushadhi generic** | Same salt(s) **and** strength. Generic name, pack size, MRP and drug code, all from the dataset. |
| M4 | **Savings headline** | `₹240 → ₹28 · you save ₹212 (88%)`. The branded price is the strip MRP (read by Gemma, editable) or the "approx" price from the brand list, clearly labelled. |
| M5 | **No-match is honest** | Below the match threshold, show "Not in our list — ask your pharmacist". Never guess. |
| M6 | **Safety disclaimer** | Visible on every result: "Information only. Confirm with your doctor or pharmacist before switching." |
| M7 | **Find a Kendra** | A button links to the official Jan Aushadhi Kendra locator and the Janaushadhi Sugam app. |
| M8 | **Hindi / English** | Toggle in the header; the choice is remembered on the device. |
| M9 | **Works on a weak network** | Typed search works offline after first load (data is bundled). Photo needs internet and says so. |

### 4.2 Should have (if time allows)
- **S1 — Whole prescription:** add several strips to a list and see the total saving.
- **S2 — Share:** "Send to WhatsApp" with a plain-text summary.
- **S3 — Read aloud:** speak the result using the browser's speech engine (Hindi voice where available).

### 4.3 Won't have (this build)
Handwriting OCR (the brief calls it a trap) · dosage or interaction info · login · payments · a live store map.

## 5. The golden rule (AI boundary)

| Gemma 4 **may** | Gemma 4 **must never** |
|---|---|
| Read printed text from a strip or box photo | Generate a drug name, salt, price or alternative |
| Normalise a misspelt brand into `{brand, salts, strength}` | Give dosage, side-effect or medical advice |
| Return `null` fields when unsure | Fill gaps with guesses |

All facts shown to the user come from `data/jan_aushadhi.json` and `data/brands.json`. Gemma's output is only used as a **search key**.

## 6. User flows

**Flow A — Type (primary, no AI)**
Home → type "dolo 650" → live suggestions → tap → result card → *Find Kendra*.

**Flow B — Photo (the Gemma demo)**
Home → **Photo of strip** → camera → "Reading strip…" → confirm card (brand / salt / strength / MRP, all editable) → **Show cheaper option** → result card.

**Flow C — No match**
Result area shows "Not in our list" plus "Try another spelling" and "Ask your pharmacist". There is no fake result.

**Flow D — AI unavailable** (rate limit, offline, timeout)
"Couldn't read the photo right now. Type the name instead." Focus moves to the search box.

## 7. Functional architecture

```
Browser (static site, DigitalOcean App Platform – free)
 ├─ index.html · style.css · app.js · i18n.js
 ├─ match.js  ── Fuse.js fuzzy search over bundled JSON
 ├─ data/jan_aushadhi.json · data/brands.json
 └─ photo ──► POST /api/read-strip
                 │
     DigitalOcean Function (Node 18 – free 90k GiB-s/month)
                 │  env: GEMINI_API_KEY (never sent to browser)
                 ▼
     Gemini API → gemma-4-26b-a4b-it (image + text → strict JSON)
```

**Matching rule:** normalise the salt names (lower-case, sorted, aliases such as paracetamol = acetaminophen) and the strength (mg). Look for an exact salt-set **and** strength match first, then fuzzy on the generic name. Show a result only if the score is ≤ 0.35 (Fuse.js scale, lower is better).

## 8. Data

| File | Source | Fields |
|---|---|---|
| `jan_aushadhi.json` | Official PMBI product list (janaushadhi.gov.in), snapshot date in README | `code, generic_name, salts[], strength, form, unit, mrp, group` |
| `brands.json` | Curated ~60 common Indian brands | `brand, aliases[], salts[], strength, form, approx_mrp, note` |

~200 common generics are curated for the demo. The PS warns that 200 drugs done well beats 20,000 done badly.

## 9. Non-functional requirements

| Area | Requirement |
|---|---|
| **Accessibility** | WCAG 2.1 AA. Base text 18 px. Touch targets ≥ 48 px. Visible focus. Full keyboard use. `lang` switches with the language. Works at 200% zoom. |
| **Responsiveness** | Mobile-first from 320 px. Breakpoints 640 and 1024. No horizontal scroll. See `DESIGN-SYSTEM.md`. |
| **Performance** | First load < 300 KB (no framework). Photo resized in the browser to ≤ 1024 px JPEG before upload. |
| **Privacy** | Photos are not stored. They are sent once to the Function and to Gemma, then discarded. No cookies, no analytics. |
| **Security** | API key only in the DigitalOcean Function env. Function accepts image/jpeg ≤ 2 MB only. CORS limited to the app domain. |
| **Reliability** | Typed search has no server dependency. Photo path has a 15 s timeout and a typed fallback. |

## 10. Open-source and judging checklist

- [ ] Public repo, MIT `LICENSE`, `CONTRIBUTING.md`, README that a stranger can follow
- [ ] README credits **all tools**: Gemma 4, Gemini API, DigitalOcean, Fuse.js, Google Fonts, PMBI data, and AI coding assistants used
- [ ] README section "What Gemma does, and where it fails" (honest limits)
- [ ] Small, honest commits throughout the window (no commits before the build window opened)
- [ ] Live DigitalOcean URL in the README

| Judging criterion | How DawaDekho scores |
|---|---|
| Problem fit | Hits every PS3 "expect to see" item |
| Innovation | Gemma reads the strip **and** the printed MRP, so the saving is real, not estimated |
| Technical depth | Fuzzy salt and strength matching, multimodal AI behind a serverless boundary |
| Working demo | Live URL, real strips, works on a judge's phone |
| Design & UX | Hindi-first, big type, two-button home screen |
| Impact & scale | 18,000+ Kendras; any city; zero running cost |
| Presentation | 3-minute story: Ramesh's ₹240 strip → ₹28 |
| Code & commits | Clean modules, tests, honest history |

## 11. Risks

| Risk | Mitigation |
|---|---|
| Gemini free-tier rate limit on Gemma | Typed path needs no AI. Cache the demo strips. Keep a second key ready. |
| Gemma misreads a strip | Editable confirm step. Dataset-only facts. "Not in list" fallback. |
| Brand price inaccuracy | Prefer the strip-printed MRP. Label brand-list prices as "approx". |
| Wi-Fi at venue | Bundled data. Phone hotspot for the photo demo. |

## 12. Companion documents

- `DESIGN-SYSTEM.md` — theme, fonts, type scale, responsive rules
- `UX-COPY.md` — every string in English and Hindi
- `SEO-AI-VISIBILITY.md` — meta, schema, `llms.txt`
- `IMPLEMENTATION-PLAN.md` — agent-by-agent build tasks
- `superpowers/specs/2026-10-21-dawadekho-design.md` — approved design spec
