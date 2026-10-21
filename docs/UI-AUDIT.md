# DawaDekho — UI Audit

Reviewed at **320, 375, 768, 1280 px** in **light and dark** mode, against
`DESIGN-SYSTEM.md`. Method: headless Chromium screenshots of home, search,
result, confirm, no-match and error states, plus a keyboard pass. Zero console
errors in every state.

## What already works well

- Home hierarchy: one headline → 3 steps → two big buttons → example chips.
- Result "receipt": savings hero in `--text-hero` with count-up, struck
  branded MRP vs Jan Aushadhi with tabular figures, visible disclaimer.
- States: skeleton receipt, friendly no-match, error-with-next-step, offline
  banner — all present and readable in grayscale (icon + words).
- Dark mode follows the system; tokens resolve correctly.
- Mobile: result replaces input; **no horizontal scroll at 320 px**.
- Desktop ≥1024 px: clean two-column (input left, result right).
- Photo → editable confirm → result verified end to end.
- Language remembered on device; `<html lang>` switches.

## Findings to fix (priority order)

### P1 — Home clarity
- **[tablet] Content not capped on mid widths.** Between 640–1024 px the input
  column stretches to the full gutter (~736 px at 768), but DESIGN-SYSTEM §5
  says content should be **max 560 px, centred** until the two-column layout.
  → Cap the single-column content at 560 px.

### P2 — Result receipt card
- **[a11y/polish] Link-style action buttons are underlined.** `Find nearest`,
  `Get app`, `Send on WhatsApp` are `<a class="btn">` and inherit the link
  underline. → `.btn` anchors get `text-decoration: none`.
- **[polish] Five stacked full-width actions are heavy.** Group the secondary
  actions (WhatsApp / Read aloud) into one row to cut vertical bulk; keep the
  primary Kendra button full width.

### P3 — States
- **[polish] Error title is derived by string-splitting** (`err.generic`
  `.split(".")`). → Add a dedicated `err.title` i18n key.

### P4 — Confirm step
- **[missing] No photo thumbnail beside the fields.** The spec wants the strip
  thumbnail next to the editable fields so the user can cross-check.
- **[layout] "Retake" is stacked below "Show cheaper option".** The spec wants
  them adjacent (primary + retake). → Put them in a wrapping row.

### P5 — Desktop
- Working. Minor: the left column is sparse when a result is showing (just the
  search field). Keep the example chips visible there for quick re-search.

### P6 — Polish
- **[missing] No manual dark-mode toggle.** Part A asks for "follows the system
  **and** a manual toggle". The design system already supports
  `data-theme="dark|light"`. → Add a theme toggle (sun/moon) in the header,
  remembered on device, defaulting to system.
- Focus rings (3 px) present; sticky bottom bar has safe-area padding; good.

### P7 — Optional
- "My list": add several medicines and show the total saving.
- "Send on WhatsApp": already implemented on the result card.

## Accessibility notes
- Touch targets ≥ 48 px throughout; combobox has full keyboard support.
- Result announces the saving to screen readers.
- Add `aria-pressed` state to the new theme toggle and keep the map (Part B) an
  enhancement — the nearby list must work without it.
