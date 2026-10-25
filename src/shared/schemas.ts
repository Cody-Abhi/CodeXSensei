import { z } from 'zod';

import { isFutureISODate } from './dates';

/** Event verticals supported by PlanPop (PRD §3). */
export const EVENT_TYPES = ['wedding', 'birthday', 'community'] as const;

/** Supported currencies. */
export const CURRENCIES = ['INR', 'USD', 'EUR'] as const;

/** Vendor lifecycle states. */
export const VENDOR_STATUSES = ['to_find', 'contacted', 'booked'] as const;

/**
 * User-provided event details collected by the wizard (PRD §5/§8). Strict:
 * unknown keys are rejected.
 */
export const EventInputSchema = z.strictObject({
  type: z.enum(EVENT_TYPES),
  name: z.string().trim().min(1, 'Please name your event.').max(120),
  date: z.string().refine((value) => isFutureISODate(value), {
    message: 'Pick a valid date in the future.',
  }),
  city: z.string().trim().min(1, 'Where is it happening?').max(120),
  guests: z.number().int().min(1).max(5000),
  budgetMinor: z.number().int().positive(),
  currency: z.enum(CURRENCIES),
  vibes: z.array(z.string().trim().min(1).max(40)).max(6).default([]),
  dietary: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  notes: z.string().max(300).default(''),
});

/** One budget line item. */
export const BudgetItemSchema = z.strictObject({
  category: z.string().min(1).max(60),
  amountMinor: z.number().int().nonnegative(),
  rationale: z.string().max(400),
});

/** One timeline milestone. */
export const TimelineItemSchema = z.strictObject({
  id: z.string().min(1).max(80),
  title: z.string().min(1).max(160),
  dueDate: z.string().min(1).max(40),
  phase: z.string().min(1).max(60),
  done: z.boolean(),
});

/** One vendor checklist entry. */
export const VendorSchema = z.strictObject({
  id: z.string().min(1).max(80),
  category: z.string().min(1).max(60),
  name: z.string().min(1).max(160),
  why: z.string().max(400),
  askThem: z.string().max(400),
  status: z.enum(VENDOR_STATUSES),
  costMinor: z.number().int().nonnegative().optional(),
});

/** One personalized idea card. */
export const IdeaSchema = z.strictObject({
  id: z.string().min(1).max(80),
  category: z.string().min(1).max(60),
  title: z.string().min(1).max(160),
  description: z.string().max(600),
});

/** A complete generated plan (PRD §8). */
export const PlanSchema = z.strictObject({
  summary: z.string().min(1).max(1200),
  budget: z.array(BudgetItemSchema).min(1).max(20),
  timeline: z.array(TimelineItemSchema).min(1).max(40),
  vendors: z.array(VendorSchema).min(1).max(40),
  ideas: z.array(IdeaSchema).min(1).max(40),
});

/** Request body for `POST /api/chat`. */
export const ChatRequestSchema = z.strictObject({
  plan: PlanSchema,
  message: z.string().trim().min(1).max(500),
});

/** Request body for `POST /api/ideas/regenerate`. */
export const IdeasRegenerateSchema = z.strictObject({
  eventInput: EventInputSchema,
  category: z.string().trim().min(1).max(60),
});

/**
 * A partial patch to a plan returned by the chat assistant (PRD §6). Only the
 * provided arrays replace their counterparts; `summary` replaces the summary.
 */
export const PlanPatchSchema = z.strictObject({
  summary: z.string().min(1).max(1200).optional(),
  budget: z.array(BudgetItemSchema).max(20).optional(),
  timeline: z.array(TimelineItemSchema).max(40).optional(),
  vendors: z.array(VendorSchema).max(40).optional(),
  ideas: z.array(IdeaSchema).max(40).optional(),
});

/** Final chat response payload (after the SSE stream completes). */
export const ChatResultSchema = z.strictObject({
  reply: z.string().min(1).max(1200),
  patch: PlanPatchSchema.optional(),
});
