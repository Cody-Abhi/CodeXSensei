import { afterEach, describe, expect, it, vi } from 'vitest';

import { clearSavedPlan, loadPlan, savePlan } from '../../src/client/store/persistence';
import { buildFallbackPlan } from '../../src/shared/templates';
import type { EventInput } from '../../src/shared/types';

const input: EventInput = {
  type: 'birthday',
  name: 'Test',
  date: '2099-06-15',
  city: 'Pune',
  guests: 20,
  budgetMinor: 2_500_000,
  currency: 'INR',
  vibes: [],
  dietary: [],
  notes: '',
};
const plan = buildFallbackPlan(input);

afterEach(() => {
  localStorage.clear();
});

describe('persistence', () => {
  it('saves and loads a plan', () => {
    savePlan(plan, 'fallback', input);
    const loaded = loadPlan();
    expect(loaded).not.toBeNull();
    expect(loaded!.plan.summary).toBe(plan.summary);
    expect(loaded!.source).toBe('fallback');
    expect(loaded!.lastInput.name).toBe('Test');
  });

  it('returns null when nothing is stored', () => {
    expect(loadPlan()).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    localStorage.setItem('planpop_v1', 'not json');
    expect(loadPlan()).toBeNull();
  });

  it('returns null for wrong version', () => {
    localStorage.setItem('planpop_v1', JSON.stringify({ version: 99 }));
    expect(loadPlan()).toBeNull();
  });

  it('returns null for invalid plan shape', () => {
    localStorage.setItem('planpop_v1', JSON.stringify({ version: 1, plan: { bad: true } }));
    expect(loadPlan()).toBeNull();
  });

  it('clearSavedPlan removes the key', () => {
    savePlan(plan, 'ai', input);
    clearSavedPlan();
    expect(loadPlan()).toBeNull();
  });

  it('savePlan handles storage errors gracefully', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded');
    });
    expect(() => savePlan(plan, 'ai', input)).not.toThrow();
  });

  it('loadPlan handles storage errors gracefully', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(loadPlan()).toBeNull();
  });
});
