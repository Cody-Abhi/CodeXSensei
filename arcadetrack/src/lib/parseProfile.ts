import { load } from 'cheerio';
import { hash } from './hash';
import { POINTS } from '@/config/arcade';
import { allBadgeNodes, pick, pickDoc, SELECTORS } from './selectors';
import type { ProfileStats, RawBadge } from './types';

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
  stats: ProfileStats;
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

function statedPoints(description: string | undefined): number | undefined {
  const m = description ? POINTS.statedPointsPattern.exec(description) : null;
  return m ? Number(m[1]) : undefined;
}

const BADGE_ID = /\/badges\/(\d+)/;

function catalogOf(href: string | undefined): 'games' | 'courses' | undefined {
  if (!href) return undefined;
  if (/^\/?games\/|\/games\/\d+/.test(href)) return 'games';
  if (/course_templates\/|\/courses?\//.test(href)) return 'courses';
  return undefined;
}

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

  const dialogs = new Map<string, { description: string; href?: string }>();
  for (const selector of SELECTORS.dialog) {
    $(selector).each((_, el) => {
      const d = $(el);
      const id = d.attr('id');
      if (!id || dialogs.has(id)) return;
      const description = clean(d.find('p').map((__, p) => $(p).text()).get().join(' '));
      const link = pick(d, 'dialogLink', (l) => !!l.attr('href'));
      dialogs.set(id, { description, href: link?.el.attr('href') });
    });
    if (dialogs.size) break;
  }

  const leagues: string[] = [];
  $(SELECTORS.section[0]).each((_, el) => {
    const text = clean($(el).prevAll('h2').first().text());
    if (text && !leagues.includes(text)) leagues.push(text);
  });

  let parsedNodes = 0;
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

    const modalId = pick(scope, 'modalRef')?.el.attr('modal');
    const dialog = modalId ? dialogs.get(modalId) : undefined;
    if (!dialog) misses.push(`modal(${title})`);
    const league = clean(scope.closest(SELECTORS.section[0]).prevAll('h2').first().text()) || undefined;

    const badge: RawBadge = {
      id: hash(`${title}|${earnedAt ?? ''}`),
      title,
      imageUrl,
      badgeUrl,
      earnedAt,
      description: dialog?.description || undefined,
      learnMoreUrl: absolute(dialog?.href, baseUrl) || undefined,
      catalog: catalogOf(dialog?.href),
      league,
      externalId: badgeUrl ? BADGE_ID.exec(badgeUrl)?.[1] : undefined,
      statedPoints: statedPoints(dialog?.description),
    };
    parsedNodes++;

    // Duplicate titles (re-earned): keep the earliest date; an undated copy loses to a dated one.
    const key = title.toLowerCase();
    const prev = byTitle.get(key);
    if (!prev) return void byTitle.set(key, badge);
    const keepNew = badge.earnedAt && (!prev.earnedAt || badge.earnedAt < prev.earnedAt);
    if (keepNew) byTitle.set(key, badge);
  });

  const badges = [...byTitle.values()];
  return {
    name,
    avatar,
    memberSince,
    badges,
    badgeNodeCount: found?.nodes.length ?? 0,
    stats: { foundOnPage: found?.nodes.length ?? 0, duplicatesMerged: parsedNodes - badges.length, leagues },
    misses,
  };
}
