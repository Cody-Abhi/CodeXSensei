/** Human-readable application name. */
export const APP_NAME = 'PlanPop';

/** Marketing tagline shown on the landing page. */
export const APP_TAGLINE = 'Plan big. Stress zero.';

/** Semantic version of the application, surfaced by the health endpoint. */
export const APP_VERSION = '1.0.0';

/**
 * Build a short greeting for a named event, used as a smoke-testable pure
 * helper and as a default plan title fragment.
 *
 * @param eventName - The user-provided event name (may be empty).
 * @returns A trimmed, human-friendly heading.
 */
export function buildGreeting(eventName: string): string {
  const trimmed = eventName.trim();
  return trimmed.length > 0 ? `Planning: ${trimmed}` : 'Planning your event';
}
