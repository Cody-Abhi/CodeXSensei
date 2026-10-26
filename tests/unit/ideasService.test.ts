import { describe, expect, it, vi } from 'vitest';

import type { GeminiJsonClient } from '../../src/server/services/gemini';
import { createIdeasService } from '../../src/server/services/ideasService';
import type { EventInput } from '../../src/shared/types';

const input: EventInput = {
  type: 'birthday',
  name: 'Kiaan 7th',
  date: '2099-06-15',
  city: 'Pune',
  guests: 20,
  budgetMinor: 2_500_000,
  currency: 'INR',
  vibes: ['playful'],
  dietary: [],
  notes: '',
};

describe('createIdeasService', () => {
  it('returns fallback ideas when no client is provided', async () => {
    const service = createIdeasService({ client: null });
    const result = await service.regenerate(input, 'Activities');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]!.category).toBe('Activities');
  });

  it('returns fallback slice when no client and category not found', async () => {
    const service = createIdeasService({ client: null });
    const result = await service.regenerate(input, 'NonexistentCategory');
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('returns parsed Gemini ideas on success', async () => {
    const sampleIdeas = [
      { id: 'act-1', category: 'Activities', title: 'Treasure Hunt', description: 'Fun hunt' },
      { id: 'act-2', category: 'Activities', title: 'Relay Race', description: 'Team race' },
    ];
    const client: GeminiJsonClient = {
      generateJson: vi.fn(async () => ({ ideas: sampleIdeas })),
    };
    const service = createIdeasService({ client });
    const result = await service.regenerate(input, 'Activities');
    expect(result).toHaveLength(2);
    expect(result[0]!.title).toBe('Treasure Hunt');
  });

  it('returns fallback when Gemini returns invalid data', async () => {
    const client: GeminiJsonClient = {
      generateJson: vi.fn(async () => ({ ideas: 'bad' })),
    };
    const service = createIdeasService({ client });
    const result = await service.regenerate(input, 'Activities');
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('returns fallback when the client throws', async () => {
    const client: GeminiJsonClient = {
      generateJson: vi.fn(async () => {
        throw new Error('timeout');
      }),
    };
    const service = createIdeasService({ client });
    const result = await service.regenerate(input, 'Activities');
    expect(result.length).toBeGreaterThan(0);
  });
});
