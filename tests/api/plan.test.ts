import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../../src/server/app';
import { createAiRateLimiter } from '../../src/server/middleware/rateLimit';
import type { PlanGenerator } from '../../src/server/routes/plan';
import { buildFallbackPlan } from '../../src/shared/templates';
import type { EventInput } from '../../src/shared/types';

const validBody: EventInput = {
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

const plan = buildFallbackPlan(validBody);

function appWith(planService: PlanGenerator, limiterPerMin = 100) {
  return createApp({
    clientDir: '/no/such/dir',
    planService,
    aiRateLimit: createAiRateLimiter(limiterPerMin),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /api/plan', () => {
  it('returns a generated plan for valid input', async () => {
    const planService: PlanGenerator = {
      generate: vi.fn(async () => ({ plan, source: 'ai' as const })),
    };
    const res = await request(appWith(planService)).post('/api/plan').send(validBody);
    expect(res.status).toBe(200);
    expect(res.body.source).toBe('ai');
    expect(res.body.plan.summary).toBe(plan.summary);
  });

  it('rejects invalid input with 400 and field issues', async () => {
    const planService: PlanGenerator = { generate: vi.fn() };
    const res = await request(appWith(planService))
      .post('/api/plan')
      .send({ ...validBody, date: '2000-01-01', guests: 0 });
    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.issues)).toBe(true);
    expect(planService.generate).not.toHaveBeenCalled();
  });

  it('rate-limits with a friendly 429', async () => {
    const planService: PlanGenerator = {
      generate: vi.fn(async () => ({ plan, source: 'ai' as const })),
    };
    const app = appWith(planService, 1);
    const first = await request(app).post('/api/plan').send(validBody);
    const second = await request(app).post('/api/plan').send(validBody);
    expect(first.status).toBe(200);
    expect(second.status).toBe(429);
    expect(second.body.error).toMatch(/too many requests/i);
  });

  it('never leaks internals when the service throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const planService: PlanGenerator = {
      generate: vi.fn(async () => {
        throw new Error('AIzaSecretKey exploded while calling Gemini');
      }),
    };
    const res = await request(appWith(planService)).post('/api/plan').send(validBody);
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal server error' });
    expect(JSON.stringify(res.body)).not.toMatch(/AIza/);
  });
});
