import { describe, expect, it, vi } from 'vitest';

import type { GeminiJsonClient } from '../../src/server/services/gemini';
import { createChatService } from '../../src/server/services/chatService';
import { buildFallbackPlan } from '../../src/shared/templates';
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
const plan = buildFallbackPlan(input);

describe('createChatService', () => {
  it('returns a fallback message when no client is provided', async () => {
    const service = createChatService({ client: null });
    const result = await service.chat(plan, 'Hello');
    expect(result.reply).toMatch(/gemini api/i);
  });

  it('returns the parsed Gemini response on success', async () => {
    const client: GeminiJsonClient = {
      generateJson: vi.fn(async () => ({ reply: 'Sure, updated!' })),
    };
    const service = createChatService({ client });
    const result = await service.chat(plan, 'Add more games');
    expect(result.reply).toBe('Sure, updated!');
  });

  it('returns the parsed response with a patch', async () => {
    const client: GeminiJsonClient = {
      generateJson: vi.fn(async () => ({
        reply: 'Updated summary.',
        patch: { summary: 'New summary text' },
      })),
    };
    const service = createChatService({ client });
    const result = await service.chat(plan, 'Change summary');
    expect(result.reply).toBe('Updated summary.');
    expect(result.patch?.summary).toBe('New summary text');
  });

  it('returns a fallback message when Gemini returns invalid JSON', async () => {
    const client: GeminiJsonClient = {
      generateJson: vi.fn(async () => ({ bad: 'data' })),
    };
    const service = createChatService({ client });
    const result = await service.chat(plan, 'Hello');
    expect(result.reply).toMatch(/trouble understanding/i);
  });

  it('returns a fallback message when the client throws', async () => {
    const client: GeminiJsonClient = {
      generateJson: vi.fn(async () => {
        throw new Error('timeout');
      }),
    };
    const service = createChatService({ client });
    const result = await service.chat(plan, 'Hello');
    expect(result.reply).toMatch(/something went wrong/i);
  });
});
