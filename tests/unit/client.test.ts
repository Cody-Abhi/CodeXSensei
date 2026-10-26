import { afterEach, describe, expect, it, vi } from 'vitest';

import { postChat, postPlan, postRegenerateIdeas } from '../../src/client/api/client';
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

describe('postChat', () => {
  it('returns the parsed chat result', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ reply: 'Sure!' }));
    const result = await postChat(plan, 'Add vendors');
    expect(result.reply).toBe('Sure!');
  });

  it('returns chat result with a patch', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({ reply: 'Updated.', patch: { summary: 'New summary' } }),
    );
    const result = await postChat(plan, 'Change summary');
    expect(result.reply).toBe('Updated.');
    expect(result.patch?.summary).toBe('New summary');
  });

  it('throws a rate-limit message on 429', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({}, 429));
    await expect(postChat(plan, 'Hello')).rejects.toThrow(/wait a minute/i);
  });

  it('throws a generic message on non-OK responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({}, 500));
    await expect(postChat(plan, 'Hello')).rejects.toThrow(/chat failed/i);
  });

  it('throws a connection message when fetch rejects', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
    await expect(postChat(plan, 'Hello')).rejects.toThrow(/could not reach the server/i);
  });

  it('throws when the response shape is unexpected', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ bad: true }));
    await expect(postChat(plan, 'Hello')).rejects.toThrow(/unexpected format/i);
  });
});

describe('postRegenerateIdeas', () => {
  const sampleIdeas = [
    { id: 'g-1', category: 'Games', title: 'Treasure Hunt', description: 'Fun hunt' },
    { id: 'g-2', category: 'Games', title: 'Musical Chairs', description: 'Classic game' },
  ];

  it('returns the parsed ideas', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ ideas: sampleIdeas }));
    const result = await postRegenerateIdeas(input, 'Games');
    expect(result).toHaveLength(2);
    expect(result[0]!.title).toBe('Treasure Hunt');
  });

  it('throws a rate-limit message on 429', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({}, 429));
    await expect(postRegenerateIdeas(input, 'Games')).rejects.toThrow(/wait a minute/i);
  });

  it('throws a generic message on non-OK responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({}, 500));
    await expect(postRegenerateIdeas(input, 'Games')).rejects.toThrow(/could not regenerate/i);
  });

  it('throws a connection message when fetch rejects', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
    await expect(postRegenerateIdeas(input, 'Games')).rejects.toThrow(
      /could not reach the server/i,
    );
  });

  it('throws when the response shape is unexpected', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ ideas: 'bad' }));
    await expect(postRegenerateIdeas(input, 'Games')).rejects.toThrow(/unexpected format/i);
  });
});
