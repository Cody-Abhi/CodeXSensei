import type { Cheerio, CheerioAPI } from 'cheerio';

/**
 * All markup knowledge lives here. Each entry is an ordered list of fallbacks.
 * Verified against a real public profile (tests/fixtures/profile-public.html):
 *   header: <ql-avatar class="profile-avatar" src="..."> + <h1 class="ql-display-small">
 *   badge:  <div class="profile-badge"><a class="badge-image" href><img src></a>
 *           <span class="ql-title-medium">title</span><span class="ql-body-medium">Earned ...</span></div>
 */
export const SELECTORS = {
  badge: ['.profile-badge', '[class*="profile-badge"]'],
  title: ['.ql-title-medium', '[class*="title"]', 'h2', 'h3'],
  earned: ['.ql-body-medium', '[class*="body"]'],
  image: ['a.badge-image img', 'img'],
  link: ['a.badge-image', 'a[href*="/badges/"]', 'a'],
  name: ['h1.ql-display-small', 'h1'],
  avatar: ['ql-avatar.profile-avatar', 'ql-avatar', 'img.profile-avatar'],
} as const;

export type SelectorKey = keyof typeof SELECTORS;

/** Returns the first element (and the selector that hit) for which `accept` is true. */
export function pick(
  scope: Cheerio<any>,
  key: SelectorKey,
  accept: (el: Cheerio<any>) => boolean = () => true,
): { el: Cheerio<any>; selector: string } | null {
  for (const selector of SELECTORS[key]) {
    const el = scope.find(selector).first();
    if (el.length && accept(el)) return { el, selector };
  }
  return null;
}

/** First matching selector across the whole document. */
export function pickDoc($: CheerioAPI, key: SelectorKey) {
  return pick($.root(), key);
}

export function allBadgeNodes($: CheerioAPI): { nodes: Cheerio<any>; selector: string } | null {
  for (const selector of SELECTORS.badge) {
    const nodes = $(selector);
    if (nodes.length) return { nodes, selector };
  }
  return null;
}
