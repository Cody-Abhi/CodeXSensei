import { ChatResultSchema, IdeaSchema, PlanSchema } from '../../shared/schemas';
import type { ChatResult, EventInput, Idea, Plan } from '../../shared/types';
import { z } from 'zod';

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

/**
 * Send a chat message with the current plan context.
 *
 * @param plan - The current plan.
 * @param message - The user's message.
 * @param signal - Optional abort signal.
 * @returns The chat result (reply + optional patch).
 * @throws Error with a user-friendly message on failure.
 */
export async function postChat(
  plan: Plan,
  message: string,
  signal?: AbortSignal,
): Promise<ChatResult> {
  let res: Response;
  try {
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, message }),
      ...(signal ? { signal } : {}),
    });
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error('You are going a little fast — please wait a minute and try again.');
    }
    throw new Error('Chat failed. Please try again.');
  }

  const data: unknown = await res.json();
  const parsed = ChatResultSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('The response came back in an unexpected format. Please try again.');
  }
  return parsed.data;
}

const IdeasResponseSchema = z.strictObject({
  ideas: z.array(IdeaSchema).min(1).max(10),
});

/**
 * Regenerate ideas for a specific category.
 *
 * @param eventInput - The original event input.
 * @param category - The category to regenerate ideas for.
 * @param signal - Optional abort signal.
 * @returns Fresh ideas for the category.
 * @throws Error with a user-friendly message on failure.
 */
export async function postRegenerateIdeas(
  eventInput: EventInput,
  category: string,
  signal?: AbortSignal,
): Promise<Idea[]> {
  let res: Response;
  try {
    res = await fetch('/api/ideas/regenerate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventInput, category }),
      ...(signal ? { signal } : {}),
    });
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error('You are going a little fast — please wait a minute and try again.');
    }
    throw new Error('Could not regenerate ideas. Please try again.');
  }

  const data: unknown = await res.json();
  const parsed = IdeasResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Ideas came back in an unexpected format. Please try again.');
  }
  return parsed.data.ideas;
}
