/**
 * Pure date utilities for back-scheduling timelines and validating input.
 * All comparisons are done in UTC on whole days to avoid timezone drift.
 */

/** One day in milliseconds. */
const DAY_MS = 86_400_000;

/**
 * Format a Date as an ISO calendar date (`YYYY-MM-DD`) in UTC.
 *
 * @param date - The date to format.
 * @returns The ISO date string.
 */
export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Parse an ISO date (or datetime) string to a Date, throwing on invalid input.
 *
 * @param iso - The ISO string.
 * @returns The parsed Date.
 */
export function parseISODate(iso: string): Date {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`Invalid ISO date: ${iso}`);
  }
  return date;
}

/**
 * Return a new Date offset by a whole number of days.
 *
 * @param date - The base date.
 * @param days - Days to add (negative to subtract).
 * @returns A new Date.
 */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

/** Midnight-UTC timestamp for the day containing `date`. */
function startOfUtcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * Whole-day difference `b - a` (positive when `b` is later).
 *
 * @param a - The earlier date.
 * @param b - The later date.
 * @returns Integer number of days between the two calendar days.
 */
export function daysBetween(a: Date, b: Date): number {
  return Math.round((startOfUtcDay(b) - startOfUtcDay(a)) / DAY_MS);
}

/**
 * Whole days from `now` until the ISO date (negative if past).
 *
 * @param iso - Target ISO date.
 * @param now - Reference date (defaults to the current time).
 * @returns Integer day count.
 */
export function daysUntil(iso: string, now: Date = new Date()): number {
  return daysBetween(now, parseISODate(iso));
}

/**
 * Validate that an ISO string is a real date strictly after today (UTC).
 *
 * @param iso - The candidate ISO string.
 * @param now - Reference date (defaults to the current time).
 * @returns True when the date is valid and in the future.
 */
export function isFutureISODate(iso: string, now: Date = new Date()): boolean {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) {
    return false;
  }
  return startOfUtcDay(new Date(time)) > startOfUtcDay(now);
}

/** A seed describing a milestone relative to the event date. */
export interface MilestoneSeed {
  id: string;
  title: string;
  phase: string;
  /** Days before the event (0 = event day). */
  offsetDays: number;
}

/** A scheduled timeline item (matches the Plan timeline shape). */
export interface ScheduledMilestone {
  id: string;
  title: string;
  phase: string;
  dueDate: string;
  done: boolean;
}

/**
 * Back-schedule milestones from an event date, earliest first.
 *
 * @param eventDateISO - The event's ISO date.
 * @param seeds - Milestone seeds with day offsets before the event.
 * @returns Scheduled milestones sorted ascending by due date.
 */
export function backSchedule(eventDateISO: string, seeds: MilestoneSeed[]): ScheduledMilestone[] {
  const event = parseISODate(eventDateISO);
  return seeds
    .map((seed) => ({
      id: seed.id,
      title: seed.title,
      phase: seed.phase,
      done: false,
      dueDate: toISODate(addDays(event, -seed.offsetDays)),
    }))
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0));
}
