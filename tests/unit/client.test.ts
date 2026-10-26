import { afterEach, describe, expect, it, vi } from 'vitest';

import { postPlan } from '../../src/client/api/client';
import { buildFallbackPlan } from '../../src/shared/templates';
import type { EventInput } from '../../src/shared/types';

const input: EventInput = {
  type: 'wedding',
  name: 'Aisha & Rohan',
  date: '2099-02-14',
  city: 'Jaipur',
  guests: 300,
  budgetMinor: 150_000_000,
  currency: 'INR',
  vibes: [],
  dietary: [],
  notes: '',
};

const plan = buildFallbackPlan(input);

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('postPlan', () => {
  it('returns the parsed plan and source', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ plan, source: 'ai' }));
    const result = await postPlan(input);
    expect(result.source).toBe('ai');
    expect(result.plan.summary).toBe(plan.summary);
  });

  it('throws a rate-limit message on 429', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ error: 'nope' }, 429));
    await expect(postPlan(input)).rejects.toThrow(/wait a minute/i);
  });

  it('throws a generic message on other non-OK responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ error: 'boom' }, 500));
    await expect(postPlan(input)).rejects.toThrow(/could not generate/i);
  });

  it('throws a connection message when fetch rejects', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));
    await expect(postPlan(input)).rejects.toThrow(/could not reach the server/i);
  });

  it('throws when the plan shape is unexpected', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({ plan: { bad: 1 }, source: 'ai' }),
    );
    await expect(postPlan(input)).rejects.toThrow(/unexpected format/i);
  });

  it('forwards an abort signal and defaults a non-string source', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(jsonResponse({ plan, source: 123 }));
    const controller = new AbortController();
    const result = await postPlan(input, controller.signal);
    expect(result.source).toBe('ai');
    const init = fetchSpy.mock.calls[0]?.[1];
    expect(init?.signal).toBe(controller.signal);
  });
});
