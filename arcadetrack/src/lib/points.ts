import { POINTS, TIERS, type Tier } from '@/config/arcade';
import type { Badge } from './types';

export interface PointsBreakdown {
  games: number;
  trivia: number;
  skills: number;
  other: number;
  total: number;
  /** Points earned from skill badges (floored). */
  skillPoints: number;
  bonus: number;
  points: number;
}

/** Only in-season badges count. `totalPoints = games + trivia + floor(skills / 2) + bonus`. */
export function calcPoints(badges: Badge[], facilitatorBonus = 0): PointsBreakdown {
  let games = 0;
  let trivia = 0;
  let skills = 0;
  let other = 0;
  for (const b of badges) {
    if (!b.inSeason) continue;
    if (b.type === 'GAME') games++;
    else if (b.type === 'TRIVIA') trivia++;
    else if (b.type === 'SKILL') skills++;
    else other++;
  }
  const skillPoints = Math.floor(skills / POINTS.skillBadgesPerPoint);
  const bonus = Math.max(0, facilitatorBonus);
  const points = games * POINTS.game + trivia * POINTS.trivia + skillPoints + bonus;
  return { games, trivia, skills, other, total: games + trivia + skills + other, skillPoints, bonus, points };
}

export interface TierInfo {
  current: Tier | null;
  next: Tier | null;
  pointsToNext: number | null;
}

export function getTierInfo(points: number): TierInfo {
  let current: Tier | null = null;
  for (const t of TIERS) if (points >= t.min) current = t;
  const next = TIERS.find((t) => t.min > points) ?? null;
  return { current, next, pointsToNext: next ? next.min - points : null };
}

/** How many more skill badges are needed to earn the next skill-badge point. */
export function skillPairingHint(skills: number): { skills: number; needed: number; text: string } {
  const per = POINTS.skillBadgesPerPoint;
  const needed = per - (skills % per);
  const noun = needed === 1 ? 'skill badge' : 'skill badges';
  return {
    skills,
    needed,
    text: `You have ${skills} skill badge${skills === 1 ? '' : 's'} → ${needed} more ${noun} for the next point`,
  };
}
