import skillCatalog from '@/data/skill-badges.json';
import { CLASSIFY } from '@/config/arcade';
import type { BadgeType } from './types';

/** Lowercase, collapse whitespace, drop a leading "[DEPRECATED]" marker. */
export function normalizeTitle(title: string): string {
  return title
    .replace(/^\s*\[?\s*deprecated\s*\]?\s*[:-]?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

const CATALOG = new Set((skillCatalog as string[]).map(normalizeTitle));

export function classifyTitle(title: string): BadgeType {
  if (CLASSIFY.trivia.test(title)) return 'TRIVIA';
  if (CLASSIFY.neverGame.test(title)) return 'OTHER';
  if (CLASSIFY.game.test(title)) return 'GAME';
  if (CATALOG.has(normalizeTitle(title))) return 'SKILL';
  return 'OTHER';
}
