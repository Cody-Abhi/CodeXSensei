import { describe, expect, it } from 'vitest';

import { createPlanCache, hashInput } from '../../src/server/services/cache';
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
  vibes: ['traditional', 'luxe'],
  dietary: ['vegetarian'],
  notes: 'Haldi',
};

describe('createPlanCache', () => {
  it('stores and retrieves plans', () => {
    const cache = createPlanCache({ max: 10 });
    const plan = buildFallbackPlan(input);
    expect(cache.get('k')).toBeUndefined();
    cache.set('k', plan);
    expect(cache.get('k')).toEqual(plan);
  });
});

describe('hashInput', () => {
  it('is stable across case, whitespace and vibe order', () => {
    const a = hashInput(input);
    const b = hashInput({
      ...input,
      name: '  AISHA & ROHAN ',
      city: 'JAIPUR',
      vibes: ['luxe', 'traditional'],
      notes: 'HALDI',
    });
    expect(a).toBe(b);
  });

  it('differs when a meaningful field changes', () => {
    expect(hashInput(input)).not.toBe(hashInput({ ...input, budgetMinor: 1 }));
    expect(hashInput(input)).not.toBe(hashInput({ ...input, type: 'birthday' }));
  });
});
