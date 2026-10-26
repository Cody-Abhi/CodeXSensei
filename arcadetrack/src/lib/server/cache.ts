import { FETCH } from '@/config/arcade';
import type { ProfilePayload } from '@/lib/types';

const store = new Map<string, { at: number; data: ProfilePayload }>();

export function cacheGet(id: string) {
  const hit = store.get(id);
  if (!hit) return null;
  if (Date.now() - hit.at > FETCH.cacheTtlMs) {
    store.delete(id);
    return null;
  }
  // refresh recency for LRU
  store.delete(id);
  store.set(id, hit);
  return hit;
}

export function cacheSet(id: string, data: ProfilePayload) {
  store.delete(id);
  store.set(id, { at: Date.now(), data });
  while (store.size > FETCH.cacheMaxEntries) {
    const oldest = store.keys().next().value;
    if (oldest === undefined) break;
    store.delete(oldest);
  }
}

const hits = new Map<string, number[]>();

/** Sliding-window limiter: FETCH.rateLimit.max requests per window per key. */
export function rateLimitAllow(key: string, now = Date.now()): boolean {
  const { max, windowMs } = FETCH.rateLimit;
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
  return true;
}
