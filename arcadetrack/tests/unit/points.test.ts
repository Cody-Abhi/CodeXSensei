import { describe, expect, it } from 'vitest';
import { buildBadges } from '@/lib/badges';
import { calcPoints, getTierInfo, skillPairingHint } from '@/lib/points';
import type { BadgeType, RawBadge } from '@/lib/types';

let n = 0;
const raw = (title: string, earnedAt: string | null = '2026-03-10T12:00:00.000Z'): RawBadge => ({
  id: `b${n++}`,
  title,
  imageUrl: '',
  earnedAt,
});
const skill = (k: number, earnedAt?: string | null) =>
  Array.from({ length: k }, (_, i) => raw(i % 2 ? 'Get Started with Pub/Sub' : 'Get Started with Cloud Storage', earnedAt));

describe('calcPoints', () => {
  it('7 skill badges -> 3 points (floor)', () => {
    const badges = Array.from({ length: 7 }, () => raw('Get Started with Cloud Storage'));
    const r = calcPoints(buildBadges(badges));
    expect(r.skills).toBe(7);
    expect(r.skillPoints).toBe(3);
    expect(r.points).toBe(3);
  });

  it('1 skill badge -> 0 points, 8 -> 4', () => {
    expect(calcPoints(buildBadges(skill(1))).points).toBe(0);
    expect(calcPoints(buildBadges(skill(8))).points).toBe(4);
  });

  it('games and trivia are 1 point each; other badges are 0', () => {
    const badges = [
      raw('The Arcade Base Camp March 2026'),
      raw('The Arcade Trivia March 2026 Week 1'),
      raw('Qwiklabs Trivia March 2026 Week 2'),
      raw('Cloud Digital Leader course completion'),
    ];
    const r = calcPoints(buildBadges(badges));
    expect(r).toMatchObject({ games: 1, trivia: 2, other: 1, points: 3, total: 3 });
  });

  it('adds facilitator bonus and ignores negative bonus', () => {
    const b = buildBadges([raw('The Arcade Base Camp')]);
    expect(calcPoints(b, 5).points).toBe(6);
    expect(calcPoints(b, -3).points).toBe(1);
  });

  it('excludes out-of-season and undated badges from points but not from the lifetime list', () => {
    const badges = buildBadges([
      raw('The Arcade Base Camp', '2025-12-31T12:00:00.000Z'),
      raw('The Arcade Trivia', '2027-01-01T12:00:00.000Z'),
      raw('The Arcade Skills Splash', null),
      raw('The Arcade Certification Zone', '2026-01-01T12:00:00.000Z'),
      raw('The Arcade Level 1', '2026-12-31T12:00:00.000Z'),
    ]);
    expect(badges).toHaveLength(5);
    expect(badges.filter((b) => b.inSeason)).toHaveLength(2);
    expect(calcPoints(badges).points).toBe(2);
  });

  it('manual overrides change type before calculation', () => {
    const b = raw('Some Completion Course');
    expect(calcPoints(buildBadges([b])).points).toBe(0);
    const overrides: Record<string, BadgeType> = { [b.id]: 'GAME' };
    const rebuilt = buildBadges([b], overrides);
    expect(rebuilt[0]).toMatchObject({ type: 'GAME', overridden: true });
    expect(calcPoints(rebuilt).points).toBe(1);
  });
});

describe('points stated on the badge itself', () => {
  it('a game badge that says "2 Arcade Points" counts 2; others stay 1', () => {
    const splash = { ...raw('The Arcade Skills Splash'), statedPoints: 2 };
    const r = calcPoints(buildBadges([splash, raw('The Arcade Base Camp')]));
    expect(r).toMatchObject({ games: 2, gamePoints: 3, points: 3 });
  });

  it('stated points are ignored once a badge is manually changed to a non-game type', () => {
    const splash = { ...raw('The Arcade Skills Splash'), statedPoints: 2 };
    const r = calcPoints(buildBadges([splash], { [splash.id]: 'OTHER' }));
    expect(r.points).toBe(0);
  });

  it('out-of-season badges never count, stated points or not', () => {
    const old = { ...raw('The Arcade Skills Splash', '2024-03-28T12:00:00.000Z'), statedPoints: 2 };
    expect(calcPoints(buildBadges([old])).points).toBe(0);
  });
});

describe('getTierInfo boundaries', () => {
  it.each([
    [0, null, 'Trooper', 50],
    [49, null, 'Trooper', 1],
    [50, 'Trooper', 'Ranger', 25],
    [74, 'Trooper', 'Ranger', 1],
    [75, 'Ranger', 'Champion', 20],
    [94, 'Ranger', 'Champion', 1],
    [95, 'Champion', 'Legend', 25],
    [119, 'Champion', 'Legend', 1],
    [120, 'Legend', null, null],
    [200, 'Legend', null, null],
  ])('%i points -> current %s, next %s (%s to go)', (pts, current, next, toGo) => {
    const t = getTierInfo(pts);
    expect(t.current?.name ?? null).toBe(current);
    expect(t.next?.name ?? null).toBe(next);
    expect(t.pointsToNext).toBe(toGo);
  });
});

describe('skillPairingHint', () => {
  it('7 skill badges -> 1 more for the next point', () => {
    expect(skillPairingHint(7)).toMatchObject({ needed: 1 });
    expect(skillPairingHint(7).text).toBe('You have 7 skill badges → 1 more skill badge for the next point');
  });
  it('even counts need 2 more', () => {
    expect(skillPairingHint(8).needed).toBe(2);
    expect(skillPairingHint(0).needed).toBe(2);
  });
});
