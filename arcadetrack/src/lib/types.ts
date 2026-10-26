export type BadgeType = 'GAME' | 'TRIVIA' | 'SKILL' | 'OTHER';

export type ErrorCode =
  | 'INVALID_URL'
  | 'PROFILE_PRIVATE_OR_NOT_FOUND'
  | 'FETCH_TIMEOUT'
  | 'PARSE_FAILED'
  | 'RATE_LIMITED'
  | 'UPSTREAM_ERROR'
  | 'NETWORK';

/** What the API returns / what we persist. Type + season are derived at render time. */
export interface RawBadge {
  id: string;
  title: string;
  imageUrl: string;
  badgeUrl?: string;
  /** ISO timestamp, or null when the date text could not be parsed. */
  earnedAt: string | null;
  /** Text of the badge's "Learn more" dialog on the profile page. */
  description?: string;
  /** Official "Learn more" page (absolute URL) from the dialog. */
  learnMoreUrl?: string;
  /** Which Google catalog the badge links to: /games/<id> or /course_templates/<id>. */
  catalog?: 'games' | 'courses';
  /** Section heading the badge was listed under (e.g. "Bronze League"). */
  league?: string;
  /** Google's own badge id from /badges/<id>. */
  externalId?: string;
  /** Points the badge says it is worth in its own dialog text, e.g. 2 for "...and 2 Arcade Points!". */
  statedPoints?: number;
}

export interface ProfileStats {
  /** .profile-badge containers present on the page. */
  foundOnPage: number;
  /** Same-title badges collapsed into one (earliest date kept). */
  duplicatesMerged: number;
  /** Section headings found, in page order. */
  leagues: string[];
}

export interface Badge extends RawBadge {
  type: BadgeType;
  overridden: boolean;
  inSeason: boolean;
}

export interface ProfilePayload {
  profileId: string;
  name: string;
  avatar: string;
  memberSince: string | null;
  fetchedAt: string;
  stats: ProfileStats;
  badges: RawBadge[];
}

export interface Snapshot {
  fetchedAt: string;
  badgeIds: string[];
  points: number;
}

export interface TrackedProfile {
  profileId: string;
  url: string;
  name: string;
  avatar: string;
  memberSince: string | null;
  badges: RawBadge[];
  snapshots: Snapshot[];
  overrides: Record<string, BadgeType>;
  facilitatorBonus: number;
  lastFetchedAt: string;
  stats?: ProfileStats;
  /** Badge ids that were not in the previous snapshot (shown with NEW! stickers). */
  newBadgeIds: string[];
}
