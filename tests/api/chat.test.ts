import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../../src/server/app';
import { createAiRateLimiter } from '../../src/server/middleware/rateLimit';
import type { ChatService } from '../../src/server/services/chatService';
import { buildFallbackPlan } from '../../src/shared/templates';
import type { EventInput } from '../../src/shared/types';

const validInput: EventInput = {
  type: 'wedding',
  name: 'Aisha & Rohan',
  date: '2099-02-14',
  city: 'Jaipur',
  guests: 300,
  budgetMinor: 150_000_000,
  currency: 'INR',
  vibes: ['traditional'],
  dietary: [],
  notes: '',
};

const plan = buildFallbackPlan(validInput);

function appWith(chatService: ChatService, limiterPerMin = 100) {
  return createApp({
    clientDir: '/no/such/dir',
    chatService,
    aiRateLimit: createAiRateLimiter(limiterPerMin),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /api/chat', () => {
  it('returns a chat reply for valid input', async () => {
    const chatService: ChatService = {
      chat: vi.fn(async () => ({ reply: 'Sure, I can help with that!' })),
    };
    const res = await request(appWith(chatService))
      .post('/api/chat')
      .send({ plan, message: 'Add more vendors' });
    expect(res.status).toBe(200);
    expect(res.body.reply).toBe('Sure, I can help with that!');
  });

  it('returns a reply with a patch when changes are suggested', async () => {
    const chatService: ChatService = {
      chat: vi.fn(async () => ({
        reply: 'Updated the summary.',
        patch: { summary: 'New summary text' },
      })),
    };
    const res = await request(appWith(chatService))
      .post('/api/chat')
      .send({ plan, message: 'Change the summary' });
    expect(res.status).toBe(200);
    expect(res.body.reply).toBe('Updated the summary.');
    expect(res.body.patch.summary).toBe('New summary text');
  });

  it('rejects missing message with 400', async () => {
    const chatService: ChatService = { chat: vi.fn() };
    const res = await request(appWith(chatService)).post('/api/chat').send({ plan });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('rejects missing plan with 400', async () => {
    const chatService: ChatService = { chat: vi.fn() };
    const res = await request(appWith(chatService)).post('/api/chat').send({ message: 'Hello' });
    expect(res.status).toBe(400);
  });

  it('returns 429 when rate-limited', async () => {
    const chatService: ChatService = {
      chat: vi.fn(async () => ({ reply: 'ok' })),
    };
    const app = appWith(chatService, 1);
    await request(app).post('/api/chat').send({ plan, message: 'Test' });
    const res = await request(app).post('/api/chat').send({ plan, message: 'Test again' });
    expect(res.status).toBe(429);
  });
});
