import { PlanSchema } from '../../shared/schemas';
import type { EventInput, Plan } from '../../shared/types';

const STORAGE_KEY = 'planpop_v1';

interface PersistedState {
  version: 1;
  plan: Plan;
  source: string;
  lastInput: EventInput;
}

export function savePlan(plan: Plan, source: string, lastInput: EventInput): void {
  try {
    const state: PersistedState = { version: 1, plan, source, lastInput };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — silently skip.
  }
}

export function loadPlan(): { plan: Plan; source: string; lastInput: EventInput } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    if (typeof data !== 'object' || data === null) return null;
    const obj = data as Record<string, unknown>;
    if (obj.version !== 1) return null;
    const parsed = PlanSchema.safeParse(obj.plan);
    if (!parsed.success) return null;
    const plan = parsed.data;
    const source = typeof obj.source === 'string' ? obj.source : 'unknown';
    const lastInput = obj.lastInput as EventInput;
    return { plan, source, lastInput };
  } catch {
    return null;
  }
}

export function clearSavedPlan(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Unavailable — skip.
  }
}
