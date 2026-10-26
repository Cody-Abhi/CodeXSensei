import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../../src/server/app';
import { createAiRateLimiter } from '../../src/server/middleware/rateLimit';
import type { IdeasService } from '../../src/server/services/ideasService';
import type { EventInput, Idea } from '../../src/shared/types';

const validInput: EventInput = {
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

const sampleIdeas: Idea[] = [
  { id: 'games-1', category: 'Games', title: 'Treasure Hunt', description: 'A fun treasure hunt' },
  { id: 'games-2', category: 'Games', title: 'Musical Chairs', description: 'Classic party game' },
];

function appWith(ideasService: IdeasService, limiterPerMin = 100) {
  return createApp({
    clientDir: '/no/such/dir',
    ideasService,
    aiRateLimit: createAiRateLimiter(limiterPerMin),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /api/ideas/regenerate', () => {
  it('returns regenerated ideas for a valid request', async () => {
    const ideasService: IdeasService = {
      regenerate: vi.fn(async () => sampleIdeas),
    };
    const res = await request(appWith(ideasService))
      .post('/api/ideas/regenerate')
      .send({ eventInput: validInput, category: 'Games' });
    expect(res.status).toBe(200);
    expect(res.body.ideas).toHaveLength(2);
    expect(res.body.ideas[0].title).toBe('Treasure Hunt');
  });

  it('rejects missing category with 400', async () => {
    const ideasService: IdeasService = { regenerate: vi.fn() };
    const res = await request(appWith(ideasService))
      .post('/api/ideas/regenerate')
      .send({ eventInput: validInput });
    expect(res.status).toBe(400);
  });

  it('rejects missing eventInput with 400', async () => {
    const ideasService: IdeasService = { regenerate: vi.fn() };
    const res = await request(appWith(ideasService))
      .post('/api/ideas/regenerate')
      .send({ category: 'Games' });
    expect(res.status).toBe(400);
  });

  it('returns 429 when rate-limited', async () => {
    const ideasService: IdeasService = {
      regenerate: vi.fn(async () => sampleIdeas),
    };
    const app = appWith(ideasService, 1);
    await request(app)
      .post('/api/ideas/regenerate')
      .send({ eventInput: validInput, category: 'Games' });
    const res = await request(app)
      .post('/api/ideas/regenerate')
      .send({ eventInput: validInput, category: 'Games' });
    expect(res.status).toBe(429);
  });
});
