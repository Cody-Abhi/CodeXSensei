import { create } from 'zustand';

import type { EventInput, Plan } from '../../shared/types';
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
}));
