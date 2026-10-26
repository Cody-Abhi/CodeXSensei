# PlanPop — Product Requirements Document

> **Plan big. Stress zero.** A GenAI event-planning assistant.

|                       |                                                                       |
| --------------------- | --------------------------------------------------------------------- |
| **Problem statement** | GenAI-powered event planner for weddings, birthdays, community events |
| **Owner**             | Richa                                                                 |
| **Status**            | Production-ready                                                      |
| **Licence**           | MIT                                                                   |

---

## §1 Problem

Organizing an event — whether a wedding, a child's birthday, or a community gathering — involves juggling budgets, timelines, vendors, and creative ideas across weeks or months. Most people plan informally (spreadsheets, notes apps, group chats) and miss critical milestones, overspend, or forget categories entirely.

**Job to be done:** _"Give me a complete, actionable event plan — budget, timeline, vendors, and personalized ideas — in under a minute, so I can focus on enjoying the event instead of stressing over logistics."_

## §2 Users

| Persona                                     | Context                               | Needs                                                                                  |
| ------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------- |
| **Aisha, 28** — planning her wedding        | 6 months out, ₹15L budget, 200 guests | Full budget breakdown, vendor checklist, milestone timeline, culturally-relevant ideas |
| **Priya, 35** — planning son's 7th birthday | 3 weeks out, ₹50K budget, 30 kids     | Quick plan, kid-friendly ideas, simple vendor list                                     |
| **Raj, 42** — community event organizer     | 2 months out, ₹3L budget, 500 people  | Scalable plan, cultural themes, large-venue vendors                                    |

## §3 Goals

| Goal                          | Metric                                                                        |
| ----------------------------- | ----------------------------------------------------------------------------- |
| Generate a complete plan fast | Plan in < 5 seconds (fallback) or < 15 seconds (AI)                           |
| Budget accuracy               | Categories sum to the exact input budget (integer math, no rounding errors)   |
| Actionable output             | Every section has next-step actions (book vendor, download ICS, share plan)   |
| Accessible to everyone        | Lighthouse Accessibility 100, axe 0 violations, WCAG 2.2 AA                   |
| Works without AI              | Rule-based fallback templates produce a valid plan when Gemini is unavailable |

## §4 Features

### F1 — Wizard (3-step input)

- **Step 1:** Event type selection (wedding / birthday / community)
- **Step 2:** Details — name, date, city, guests, budget (with inline validation)
- **Step 3:** Preferences — vibes chips (elegant, fun, cultural, etc.), dietary preferences

### F2 — Plan generation

- POST to `/api/plan` → Gemini 2.5 Flash with JSON `responseSchema`
- Skeleton loading with `aria-busy`, `aria-live` result region
- Fallback to rule-based templates on failure
- Source badge: "AI-generated" or "Smart template"

### F3 — Budget

- Editable amount per category with overspend warning
- SVG bar chart with `role="img"`, `aria-label`, visually-hidden data table
- Budget re-normalized to sum exactly to input (integer minor units)

### F4 — Timeline

- Milestones back-scheduled from the event date
- Checkable done/overdue states with icon + text (never colour alone)
- ICS download per milestone, Google Calendar links

### F5 — Vendors

- Grouped by category with status cycling (To Find → Contacted → Booked)
- Google Maps links for city-specific vendor search
- Progress bar showing booking completion

### F6 — Ideas + Chat

- Personalized ideas from vibes/dietary preferences, grouped by category
- Per-category regenerate
- `/api/chat` SSE streaming → `{reply, patch?}` with diff-preview accept/reject

### F7 — Dashboard

- Countdown timer with green/orange/red zones
- Budget/timeline/vendor progress bars with health indicators

### F8 — Persistence + Export

- Versioned localStorage (`planpop_v1`) with schema validation on load
- Auto-save via Zustand `subscribe()`
- Export: copy Markdown, download JSON, print view

## §7 Architecture

```
src/client/   React 18 SPA: components, features, hooks, store, styles
src/server/   Express: routes, services, middleware
src/shared/   Zod schemas, types, money/date utils, fallback templates
tests/        unit, component, api, e2e
docs/         architecture, decisions, build log, accessibility
```

Single container on Cloud Run serves `/dist` (static client) and `/api`.
Secrets: Google Secret Manager → env `GEMINI_API_KEY`.

## §8 Money math

All money is in integer minor units (paise for INR, cents for USD). The server re-normalizes the AI budget so categories sum to the exact input budget. Remainder goes to the largest categories.

## §10 Design system — Neobrutalism

- **Palette:** ink (#111), paper (#fffdf5), yellow, pink, blue, green, orange, purple, red
- **Structure:** 3px black borders, 6px hard shadows, 8px border-radius on cards
- **Typography:** Space Grotesk (display), Inter (body)
- **8-pt spacing grid**
- **Light/dark themes** with auto-detection + manual toggle
- **Motion:** ≤ 150ms transforms, disabled under `prefers-reduced-motion`
- **Focus:** 4px dashed outline, 3px offset
- **8 reusable components:** Button, Card, Badge, Field, ProgressBar, Modal, Toast, SkipLink

## §14 Build phases

10 phases, each verified with `npm run verify` (lint + typecheck + coverage + build + e2e + axe).
See `docs/BUILD_LOG.md` for the full chronological record.

## §15 Definition of Done

See `docs/DEFINITION_OF_DONE.md` for the complete checklist with evidence.

All boxes checked:

- Code Quality: TS strict, ESLint 0 warnings, Prettier clean
- Security: Gemini key server-only, Zod strict, Helmet+CSP, rate-limit, prompt-injection guard, npm audit 0
- Efficiency: 62 KB gz bundle, code-splitting, LRU cache, compression
- Testing: 266 tests, 96%+ coverage, 26 E2E, axe 0 violations
- Accessibility: WCAG 2.2 AA, Lighthouse 100
- Problem-Statement Alignment: all 8 features implemented for 3 event types

## §16 Google services used

Gemini API · Cloud Run · Secret Manager · Google Calendar links · Google Maps links.
