# Contributing to DawaDekho

Thanks for helping make medicine prices honest and readable. This is a small,
dependency-light project — easy to run, easy to reason about.

## Ground rules (non-negotiable)

1. **Never invent a fact.** No drug name, salt, strength or price may appear in
   the UI unless it comes from `data/`. The AI reads; the data decides.
2. **No medical advice.** We show prices and the "confirm with your pharmacist"
   disclaimer, nothing more.
3. **Accessibility is a feature, not a polish step.** Keep 18px base text,
   ≥48px touch targets, visible focus, keyboard support, and words-not-just-colour.
4. **Keep it free and framework-free.** Static HTML/CSS/JS, no build step, no
   tracking, no cookies.

## Getting started

No install is required to run the site or the tests.

```bash
# run the site
python3 -m http.server 8080      # http://localhost:8080

# checks (Node 18+)
npm run validate-data            # dataset integrity
npm test                         # matching + golden-rule tests
npm run check                    # both
```

## Making a change

- **Adding a medicine?** Add the generic to `data/jan_aushadhi.json` and (if a
  brand) to `data/brands.json`. Every brand must resolve to a generic by
  salt-set + strength. Run `npm run validate-data` — it will tell you if not.
- **Touching the matcher?** Add a case to `tests/match.test.js` first (we like
  test-driven here) and keep `npm test` green.
- **UI copy?** Both languages live in `i18n.js`. Add the English and the Hindi
  string together; don't ship an English-only key.
- **Styling?** Use the design tokens in `style.css` (`var(--…)`), never raw hex.

## Commits & PRs

- Small, honest commits with clear messages.
- Describe *what changed and why*. Mention any dataset source for new prices.
- Make sure `npm run check` passes before you open the PR.

## Reporting data errors

If a price or salt looks wrong, open an issue with the medicine name, the field,
and the source (ideally the PMBI list or the strip photo). Data accuracy is the
whole point — these reports are the most valuable contributions.
