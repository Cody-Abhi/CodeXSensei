import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildFallbackPlan } from '../../src/shared/templates';
import type { EventInput } from '../../src/shared/types';

vi.mock('../../src/client/api/client', () => ({
  postPlan: vi.fn(),
  postChat: vi.fn(),
  postRegenerateIdeas: vi.fn(),
}));

import { postChat, postPlan, postRegenerateIdeas } from '../../src/client/api/client';
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
const mockedPostChat = vi.mocked(postChat);
const mockedPostRegenerateIdeas = vi.mocked(postRegenerateIdeas);

beforeEach(() => {
  usePlanStore.getState().reset();
  mockedPostPlan.mockReset();
  mockedPostChat.mockReset();
  mockedPostRegenerateIdeas.mockReset();
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

describe('usePlanStore.sendChat', () => {
  it('adds user and assistant messages on success', async () => {
    usePlanStore.setState({ plan, status: 'success', lastInput: input });
    mockedPostChat.mockResolvedValue({ reply: 'Done!' });
    await usePlanStore.getState().sendChat('Hello');
    const state = usePlanStore.getState();
    expect(state.chatMessages).toHaveLength(2);
    expect(state.chatMessages[0]!.role).toBe('user');
    expect(state.chatMessages[0]!.text).toBe('Hello');
    expect(state.chatMessages[1]!.role).toBe('assistant');
    expect(state.chatMessages[1]!.text).toBe('Done!');
    expect(state.chatLoading).toBe(false);
  });

  it('sets pendingPatch when reply includes a patch', async () => {
    usePlanStore.setState({ plan, status: 'success', lastInput: input });
    mockedPostChat.mockResolvedValue({ reply: 'Updated.', patch: { summary: 'New' } });
    await usePlanStore.getState().sendChat('Change summary');
    expect(usePlanStore.getState().pendingPatch).toEqual({ summary: 'New' });
  });

  it('handles errors gracefully', async () => {
    usePlanStore.setState({ plan, status: 'success', lastInput: input });
    mockedPostChat.mockRejectedValue(new Error('Network down'));
    await usePlanStore.getState().sendChat('Hello');
    const state = usePlanStore.getState();
    expect(state.chatMessages).toHaveLength(2);
    expect(state.chatMessages[1]!.text).toBe('Network down');
    expect(state.chatLoading).toBe(false);
  });

  it('does nothing when plan is null', async () => {
    await usePlanStore.getState().sendChat('Hello');
    expect(mockedPostChat).not.toHaveBeenCalled();
  });
});

describe('usePlanStore.acceptPatch / rejectPatch', () => {
  it('acceptPatch merges the pending patch into the plan', () => {
    usePlanStore.setState({ plan, pendingPatch: { summary: 'Patched!' } });
    usePlanStore.getState().acceptPatch();
    const state = usePlanStore.getState();
    expect(state.plan!.summary).toBe('Patched!');
    expect(state.pendingPatch).toBeNull();
  });

  it('rejectPatch clears the pending patch', () => {
    usePlanStore.setState({ plan, pendingPatch: { summary: 'Patched!' } });
    usePlanStore.getState().rejectPatch();
    const state = usePlanStore.getState();
    expect(state.plan!.summary).toBe(plan.summary);
    expect(state.pendingPatch).toBeNull();
  });

  it('acceptPatch does nothing when no plan', () => {
    usePlanStore.setState({ plan: null, pendingPatch: { summary: 'X' } });
    usePlanStore.getState().acceptPatch();
    expect(usePlanStore.getState().plan).toBeNull();
  });
});

describe('usePlanStore.applyPatch', () => {
  it('applies an arbitrary patch to the plan', () => {
    usePlanStore.setState({ plan });
    usePlanStore.getState().applyPatch({ summary: 'Direct patch' });
    expect(usePlanStore.getState().plan!.summary).toBe('Direct patch');
  });

  it('does nothing when plan is null', () => {
    usePlanStore.getState().applyPatch({ summary: 'X' });
    expect(usePlanStore.getState().plan).toBeNull();
  });
});

describe('usePlanStore.replaceIdeas', () => {
  it('replaces ideas for a specific category', () => {
    usePlanStore.setState({ plan });
    const newIdeas = [
      { id: 'new-1', category: 'Activities', title: 'New Activity', description: 'Fun' },
    ];
    usePlanStore.getState().replaceIdeas('Activities', newIdeas);
    const ideas = usePlanStore.getState().plan!.ideas;
    const activityIdeas = ideas.filter((i) => i.category === 'Activities');
    expect(activityIdeas).toHaveLength(1);
    expect(activityIdeas[0]!.title).toBe('New Activity');
  });

  it('does nothing when plan is null', () => {
    usePlanStore.getState().replaceIdeas('Activities', []);
    expect(usePlanStore.getState().plan).toBeNull();
  });
});

describe('usePlanStore.regenerateIdeas', () => {
  it('calls API and replaces ideas on success', async () => {
    usePlanStore.setState({ plan, status: 'success', lastInput: input });
    const newIdeas = [
      { id: 'r-1', category: 'Activities', title: 'Refreshed', description: 'New' },
    ];
    mockedPostRegenerateIdeas.mockResolvedValue(newIdeas);
    await usePlanStore.getState().regenerateIdeas('Activities');
    const state = usePlanStore.getState();
    expect(state.ideasLoading).toBe(false);
    const activityIdeas = state.plan!.ideas.filter((i) => i.category === 'Activities');
    expect(activityIdeas).toHaveLength(1);
    expect(activityIdeas[0]!.title).toBe('Refreshed');
  });

  it('keeps old ideas on API failure', async () => {
    usePlanStore.setState({ plan, status: 'success', lastInput: input });
    const originalIdeas = [...plan.ideas];
    mockedPostRegenerateIdeas.mockRejectedValue(new Error('fail'));
    await usePlanStore.getState().regenerateIdeas('Activities');
    const state = usePlanStore.getState();
    expect(state.ideasLoading).toBe(false);
    expect(state.plan!.ideas).toEqual(originalIdeas);
  });

  it('does nothing when lastInput is null', async () => {
    usePlanStore.setState({ plan, status: 'success', lastInput: null });
    await usePlanStore.getState().regenerateIdeas('Activities');
    expect(mockedPostRegenerateIdeas).not.toHaveBeenCalled();
  });
});

describe('usePlanStore budget/milestone/vendor actions with null plan', () => {
  it('updateBudgetItem does nothing when plan is null', () => {
    usePlanStore.getState().updateBudgetItem(0, 5000);
    expect(usePlanStore.getState().plan).toBeNull();
  });

  it('toggleMilestoneDone does nothing when plan is null', () => {
    usePlanStore.getState().toggleMilestoneDone('m-1');
    expect(usePlanStore.getState().plan).toBeNull();
  });

  it('cycleVendorStatus does nothing when plan is null', () => {
    usePlanStore.getState().cycleVendorStatus('v-1');
    expect(usePlanStore.getState().plan).toBeNull();
  });

  it('sendChat handles non-Error rejection', async () => {
    usePlanStore.setState({ plan, status: 'success', lastInput: input });
    mockedPostChat.mockRejectedValue('string error');
    await usePlanStore.getState().sendChat('Hello');
    const state = usePlanStore.getState();
    expect(state.chatMessages[1]!.text).toBe('Something went wrong.');
  });
});
