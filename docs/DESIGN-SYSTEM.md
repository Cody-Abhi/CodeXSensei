# DawaDekho — Design System

**Direction: "the honest receipt."** Warm paper, dark ink, prices set like a pharmacy bill. Green means money saved, saffron means look here. The look is calm and trustworthy, never clinical blue and never a startup gradient.

Built for: a first-time user, 18–75, on a small Android phone, reading Hindi or English, possibly in bright sunlight.

---

## 1. Principles

1. **One job per screen.** Home has two big choices: photo or type. Nothing else competes.
2. **Bigger than you think.** Body text is 18 px and the savings number is huge.
3. **Say it in words, not just colour.** Every status has text and an icon, so it reads in grayscale.
4. **Bilingual by default.** Every font choice supports Devanagari and Latin equally.
5. **Never look certain when we aren't.** "Approx" and "check strip" labels are part of the design, not fine print.

## 2. Colour tokens

Define once on `:root`. Every component uses tokens only, never hex values.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--paper` | `#FBF8F1` | `#151A18` | Page background |
| `--card` | `#FFFFFF` | `#1E2523` | Cards, inputs |
| `--ink` | `#1B2B27` | `#EEF2EF` | Primary text |
| `--ink-muted` | `#55625D` | `#A9B5B0` | Secondary text, labels |
| `--line` | `#E2DCCD` | `#33403C` | Borders, dividers, receipt dashes |
| `--save` | `#0B6E46` | `#4CC28D` | Savings figure, primary button |
| `--save-ink` | `#FFFFFF` | `#0B1F17` | Text on `--save` |
| `--save-soft` | `#E3F3EA` | `#173327` | Savings banner background |
| `--saffron` | `#E8772E` | `#F0954F` | Accent stripe, highlights, never body text |
| `--saffron-soft` | `#FDEBDD` | `#3A2716` | "Approx price" tag, notices |
| `--warn-ink` | `#8A4B00` | `#FFC27A` | Warning text on `--saffron-soft` |
| `--danger` | `#B3261E` | `#FF8A80` | Errors |
| `--focus` | `#1F5FD1` | `#8AB4FF` | Focus ring (3 px) |

**Contrast (WCAG AA, computed):**

| Pair | Light | Dark |
|---|---|---|
| ink on paper | 13.9:1 | 15.6:1 |
| ink-muted on paper | 6.0:1 | 8.3:1 |
| save-ink on save | 6.3:1 | 7.7:1 |
| save on save-soft | 5.5:1 | 6.1:1 |
| warn-ink on saffron-soft | 5.9:1 | 8.9:1 |
| danger on card | 6.5:1 | 6.8:1 |
| focus ring on paper | 5.5:1 | — |

Every pair passes AA (4.5:1). Saffron is decoration only and is never used for text.

```css
:root{
  --paper:#FBF8F1; --card:#FFFFFF; --ink:#1B2B27; --ink-muted:#55625D; --line:#E2DCCD;
  --save:#0B6E46; --save-ink:#FFFFFF; --save-soft:#E3F3EA;
  --saffron:#E8772E; --saffron-soft:#FDEBDD; --warn-ink:#8A4B00;
  --danger:#B3261E; --focus:#1F5FD1;
  color-scheme: light dark;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --paper:#151A18; --card:#1E2523; --ink:#EEF2EF; --ink-muted:#A9B5B0; --line:#33403C;
    --save:#4CC28D; --save-ink:#0B1F17; --save-soft:#173327;
    --saffron:#F0954F; --saffron-soft:#3A2716; --warn-ink:#FFC27A;
    --danger:#FF8A80; --focus:#8AB4FF;
  }
}
:root[data-theme="dark"]{ /* same values as the dark block above */ }
body{ background:var(--paper); color:var(--ink); }
```

## 3. Typography

| Role | Font | Why |
|---|---|---|
| UI and body | **Mukta** (400, 500, 700, 800) | Designed for Devanagari and Latin together. Very legible at small sizes on cheap screens. |
| Prices and codes | **IBM Plex Mono** (500, 600) | Receipt feel. Tabular figures, so ₹ amounts line up. |

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Mukta:wght@400;500;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet">
```

```css
:root{
  --font-ui: "Mukta", system-ui, "Noto Sans Devanagari", sans-serif;
  --font-num: "IBM Plex Mono", ui-monospace, monospace;
}
body{ font-family:var(--font-ui); font-size:var(--text-base); line-height:1.55; }
.price, .code{ font-family:var(--font-num); font-variant-numeric:tabular-nums; }
:lang(hi) body{ line-height:1.7; } /* Devanagari needs room for matras */
```

### Type scale (fluid, ratio ≈ 1.25, base 18 px)

| Token | Mobile → Desktop | Weight | Use |
|---|---|---|---|
| `--text-hero` | 44 → 64 px | 800 | Savings figure "₹212" |
| `--text-xl` | 28 → 36 px | 800 | Page title |
| `--text-lg` | 22 → 26 px | 700 | Card titles, medicine name |
| `--text-md` | 20 px | 500 | Buttons, lead text |
| `--text-base` | 18 px | 400 | Body (never smaller for content) |
| `--text-sm` | 16 px | 500 | Labels, disclaimer, the smallest allowed |

```css
:root{
  --text-hero: clamp(2.75rem, 2rem + 4vw, 4rem);
  --text-xl:   clamp(1.75rem, 1.4rem + 1.8vw, 2.25rem);
  --text-lg:   clamp(1.375rem, 1.25rem + .6vw, 1.625rem);
  --text-md:   1.25rem;
  --text-base: 1.125rem;
  --text-sm:   1rem;
}
```

All sizes are in `rem`, so the user's own phone font-size setting scales the whole app.

## 4. Spacing, radius, elevation

| Token | Value | | Token | Value |
|---|---|---|---|---|
| `--s1` | 4 px | | `--r-sm` | 6 px (chips, tags) |
| `--s2` | 8 px | | `--r-md` | 12 px (inputs, buttons) |
| `--s3` | 12 px | | `--r-lg` | 4 px top / 18 px bottom (result "receipt" card) |
| `--s4` | 16 px (mobile gutter) | | `--shadow` | `0 1px 0 var(--line), 0 8px 24px rgb(0 0 0 / .06)` |
| `--s5` | 24 px | | | |
| `--s6` | 32 px | | | |
| `--s8` | 48 px (touch target) | | | |

Radii are deliberately mixed: the receipt card has a torn-paper bottom edge, built with a dashed `--line` border and a zig-zag mask.

## 5. Layout and responsiveness

Mobile-first. One column until there's room for two.

| Breakpoint | Width | Layout |
|---|---|---|
| Base | 320–639 px | Single column. 16 px gutter. Sticky bottom bar with the two main actions. |
| `sm` | ≥ 640 px | Content max 560 px, centred. Actions move inline under the title. |
| `lg` | ≥ 1024 px | Two columns: left = input (photo/search) 5fr, right = result 7fr. Max width 1120 px. |

```css
.wrap{ width:min(100% - 2*var(--s4), 1120px); margin-inline:auto; }
@media (min-width:1024px){
  .layout{ display:grid; grid-template-columns:5fr 7fr; gap:var(--s6); align-items:start; }
}
```

**Rules:** no horizontal scroll at 320 px · works at 200% zoom · respects `prefers-reduced-motion` · safe-area insets for the sticky bar (`padding-bottom: env(safe-area-inset-bottom)`).

## 6. Components

### Header
Logo wordmark "DawaDekho" (Mukta 800) on the left, language toggle **EN | हिं** on the right as a 48 px segmented button, and a 4 px saffron stripe at the very top.

### Primary actions (home)
Two full-width buttons, 64 px tall, stacked on mobile:
- **📷 Photo of strip**: filled `--save`, `--save-ink` text
- **⌨️ Type medicine name**: outline, 2 px `--ink` border

### Search field
64 px height, 20 px text, magnifier icon, clear (×) button. Suggestions in a list under the field, each row 56 px. Keyboard: ↑ ↓ to move, Enter to choose, Esc to close (ARIA combobox pattern).

### Example chips
"Try: Dolo 650 · Pan 40 · Crocin". Tapping one fills and runs the search. This is the main onboarding device.

### Confirm card (after photo)
Shows Gemma's reading as editable fields: Brand · Salt · Strength · MRP on strip. Header: "Is this right?". Button: **Show cheaper option**.

### Result "receipt" card
```
┌──────────────────────────────┐
│ DOLO 650  (Paracetamol 650mg)│  --text-lg
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
│ Branded MRP        ₹30.00    │  Plex Mono
│ Jan Aushadhi       ₹ 9.80    │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
│  YOU SAVE  ₹20.20  (67%)     │  --save-soft band, --text-hero number
│ Paracetamol 650mg Tab · 15's │
│ Drug code 1234               │
│ [ Find nearest Kendra → ]    │
│ ⓘ Information only. Confirm… │  --text-sm
└──────────────────────────────┘
```
"Approx" tag (`--saffron-soft` and `--warn-ink`) sits next to any brand price that isn't from the strip.

### States
| State | Visual |
|---|---|
| Loading (photo) | Skeleton receipt plus "Reading strip…" text, `aria-live="polite"` |
| No match | Neutral card, no red. Icon plus message plus two actions. |
| Error | `--danger` icon and text, never colour alone |
| Offline | Thin banner: "Offline — typed search still works" |

### Focus and touch
- Every interactive element is ≥ 48×48 px.
- Focus ring: `outline:3px solid var(--focus); outline-offset:2px`.
- No hover-only information.

## 7. Iconography and imagery
Inline SVG line icons, 24 px, 2 px stroke, `currentColor`. No stock photos and no illustrations of pills that could look like a specific real product.

## 8. Motion
- 150 ms ease-out on button press.
- The savings number counts up once over 600 ms.
- All motion is disabled under `prefers-reduced-motion: reduce`.

## 9. Accessibility for new users (checklist)
- [ ] Home explains itself in 3 steps: **Photo → Check → Save**
- [ ] Example chips mean a first search takes one tap
- [ ] Language toggle is visible without scrolling and remembered
- [ ] `<html lang>` switches between `en` and `hi`
- [ ] Every image input has a text alternative path (typing)
- [ ] Error messages say what to do next, not just what failed
- [ ] Reading level: short sentences, no medical jargon except the salt name
- [ ] Screen reader: result announced as "You save 20 rupees 20 paise, 67 percent"
