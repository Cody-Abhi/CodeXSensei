import { PROFILE } from '@/config/arcade';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PATH = /^\/public_profiles\/([^/]+)\/?$/;

export type ParsedProfileUrl =
  | { ok: true; profileId: string; normalizedUrl: string }
  | { ok: false };

export function isAllowedHost(hostname: string): boolean {
  return (PROFILE.allowedHosts as readonly string[]).includes(hostname.toLowerCase());
}

export function normalizedProfileUrl(profileId: string): string {
  return `${PROFILE.canonicalOrigin}/public_profiles/${profileId}`;
}

/**
 * Validates a public profile URL and normalizes it to https://www.skills.google/public_profiles/<id>.
 * Query strings, hashes and trailing slashes are dropped. Legacy cloudskillsboost.google is accepted.
 */
export function parseProfileUrl(input: string): ParsedProfileUrl {
  const raw = input.trim();
  if (!raw || raw.length > 300) return { ok: false };
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;

  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return { ok: false };
  }
  if (url.protocol !== 'https:') return { ok: false };
  if (url.username || url.password || url.port) return { ok: false };
  if (!isAllowedHost(url.hostname)) return { ok: false };

  const match = PATH.exec(url.pathname);
  if (!match || !UUID.test(match[1])) return { ok: false };

  const profileId = match[1].toLowerCase();
  return { ok: true, profileId, normalizedUrl: normalizedProfileUrl(profileId) };
}
