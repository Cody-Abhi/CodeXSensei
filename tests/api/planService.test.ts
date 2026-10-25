import { describe, expect, it, vi } from 'vitest';

import { createPlanCache } from '../../src/server/services/cache';
import type { GeminiJsonClient } from '../../src/server/services/gemini';
import { createPlanService } from '../../src/server/services/planService';
import { sumMinor } from '../../src/shared/money';
import { buildFallbackPlan } from '../../src/shared/templates';
import type { EventInput, Plan } from '../../src/shared/types';

const input: EventInput = {
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

/** A valid plan whose budget deliberately does NOT sum to the input budget. */
function skewedValidPlan(): Plan {
  const plan = buildFallbackPlan(input);
  return { ...plan, budget: plan.budget.map((b) => ({ ...b, amountMinor: 1 })) };
}

function clientReturning(values: unknown[]): GeminiJsonClient & { calls: number } {
  let calls = 0;
  const client = {
    get calls() {
      return calls;
    },
    generateJson: vi.fn(async () => {
      const value = values[Math.min(calls, values.length - 1)];
      calls += 1;
      return value;
    }),
  };
  return client as unknown as GeminiJsonClient & { calls: number };
}

describe('createPlanService', () => {
  it('returns an AI plan and re-normalises the budget to the exact total', async () => {
    const client = clientReturning([skewedValidPlan()]);
    const service = createPlanService({ client, cache: createPlanCache() });
    const result = await service.generate(input);
    expect(result.source).toBe('ai');
    expect(sumMinor(result.plan.budget.map((b) => b.amountMinor))).toBe(input.budgetMinor);
  });

  it('repairs once when the first response is invalid', async () => {
    const client = clientReturning([{ not: 'a plan' }, skewedValidPlan()]);
    const service = createPlanService({ client, cache: createPlanCache() });
    const result = await service.generate(input);
    expect(result.source).toBe('ai-repair');
    expect(client.calls).toBe(2);
  });

  it('falls back to the local template when both attempts are invalid', async () => {
    const client = clientReturning([{ bad: 1 }, { bad: 2 }]);
    const service = createPlanService({ client, cache: createPlanCache() });
    const result = await service.generate(input);
    expect(result.source).toBe('fallback');
  });

  it('falls back when the client throws', async () => {
    const client: GeminiJsonClient = {
      generateJson: vi.fn(async () => {
        throw new Error('network');
      }),
    };
    const service = createPlanService({ client, cache: createPlanCache() });
    expect((await service.generate(input)).source).toBe('fallback');
  });

  it('falls back on timeout', async () => {
    const client: GeminiJsonClient = {
      generateJson: () => new Promise<unknown>(() => undefined), // never resolves
    };
    const service = createPlanService({ client, cache: createPlanCache(), timeoutMs: 20 });
    expect((await service.generate(input)).source).toBe('fallback');
  });

  it('uses the local fallback when no client is configured', async () => {
    const service = createPlanService({ client: null, cache: createPlanCache() });
    expect((await service.generate(input)).source).toBe('fallback');
  });

  it('serves repeated identical requests from cache', async () => {
    const client = clientReturning([skewedValidPlan()]);
    const service = createPlanService({ client, cache: createPlanCache() });
    await service.generate(input);
    await service.generate({ ...input, name: '  aisha & ROHAN ' }); // same normalised key
    expect(client.calls).toBe(1);
  });
});
