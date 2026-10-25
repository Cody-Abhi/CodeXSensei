import { createHash } from 'node:crypto';

import { LRUCache } from 'lru-cache';

import type { EventInput, Plan } from '../../shared/types';

/** Minimal plan cache surface (easy to fake in tests). */
export interface PlanCache {
  get(key: string): Plan | undefined;
  set(key: string, value: Plan): void;
}

/**
 * Create an in-memory LRU cache for generated plans (PRD §6 — identical
 * requests are served from cache for a TTL).
 *
 * @param options - `max` entries and `ttlMs` time-to-live.
 * @returns A {@link PlanCache}.
 */
export function createPlanCache(options: { max?: number; ttlMs?: number } = {}): PlanCache {
  const cache = new LRUCache<string, Plan>({
    max: options.max ?? 100,
    ttl: options.ttlMs ?? 3_600_000,
  });
  return {
    get: (key) => cache.get(key),
    set: (key, value) => {
      cache.set(key, value);
    },
  };
}

/**
 * Deterministic cache key from normalized input, so trivially different
 * requests (case, whitespace, vibe order) share a cache entry.
 *
 * @param input - Validated event input.
 * @returns A hex SHA-256 digest.
 */
export function hashInput(input: EventInput): string {
  const normalized = {
    type: input.type,
    name: input.name.trim().toLowerCase(),
    date: input.date,
    city: input.city.trim().toLowerCase(),
    guests: input.guests,
    budgetMinor: input.budgetMinor,
    currency: input.currency,
    vibes: [...input.vibes].map((v) => v.trim().toLowerCase()).sort(),
    dietary: [...input.dietary].map((d) => d.trim().toLowerCase()).sort(),
    notes: input.notes.trim().toLowerCase(),
  };
  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
}
