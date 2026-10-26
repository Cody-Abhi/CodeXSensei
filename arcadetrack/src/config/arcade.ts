import type { BadgeType } from '@/lib/types';

/** Everything that can change mid-season lives here. */

export const SEASON = {
  label: 'Arcade 2026',
  start: '2026-01-01',
  end: '2026-12-31',
} as const;

export const POINTS = {
  game: 1,
  trivia: 1,
  /** Skill badges needed for 1 point (total is floored). */
  skillBadgesPerPoint: 2,
  /**
   * Some badges state their own value in the profile dialog ("...and 2 Arcade Points!").
   * When true, a Game/Trivia badge counts that many points instead of the default above.
   */
  honorPointsStatedOnBadge: true,
  statedPointsPattern: /\b(\d{1,2})\s+arcade\s+points?\b/i,
} as const;

export interface Tier {
  id: 'trooper' | 'ranger' | 'champion' | 'legend';
  name: string;
  min: number;
  colorVar: string;
  /** Prize cap per tier (waterfall: overflow rolls down to the next tier). Informational only. */
  seats: number;
}

/** Ascending by `min`. A tier runs until the next tier's `min` - 1; the last is open-ended. */
export const TIERS: readonly Tier[] = [
  { id: 'trooper', name: 'Trooper', min: 50, colorVar: '--tier-trooper', seats: 6000 },
  { id: 'ranger', name: 'Ranger', min: 75, colorVar: '--tier-ranger', seats: 4000 },
  { id: 'champion', name: 'Champion', min: 95, colorVar: '--tier-champion', seats: 3000 },
  { id: 'legend', name: 'Legend', min: 120, colorVar: '--tier-legend', seats: 2500 },
];

export const TIER_NOTE =
  'Prizes are first-come, first-served with caps per tier (Legend 2,500 · Champion 3,000 · Ranger 4,000 · Trooper 6,000). When a tier fills, eligibility rolls down to the next tier (waterfall). This app shows eligibility only, not seat availability; check the live counter on the official Arcade page.';

export const CLASSIFY = {
  trivia: /trivia/i,
  /** Checked after trivia, before game: facilitator badges are not game badges. */
  neverGame: /facilitator/i,
  game: /arcade|base camp|level\s*\d|skills boost arcade|certification zone|\bgames?\b/i,
  /**
   * Course-catalog badges whose dialog text calls them a (singular) skill badge, e.g.
   * "Earn a skill badge by completing ..." / "Complete the introductory X skill badge to demonstrate".
   * Google's own skill-badge pages use this wording; ordinary courses say "Earn a badge today!".
   * Plural "Skill Badges" is excluded: foundation courses merely point learners at them.
   */
  skillDescription: /\bskill badge\b(?!s)/i,
} as const;

export const TYPE_META: Record<BadgeType, { label: string; colorVar: string }> = {
  GAME: { label: 'Game', colorVar: '--pink' },
  TRIVIA: { label: 'Trivia', colorVar: '--orange' },
  SKILL: { label: 'Skill Badge', colorVar: '--blue' },
  /** Not a category: anything that is not a Game, Trivia or Skill badge (courses, facilitator badges). */
  OTHER: { label: 'Not counted', colorVar: '--white' },
};

/** The only three categories shown to users (filters, stats, overrides). */
export const COUNTED_TYPES: readonly BadgeType[] = ['GAME', 'TRIVIA', 'SKILL'];

export const PROFILE = {
  /** Hosts we are willing to fetch from (SSRF guard). */
  allowedHosts: ['skills.google', 'www.skills.google', 'cloudskillsboost.google', 'www.cloudskillsboost.google'],
  canonicalOrigin: 'https://www.skills.google',
  exampleUrl: 'https://www.skills.google/public_profiles/<your-profile-id>',
} as const;

export const FETCH = {
  timeoutMs: 10_000,
  maxRedirects: 3,
  cacheTtlMs: 10 * 60_000,
  cacheMaxEntries: 200,
  /** A refresh may bypass the cache only if the cached copy is older than this. */
  refreshMinAgeMs: 2 * 60_000,
  rateLimit: { max: 10, windowMs: 60_000 },
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
} as const;

export const UI = {
  badgePageSize: 60,
  maxSnapshots: 50,
} as const;

export const DISCLAIMER =
  'Unofficial community tool. Not affiliated with Google. Point rules may change. Always verify with the official Arcade page.';
