import { readFile } from 'node:fs/promises';
import { FETCH } from '@/config/arcade';
import { ApiError } from '@/lib/errors';
import { parseProfileHtml } from '@/lib/parseProfile';
import type { ProfilePayload } from '@/lib/types';
import { isAllowedHost, normalizedProfileUrl } from '@/lib/url';

/** GET with manual redirects so every hop is re-checked against the host allowlist (SSRF guard). */
async function fetchHtml(startUrl: string): Promise<{ html: string; finalUrl: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH.timeoutMs);
  try {
    let url = startUrl;
    for (let hop = 0; hop <= FETCH.maxRedirects; hop++) {
      const u = new URL(url);
      if (u.protocol !== 'https:' || !isAllowedHost(u.hostname)) {
        throw new ApiError('PROFILE_PRIVATE_OR_NOT_FOUND', 'Profile redirected to a page we cannot read.');
      }
      const res = await fetch(url, {
        redirect: 'manual',
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'User-Agent': FETCH.userAgent,
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get('location');
        if (!loc) throw new ApiError('UPSTREAM_ERROR', 'Redirect without a location.');
        url = new URL(loc, url).toString();
        continue;
      }
      if (res.status === 404 || res.status === 403 || res.status === 410) {
        throw new ApiError('PROFILE_PRIVATE_OR_NOT_FOUND', 'Profile is private or does not exist.');
      }
      if (res.status === 429) throw new ApiError('RATE_LIMITED', 'The upstream site is rate limiting us. Try again shortly.');
      if (!res.ok) throw new ApiError('UPSTREAM_ERROR', `Upstream responded with ${res.status}.`);
      return { html: await res.text(), finalUrl: url };
    }
    throw new ApiError('PROFILE_PRIVATE_OR_NOT_FOUND', 'Too many redirects (profile is likely private).');
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if (e instanceof Error && e.name === 'AbortError') throw new ApiError('FETCH_TIMEOUT', 'Fetching the profile timed out.');
    throw new ApiError('UPSTREAM_ERROR', 'Could not reach the profile page.');
  } finally {
    clearTimeout(timer);
  }
}

async function readHtml(profileId: string): Promise<{ html: string; finalUrl: string }> {
  const target = normalizedProfileUrl(profileId);
  // Dev-only escape hatch so the UI can be exercised without outbound access to skills.google.
  const fixture = process.env.NODE_ENV !== 'production' ? process.env.ARCADETRACK_FIXTURE : undefined;
  if (fixture) return { html: await readFile(fixture, 'utf8'), finalUrl: target };
  return fetchHtml(target);
}

export function toPayload(profileId: string, html: string, finalUrl: string): ProfilePayload {
  const parsed = parseProfileHtml(html, finalUrl);
  if (parsed.misses.length) {
    console.warn(`[arcadetrack] selector misses for ${profileId}: ${parsed.misses.slice(0, 10).join(', ')}`);
  }
  const path = new URL(finalUrl).pathname;
  if (!path.includes('/public_profiles/')) {
    throw new ApiError('PROFILE_PRIVATE_OR_NOT_FOUND', 'Profile is private or does not exist.');
  }
  // No name and no badges: the page is not a public profile (private profiles land on a generic page).
  if (!parsed.name && parsed.badgeNodeCount === 0) {
    throw new ApiError('PROFILE_PRIVATE_OR_NOT_FOUND', 'Profile is private or does not exist.');
  }
  // The page claims badges but we extracted none: markup changed.
  if (parsed.badges.length === 0 && /\bEarned\s+[A-Z][a-z]{2}/.test(html)) {
    throw new ApiError('PARSE_FAILED', 'Could not read badges from this profile (page layout may have changed).');
  }
  if (!parsed.name) throw new ApiError('PARSE_FAILED', 'Could not read the profile name.');

  return {
    profileId,
    name: parsed.name,
    avatar: parsed.avatar,
    memberSince: parsed.memberSince,
    fetchedAt: new Date().toISOString(),
    stats: parsed.stats,
    badges: parsed.badges,
  };
}

export async function loadProfile(profileId: string): Promise<ProfilePayload> {
  const { html, finalUrl } = await readHtml(profileId);
  return toPayload(profileId, html, finalUrl);
}
