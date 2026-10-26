import skillCatalog from '@/data/skill-badges.json';
import { CLASSIFY } from '@/config/arcade';
import type { BadgeType, RawBadge } from './types';

/** Lowercase, collapse whitespace, drop a leading "[DEPRECATED]" marker. */
export function normalizeTitle(title: string): string {
  return title
    .replace(/^\s*\[?\s*deprecated\s*\]?\s*[:-]?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

const CATALOG = new Set((skillCatalog as string[]).map(normalizeTitle));

type Classifiable = Pick<RawBadge, 'title'> & Partial<Pick<RawBadge, 'description' | 'catalog'>>;

/**
 * Order: trivia -> facilitator (never a game) -> Google's own catalog tag (/games => GAME) ->
 * title patterns -> bundled skill-badge catalog -> "skill badge" wording in the badge dialog -> OTHER.
 */
export function classifyBadge({ title, description, catalog }: Classifiable): BadgeType {
  if (CLASSIFY.trivia.test(title)) return 'TRIVIA';
  if (CLASSIFY.neverGame.test(title)) return 'OTHER';
  if (catalog === 'games') return 'GAME';
  if (catalog !== 'courses' && CLASSIFY.game.test(title)) return 'GAME';
  if (CATALOG.has(normalizeTitle(title))) return 'SKILL';
  if (description && CLASSIFY.skillDescription.test(description)) return 'SKILL';
  return 'OTHER';
}

export const classifyTitle = (title: string): BadgeType => classifyBadge({ title });
