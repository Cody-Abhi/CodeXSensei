import { create } from 'zustand';

import type { EventInput, Plan, VendorStatus } from '../../shared/types';
import { postPlan } from '../api/client';

/** Generation lifecycle status. */
export type PlanStatus = 'idle' | 'loading' | 'success' | 'error';

interface PlanState {
  plan: Plan | null;
  source: string | null;
  status: PlanStatus;
  error: string | null;
  lastInput: EventInput | null;
  /** Generate a plan for the given input, updating status as it goes. */
  generate: (input: EventInput) => Promise<void>;
  /** Replace the current plan (used by later editing features). */
  setPlan: (plan: Plan) => void;
  /** Clear everything back to idle. */
  reset: () => void;
  /** Update a single budget item's amount. */
  updateBudgetItem: (index: number, amountMinor: number) => void;
  /** Toggle a milestone's done state. */
  toggleMilestoneDone: (id: string) => void;
  /** Cycle a vendor through to_find → contacted → booked → to_find. */
  cycleVendorStatus: (id: string) => void;
}

/** Global store for the active plan and its generation status. */
export const usePlanStore = create<PlanState>((set) => ({
  plan: null,
  source: null,
  status: 'idle',
  error: null,
  lastInput: null,
  generate: async (input) => {
    set({ status: 'loading', error: null, lastInput: input });
    try {
      const { plan, source } = await postPlan(input);
      set({ plan, source, status: 'success' });
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'Something went wrong.',
      });
    }
  },
  setPlan: (plan) => set({ plan }),
  reset: () => set({ plan: null, source: null, status: 'idle', error: null, lastInput: null }),
  updateBudgetItem: (index, amountMinor) => {
    set((state) => {
      if (!state.plan) return {};
      const budget = state.plan.budget.map((item, i) =>
        i === index ? { ...item, amountMinor } : item,
      );
      return { plan: { ...state.plan, budget } };
    });
  },
  toggleMilestoneDone: (id) => {
    set((state) => {
      if (!state.plan) return {};
      const timeline = state.plan.timeline.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item,
      );
      return { plan: { ...state.plan, timeline } };
    });
  },
  cycleVendorStatus: (id) => {
    const NEXT: Record<VendorStatus, VendorStatus> = {
      to_find: 'contacted',
      contacted: 'booked',
      booked: 'to_find',
    };
    set((state) => {
      if (!state.plan) return {};
      const vendors = state.plan.vendors.map((v) =>
        v.id === id ? { ...v, status: NEXT[v.status] } : v,
      );
      return { plan: { ...state.plan, vendors } };
    });
  },
}));
