import { normaliseBudget } from '../../shared/money';
import { PlanSchema } from '../../shared/schemas';
import { buildFallbackPlan } from '../../shared/templates';
import type { EventInput, Plan } from '../../shared/types';
import { hashInput, type PlanCache } from './cache';
import { PLAN_RESPONSE_SCHEMA, type GeminiJsonClient } from './gemini';
import { buildRepairPrompt, buildSystemPrompt, buildUserPrompt } from './promptBuilder';

/** Where a returned plan came from. */
export type PlanSource = 'ai' | 'ai-repair' | 'fallback';

/** A generated plan plus provenance. */
export interface PlanResult {
  plan: Plan;
  source: PlanSource;
}

/** Options for {@link createPlanService}. */
export interface PlanServiceOptions {
  /** Gemini client, or `null` to always use the local fallback. */
  client: GeminiJsonClient | null;
  cache: PlanCache;
  /** Per-call timeout in ms (default 20000, PRD §6). */
  timeoutMs?: number;
}

const TEMPERATURE = 0.3;
const MAX_OUTPUT_TOKENS = 4096;

/**
 * Re-normalise a plan's budget so the category amounts sum to the user's budget
 * exactly (PRD §8 server rule), preserving categories and order.
 */
function renormaliseBudget(plan: Plan, input: EventInput): Plan {
  const amounts = normaliseBudget(
    plan.budget.map((item) => item.amountMinor),
    input.budgetMinor,
  );
  return {
    ...plan,
    budget: plan.budget.map((item, index) => ({ ...item, amountMinor: amounts[index]! })),
  };
}

/**
 * Validate raw model output against the Plan schema and re-normalise the
 * budget. Returns `null` when the output is invalid.
 */
function validatePlan(raw: unknown, input: EventInput): Plan | null {
  const parsed = PlanSchema.safeParse(raw);
  if (!parsed.success) {
    return null;
  }
  return renormaliseBudget(parsed.data, input);
}

/**
 * Create the plan service. Flow: cache → Gemini (JSON schema) → one repair
 * retry → local rule-based fallback. Successful AI plans are cached; fallbacks
 * are not, so a later identical request can still try the model.
 *
 * @param options - Injected client, cache and timeout.
 * @returns A service exposing `generate`.
 */
export function createPlanService(options: PlanServiceOptions): {
  generate: (input: EventInput) => Promise<PlanResult>;
} {
  const { client, cache } = options;
  const timeoutMs = options.timeoutMs ?? 20_000;

  async function callModel(
    activeClient: GeminiJsonClient,
    system: string,
    user: string,
  ): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const timeout = new Promise<never>((_, reject) => {
      controller.signal.addEventListener('abort', () =>
        reject(new Error('Gemini request timed out')),
      );
    });
    try {
      return await Promise.race([
        activeClient.generateJson({
          system,
          user,
          schema: PLAN_RESPONSE_SCHEMA,
          temperature: TEMPERATURE,
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          signal: controller.signal,
        }),
        timeout,
      ]);
    } finally {
      clearTimeout(timer);
    }
  }

  async function generate(input: EventInput): Promise<PlanResult> {
    const key = hashInput(input);
    const cached = cache.get(key);
    if (cached) {
      return { plan: cached, source: 'ai' };
    }

    if (!client) {
      return { plan: buildFallbackPlan(input), source: 'fallback' };
    }

    const system = buildSystemPrompt();
    const user = buildUserPrompt(input);

    try {
      const first = validatePlan(await callModel(client, system, user), input);
      if (first) {
        cache.set(key, first);
        return { plan: first, source: 'ai' };
      }

      // One repair attempt with the validation failure described.
      const repaired = validatePlan(
        await callModel(
          client,
          system,
          `${user}\n\n${buildRepairPrompt('Output did not match schema.')}`,
        ),
        input,
      );
      if (repaired) {
        cache.set(key, repaired);
        return { plan: repaired, source: 'ai-repair' };
      }
    } catch {
      // Timeout or client error — fall through to the local fallback.
    }

    return { plan: buildFallbackPlan(input), source: 'fallback' };
  }

  return { generate };
}
