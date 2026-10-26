import { PlanSchema } from '../../shared/schemas';
import type { EventInput, Plan } from '../../shared/types';

/** A plan returned from the API plus its provenance. */
export interface GeneratedPlan {
  plan: Plan;
  source: string;
}

/**
 * Request a generated plan from the server. Validates the response against the
 * shared schema before returning, and maps HTTP errors to friendly messages.
 *
 * @param input - Validated event input.
 * @param signal - Optional abort signal.
 * @returns The generated plan and its source.
 * @throws Error with a user-friendly message on failure.
 */
export async function postPlan(input: EventInput, signal?: AbortSignal): Promise<GeneratedPlan> {
  let res: Response;
  try {
    res = await fetch('/api/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      ...(signal ? { signal } : {}),
    });
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error('You are going a little fast — please wait a minute and try again.');
    }
    throw new Error('We could not generate your plan. Please try again.');
  }

  const data: unknown = await res.json();
  const body = data as { plan?: unknown; source?: unknown };
  const parsed = PlanSchema.safeParse(body.plan);
  if (!parsed.success) {
    throw new Error('The plan came back in an unexpected format. Please try again.');
  }
  return { plan: parsed.data, source: typeof body.source === 'string' ? body.source : 'ai' };
}
