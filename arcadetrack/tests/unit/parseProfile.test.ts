import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildBadges } from '@/lib/badges';
import { parseEarnedDate, parseProfileHtml } from '@/lib/parseProfile';
import { toPayload } from '@/lib/server/loadProfile';
import { ApiError } from '@/lib/errors';

const ID = '7308881d-94e0-4843-ae8a-40753fe95f60';
const BASE = `https://www.skills.google/public_profiles/${ID}`;
const html = readFileSync(path.join(__dirname, '../fixtures/profile-public.html'), 'utf8');

describe('parseEarnedDate', () => {
  it.each([
    ['Earned Oct 12, 2026 EDT', '2026-10-12T12:00:00.000Z'],
    ['Earned Apr  6, 2025 EDT', '2025-04-06T12:00:00.000Z'],
    ['\nEarned Mar  1, 2024 EST\n', '2024-03-01T12:00:00.000Z'],
    ['Earned September 3, 2026', '2026-09-03T12:00:00.000Z'],
  ])('%j', (text, iso) => expect(parseEarnedDate(text)).toBe(iso));

  it.each([['Earned soon'], ['Earned Foo 12, 2026'], ['Earned Feb 31, 2026'], ['']])('%j -> null', (text) =>
    expect(parseEarnedDate(text)).toBeNull(),
  );
});

describe('parseProfileHtml (real profile fixture)', () => {
  const parsed = parseProfileHtml(html, BASE);

  it('reads the profile header', () => {
    expect(parsed.name).toBe('Aman Uchitkar');
    expect(parsed.avatar).toMatch(/^https:\/\/lh3\.googleusercontent\.com\//);
    expect(parsed.memberSince).toBe('2023');
  });

  it('extracts every badge container with title, image, link and date', () => {
    expect(parsed.badgeNodeCount).toBe(81);
    expect(parsed.stats).toEqual({ foundOnPage: 81, duplicatesMerged: 0, leagues: ['Bronze League'] });
    expect(parsed.badges.length).toBe(81);
    for (const b of parsed.badges) {
      expect(b.title.length).toBeGreaterThan(0);
      expect(b.imageUrl).toMatch(/^https:\/\/cdn\.qwiklabs\.com\//);
      expect(b.badgeUrl).toContain(`/public_profiles/${ID}/badges/`);
      expect(b.earnedAt).toMatch(/^\d{4}-\d{2}-\d{2}T12:00:00\.000Z$/);
    }
    expect(parsed.misses).toEqual([]);
  });

  it('reads every badge dialog: description, official link, catalog, league, Google badge id', () => {
    for (const b of parsed.badges) {
      expect(b.description?.length).toBeGreaterThan(20);
      expect(b.learnMoreUrl).toMatch(/^https:\/\/www\.skills\.google\/(games|course_templates)\/\d+$/);
      expect(b.catalog).toBe(b.learnMoreUrl!.includes('/games/') ? 'games' : 'courses');
      expect(b.league).toBe('Bronze League');
      expect(b.externalId).toMatch(/^\d+$/);
    }
    expect(parsed.badges.filter((b) => b.catalog === 'games')).toHaveLength(43);
    expect(parsed.badges.filter((b) => b.catalog === 'courses')).toHaveLength(38);
    const speedrun = parsed.badges.find((b) => b.title === 'The Arcade June Speedrun');
    expect(speedrun?.description).toContain('Race to the finish line');
  });

  it('reads points a badge states about itself (only Skills Splash says "2 Arcade Points")', () => {
    const stated = parsed.badges.filter((b) => b.statedPoints !== undefined);
    expect(stated.map((b) => [b.title, b.statedPoints])).toEqual([['The Arcade Skills Splash', 2]]);
  });

  it('parses a known badge exactly', () => {
    const b = parsed.badges.find((x) => x.title === 'The Arcade June Speedrun');
    expect(b?.earnedAt).toBe('2024-07-09T12:00:00.000Z');
  });

  it('decodes HTML entities in titles', () => {
    expect(parsed.badges.some((b) => b.title.includes('Networking & Security'))).toBe(true);
  });

  it('gives unique stable ids', () => {
    expect(new Set(parsed.badges.map((b) => b.id)).size).toBe(parsed.badges.length);
    expect(parseProfileHtml(html, BASE).badges.map((b) => b.id)).toEqual(parsed.badges.map((b) => b.id));
  });

  it('classifies the fixture sensibly and none fall in the 2026 season', () => {
    const badges = buildBadges(parsed.badges);
    const count = (t: string) => badges.filter((b) => b.type === t).length;
    // Counts verified by hand against the real titles in the fixture.
    expect([count('TRIVIA'), count('GAME'), count('SKILL'), count('OTHER')]).toEqual([26, 22, 14, 19]);
    expect(badges.filter((b) => b.inSeason)).toHaveLength(0);
    expect(badges.find((b) => b.title.includes('Facilitator'))?.type).toBe('OTHER');
  });
});

describe('parseProfileHtml edge cases', () => {
  const wrap = (badges: string) =>
    `<h1 class="ql-display-small">Test User</h1>${badges}`;
  const badge = (title: string, earned: string) =>
    `<div class="profile-badge"><a class="badge-image" href="/public_profiles/${ID}/badges/1"><img src="https://cdn.qwiklabs.com/x"/></a><span class="ql-title-medium">${title}</span><span class="ql-body-medium">${earned}</span></div>`;

  it('dedupes duplicate titles keeping the earliest date', () => {
    const p = parseProfileHtml(
      wrap(badge('Same Badge', 'Earned Mar 5, 2026 EST') + badge('Same Badge', 'Earned Jan 2, 2026 EST')),
      BASE,
    );
    expect(p.badges).toHaveLength(1);
    expect(p.badges[0].earnedAt).toBe('2026-01-02T12:00:00.000Z');
  });

  it('keeps unparseable dates as null and records a miss', () => {
    const p = parseProfileHtml(wrap(badge('Odd Badge', 'Earned sometime')), BASE);
    expect(p.badges[0].earnedAt).toBeNull();
    expect(p.misses.some((m) => m.startsWith('earned'))).toBe(true);
  });

  it('resolves relative links against the base', () => {
    const p = parseProfileHtml(wrap(badge('B', 'Earned Jan 2, 2026 EST')), BASE);
    expect(p.badges[0].badgeUrl).toBe(`https://www.skills.google/public_profiles/${ID}/badges/1`);
  });
});

describe('toPayload error mapping', () => {
  it('empty profile with a name is valid (0 badges)', () => {
    const p = toPayload(ID, '<h1 class="ql-display-small">Zero</h1>', BASE);
    expect(p.badges).toEqual([]);
  });

  it('page without a name or badges -> PROFILE_PRIVATE_OR_NOT_FOUND', () => {
    expect(() => toPayload(ID, '<html><body><p>Sign in</p></body></html>', BASE)).toThrowError(ApiError);
    try {
      toPayload(ID, '<html><body><p>Sign in</p></body></html>', BASE);
    } catch (e) {
      expect((e as ApiError).code).toBe('PROFILE_PRIVATE_OR_NOT_FOUND');
    }
  });

  it('badges present in text but unreadable markup -> PARSE_FAILED', () => {
    try {
      toPayload(ID, '<h1>Name</h1><div class="x">Earned Jan 2, 2026</div>', BASE);
      throw new Error('should have thrown');
    } catch (e) {
      expect((e as ApiError).code).toBe('PARSE_FAILED');
    }
  });

  it('redirect away from public_profiles -> PROFILE_PRIVATE_OR_NOT_FOUND', () => {
    try {
      toPayload(ID, '<h1>Home</h1>', 'https://www.skills.google/');
      throw new Error('should have thrown');
    } catch (e) {
      expect((e as ApiError).code).toBe('PROFILE_PRIVATE_OR_NOT_FOUND');
    }
  });
});
