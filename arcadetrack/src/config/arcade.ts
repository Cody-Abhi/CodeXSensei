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
} as const;

export interface Tier {
  id: 'trooper' | 'ranger' | 'champion' | 'legend';
  name: string;
  min: number;
  colorVar: string;
}

/** Ascending by `min`. A tier runs until the next tier's `min` - 1; the last is open-ended. */
export const TIERS: readonly Tier[] = [
  { id: 'trooper', name: 'Trooper', min: 50, colorVar: '--tier-trooper' },
  { id: 'ranger', name: 'Ranger', min: 75, colorVar: '--tier-ranger' },
  { id: 'champion', name: 'Champion', min: 95, colorVar: '--tier-champion' },
  { id: 'legend', name: 'Legend', min: 120, colorVar: '--tier-legend' },
];

export const TIER_NOTE =
  'Tiers have limited seats on a first-come basis (waterfall system). This app shows eligibility only, not seat availability.';

export const CLASSIFY = {
  trivia: /trivia/i,
  /** Checked after trivia, before game: facilitator badges are not game badges. */
  neverGame: /facilitator/i,
  game: /arcade|base camp|level\s*\d|skills boost arcade|certification zone|\bgames?\b/i,
} as const;

export const TYPE_META: Record<BadgeType, { label: string; colorVar: string }> = {
  GAME: { label: 'Game', colorVar: '--pink' },
  TRIVIA: { label: 'Trivia', colorVar: '--orange' },
  SKILL: { label: 'Skill Badge', colorVar: '--blue' },
  OTHER: { label: 'Other', colorVar: '--white' },
};

export const BADGE_TYPES: readonly BadgeType[] = ['GAME', 'TRIVIA', 'SKILL', 'OTHER'];

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
