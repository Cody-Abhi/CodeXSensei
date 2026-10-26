import { FETCH } from '@/config/arcade';
import { ApiError } from '@/lib/errors';
import { cacheGet, cacheSet, rateLimitAllow } from '@/lib/server/cache';
import { loadProfile } from '@/lib/server/loadProfile';
import { parseProfileUrl } from '@/lib/url';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function fail(e: ApiError) {
  return Response.json({ error: { code: e.code, message: e.message } }, { status: e.status });
}

function clientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

export async function GET(req: Request) {
  if (!rateLimitAllow(clientIp(req))) {
    return fail(new ApiError('RATE_LIMITED', 'Too many requests. Please wait a minute and try again.'));
  }

  const params = new URL(req.url).searchParams;
  const parsed = parseProfileUrl(params.get('url') ?? '');
  if (!parsed.ok) {
    return fail(new ApiError('INVALID_URL', 'Enter a public profile URL like https://www.skills.google/public_profiles/<id>.'));
  }

  const refresh = params.get('refresh') === '1';
  const cached = cacheGet(parsed.profileId);
  if (cached && (!refresh || Date.now() - cached.at < FETCH.refreshMinAgeMs)) {
    return Response.json(cached.data, { headers: { 'X-Cache': 'HIT' } });
  }

  try {
    const data = await loadProfile(parsed.profileId);
    cacheSet(parsed.profileId, data);
    return Response.json(data, { headers: { 'X-Cache': 'MISS' } });
  } catch (e) {
    if (e instanceof ApiError) return fail(e);
    console.error('[arcadetrack] unexpected error', e);
    return fail(new ApiError('UPSTREAM_ERROR', 'Something went wrong while loading the profile.'));
  }
}
