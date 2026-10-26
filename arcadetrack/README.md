# ArcadeTrack

Paste a public Google Skills profile URL and see every badge classified (Game / Trivia / Skill / Other), Arcade 2026 points, and progress toward prize tiers. Next.js 15 + TypeScript + Tailwind; neobrutalist UI. Unofficial community tool.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm test
```

All points, tiers, season dates, classification patterns, cache/rate-limit values live in `src/config/arcade.ts`. The skill badge catalog is `src/data/skill-badges.json`. All HTML selectors live in `src/lib/selectors.ts`.

### Developing without access to skills.google

In non-production only, `ARCADETRACK_FIXTURE=/path/to/profile.html npm run dev` makes the API route read that file instead of fetching. Use `tests/fixtures/profile-public.html` (captured from a real public profile).
