import { create } from 'zustand';

import type {
  ChatResult,
  EventInput,
  Idea,
  Plan,
  PlanPatch,
  VendorStatus,
} from '../../shared/types';
import { postChat, postPlan, postRegenerateIdeas } from '../api/client';
import { clearSavedPlan, loadPlan, savePlan } from './persistence';

/** Generation lifecycle status. */
export type PlanStatus = 'idle' | 'loading' | 'success' | 'error';

/** A single chat message. */
export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  patch?: PlanPatch;
}

interface PlanState {
  plan: Plan | null;
  source: string | null;
  status: PlanStatus;
  error: string | null;
  lastInput: EventInput | null;
  chatMessages: ChatMessage[];
  chatLoading: boolean;
  pendingPatch: PlanPatch | null;
  ideasLoading: boolean;
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
  /** Send a chat message and receive a response. */
  sendChat: (message: string) => Promise<void>;
  /** Apply the pending patch to the plan. */
  acceptPatch: () => void;
  /** Discard the pending patch. */
  rejectPatch: () => void;
  /** Apply an arbitrary patch to the plan. */
  applyPatch: (patch: PlanPatch) => void;
  /** Replace ideas for a specific category. */
  replaceIdeas: (category: string, newIdeas: Idea[]) => void;
  /** Regenerate ideas for a category via the API. */
  regenerateIdeas: (category: string) => Promise<void>;
}

function mergePatch(plan: Plan, patch: PlanPatch): Plan {
  return {
    ...plan,
    ...(patch.summary !== undefined ? { summary: patch.summary } : {}),
    ...(patch.budget !== undefined ? { budget: patch.budget } : {}),
    ...(patch.timeline !== undefined ? { timeline: patch.timeline } : {}),
    ...(patch.vendors !== undefined ? { vendors: patch.vendors } : {}),
    ...(patch.ideas !== undefined ? { ideas: patch.ideas } : {}),
  };
}

/** Global store for the active plan and its generation status. */
export const usePlanStore = create<PlanState>((set, get) => ({
  plan: null,
  source: null,
  status: 'idle',
  error: null,
  lastInput: null,
  chatMessages: [],
  chatLoading: false,
  pendingPatch: null,
  ideasLoading: false,
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
  reset: () => {
    clearSavedPlan();
    set({
      plan: null,
      source: null,
      status: 'idle',
      error: null,
      lastInput: null,
      chatMessages: [],
      chatLoading: false,
      pendingPatch: null,
      ideasLoading: false,
    });
  },
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
  sendChat: async (message) => {
    const { plan } = get();
    if (!plan) return;
    const userMsg: ChatMessage = { role: 'user', text: message };
    set((s) => ({ chatMessages: [...s.chatMessages, userMsg], chatLoading: true }));
    try {
      const result: ChatResult = await postChat(plan, message);
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        text: result.reply,
        patch: result.patch,
      };
      set((s) => ({
        chatMessages: [...s.chatMessages, assistantMsg],
        chatLoading: false,
        pendingPatch: result.patch ?? null,
      }));
    } catch (err) {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        text: err instanceof Error ? err.message : 'Something went wrong.',
      };
      set((s) => ({
        chatMessages: [...s.chatMessages, errorMsg],
        chatLoading: false,
      }));
    }
  },
  acceptPatch: () => {
    set((state) => {
      if (!state.plan || !state.pendingPatch) return {};
      return { plan: mergePatch(state.plan, state.pendingPatch), pendingPatch: null };
    });
  },
  rejectPatch: () => {
    set({ pendingPatch: null });
  },
  applyPatch: (patch) => {
    set((state) => {
      if (!state.plan) return {};
      return { plan: mergePatch(state.plan, patch) };
    });
  },
  replaceIdeas: (category, newIdeas) => {
    set((state) => {
      if (!state.plan) return {};
      const otherIdeas = state.plan.ideas.filter((i) => i.category !== category);
      return { plan: { ...state.plan, ideas: [...otherIdeas, ...newIdeas] } };
    });
  },
  regenerateIdeas: async (category) => {
    const { lastInput } = get();
    if (!lastInput) return;
    set({ ideasLoading: true });
    try {
      const ideas = await postRegenerateIdeas(lastInput, category);
      get().replaceIdeas(category, ideas);
    } catch {
      // Silently fail — the old ideas remain.
    } finally {
      set({ ideasLoading: false });
    }
  },
}));

// Hydrate from localStorage on startup.
const saved = loadPlan();
if (saved) {
  usePlanStore.setState({
    plan: saved.plan,
    source: saved.source,
    lastInput: saved.lastInput,
    status: 'success',
  });
}

// Auto-save plan changes to localStorage.
usePlanStore.subscribe((state) => {
  if (state.plan && state.lastInput && state.status === 'success') {
    savePlan(state.plan, state.source ?? 'unknown', state.lastInput);
  }
});
