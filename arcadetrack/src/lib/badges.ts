import { SEASON } from '@/config/arcade';
import { format, parse } from 'date-fns';
import { classifyBadge } from './classify';
import type { Badge, BadgeType, RawBadge } from './types';

export function isInSeason(earnedAt: string | null): boolean {
  if (!earnedAt) return false;
  const day = earnedAt.slice(0, 10);
  return day >= SEASON.start && day <= SEASON.end;
}

/** Applies manual overrides first, then derives type and season membership. */
export function buildBadges(raw: RawBadge[], overrides: Record<string, BadgeType> = {}): Badge[] {
  return raw.map((b) => {
    const override = overrides[b.id];
    return {
      ...b,
      type: override ?? classifyBadge(b),
      overridden: !!override,
      inSeason: isInSeason(b.earnedAt),
    };
  });
}

export function monthKey(earnedAt: string | null): string | null {
  return earnedAt ? earnedAt.slice(0, 7) : null;
}

export function formatDay(earnedAt: string): string {
  return format(parse(earnedAt.slice(0, 10), 'yyyy-MM-dd', new Date()), 'MMM d, yyyy');
}

export function formatMonth(key: string): string {
  return format(parse(`${key}-01`, 'yyyy-MM-dd', new Date()), 'MMM yyyy');
}
