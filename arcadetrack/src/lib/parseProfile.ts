import { load } from 'cheerio';
import { hash } from './hash';
import { allBadgeNodes, pick, pickDoc } from './selectors';
import type { RawBadge } from './types';

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const EARNED = /Earned\s+([A-Za-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})/i;

/**
 * "Earned Oct 12, 2026 EDT" -> ISO timestamp at 12:00 UTC of that calendar day
 * (noon avoids the displayed day shifting across timezones). Returns null when unparseable.
 */
export function parseEarnedDate(text: string): string | null {
  const m = EARNED.exec(text.replace(/\s+/g, ' '));
  if (!m) return null;
  const month = MONTHS.indexOf(m[1].slice(0, 3).toLowerCase());
  const day = Number(m[2]);
  const year = Number(m[3]);
  if (month < 0) return null;
  const d = new Date(Date.UTC(year, month, day, 12));
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month || d.getUTCDate() !== day) return null;
  return d.toISOString();
}

export interface ParsedProfile {
  name: string | null;
  avatar: string;
  memberSince: string | null;
  badges: RawBadge[];
  /** Badge containers found before dedupe. */
  badgeNodeCount: number;
  /** Selector keys that needed a fallback or found nothing (logged server-side). */
  misses: string[];
}

function absolute(href: string | undefined, base: string): string {
  if (!href) return '';
  try {
    return new URL(href, base).toString();
  } catch {
    return '';
  }
}

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

export function parseProfileHtml(html: string, baseUrl: string): ParsedProfile {
  const $ = load(html);
  const misses: string[] = [];

  const nameHit = pickDoc($, 'name');
  const name = nameHit ? clean(nameHit.el.text()) || null : null;
  if (!nameHit) misses.push('name');

  const avatarHit = pickDoc($, 'avatar');
  const avatar = avatarHit ? absolute(avatarHit.el.attr('src'), baseUrl) : '';
  if (!avatarHit) misses.push('avatar');

  const memberMatch = /Member since\s+(\d{4})/i.exec(clean($('body').text()));
  const memberSince = memberMatch ? memberMatch[1] : null;

  const found = allBadgeNodes($);
  if (!found) misses.push('badge');
  else if (found.selector !== '.profile-badge') misses.push(`badge(fallback:${found.selector})`);

  const byTitle = new Map<string, RawBadge>();
  found?.nodes.each((_, node) => {
    const scope = $(node);
    const titleHit = pick(scope, 'title', (el) => clean(el.text()).length > 0);
    if (!titleHit) {
      misses.push('title');
      return;
    }
    const title = clean(titleHit.el.text());

    const earnedHit = pick(scope, 'earned', (el) => EARNED.test(clean(el.text())));
    const earnedAt = parseEarnedDate(earnedHit ? earnedHit.el.text() : scope.text());
    if (!earnedAt) misses.push(`earned(${title})`);

    const imageHit = pick(scope, 'image');
    const imageUrl = absolute(imageHit?.el.attr('src'), baseUrl);
    const linkHit = pick(scope, 'link', (el) => !!el.attr('href'));
    const badgeUrl = absolute(linkHit?.el.attr('href'), baseUrl) || undefined;

    const badge: RawBadge = { id: hash(`${title}|${earnedAt ?? ''}`), title, imageUrl, badgeUrl, earnedAt };

    // Duplicate titles (re-earned): keep the earliest date; an undated copy loses to a dated one.
    const key = title.toLowerCase();
    const prev = byTitle.get(key);
    if (!prev) return void byTitle.set(key, badge);
    const keepNew = badge.earnedAt && (!prev.earnedAt || badge.earnedAt < prev.earnedAt);
    if (keepNew) byTitle.set(key, badge);
  });

  return {
    name,
    avatar,
    memberSince,
    badges: [...byTitle.values()],
    badgeNodeCount: found?.nodes.length ?? 0,
    misses,
  };
}
