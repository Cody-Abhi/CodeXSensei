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
  /** Badge ids that were not in the previous snapshot (shown with NEW! stickers). */
  newBadgeIds: string[];
}
