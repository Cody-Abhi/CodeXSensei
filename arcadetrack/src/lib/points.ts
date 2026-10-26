import { POINTS, TIERS, type Tier } from '@/config/arcade';
import type { Badge } from './types';

export interface PointsBreakdown {
  games: number;
  trivia: number;
  skills: number;
  /** Badges that are none of Game / Trivia / Skill (courses, facilitator): never counted. */
  other: number;
  /** Points earned by game / trivia badges (may exceed the badge count when a badge states more than 1). */
  gamePoints: number;
  triviaPoints: number;
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
  let gamePoints = 0;
  let triviaPoints = 0;
  const worth = (b: Badge, base: number) =>
    POINTS.honorPointsStatedOnBadge && b.statedPoints && b.statedPoints > 0 ? b.statedPoints : base;
  let skills = 0;
  let other = 0;
  for (const b of badges) {
    if (!b.inSeason) continue;
    if (b.type === 'GAME') {
      games++;
      gamePoints += worth(b, POINTS.game);
    } else if (b.type === 'TRIVIA') {
      trivia++;
      triviaPoints += worth(b, POINTS.trivia);
    } else if (b.type === 'SKILL') skills++;
    else other++;
  }
  const skillPoints = Math.floor(skills / POINTS.skillBadgesPerPoint);
  const bonus = Math.max(0, facilitatorBonus);
  const points = gamePoints + triviaPoints + skillPoints + bonus;
  return { games, trivia, skills, other, gamePoints, triviaPoints, total: games + trivia + skills, skillPoints, bonus, points };
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
