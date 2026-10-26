import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildFallbackPlan } from '../../src/shared/templates';
import type { EventInput } from '../../src/shared/types';

vi.mock('../../src/client/api/client', () => ({
  postPlan: vi.fn(),
}));

import { postPlan } from '../../src/client/api/client';
import { usePlanStore } from '../../src/client/store/planStore';

const input: EventInput = {
  type: 'birthday',
  name: 'Kiaan',
  date: '2099-05-01',
  city: 'Pune',
  guests: 20,
  budgetMinor: 2_500_000,
  currency: 'INR',
  vibes: [],
  dietary: [],
  notes: '',
};

const plan = buildFallbackPlan(input);
const mockedPostPlan = vi.mocked(postPlan);

beforeEach(() => {
  usePlanStore.getState().reset();
  mockedPostPlan.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('usePlanStore.generate', () => {
  it('sets success with the returned plan', async () => {
    mockedPostPlan.mockResolvedValue({ plan, source: 'fallback' });
    await usePlanStore.getState().generate(input);
    const state = usePlanStore.getState();
    expect(state.status).toBe('success');
    expect(state.plan).toEqual(plan);
    expect(state.source).toBe('fallback');
    expect(state.lastInput).toEqual(input);
  });

  it('sets error with a message when generation fails', async () => {
    mockedPostPlan.mockRejectedValue(new Error('rate limited'));
    await usePlanStore.getState().generate(input);
    const state = usePlanStore.getState();
    expect(state.status).toBe('error');
    expect(state.error).toBe('rate limited');
    expect(state.plan).toBeNull();
  });

  it('uses a default message when a non-Error is thrown', async () => {
    mockedPostPlan.mockRejectedValue('oops');
    await usePlanStore.getState().generate(input);
    expect(usePlanStore.getState().error).toBe('Something went wrong.');
  });

  it('reset and setPlan work', () => {
    usePlanStore.getState().setPlan(plan);
    expect(usePlanStore.getState().plan).toEqual(plan);
    usePlanStore.getState().reset();
    expect(usePlanStore.getState().plan).toBeNull();
    expect(usePlanStore.getState().status).toBe('idle');
  });
});
