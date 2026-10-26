import type { z } from 'zod';

export type { Currency } from './money';

import type {
  BudgetItemSchema,
  ChatRequestSchema,
  ChatResultSchema,
  EventInputSchema,
  IdeaSchema,
  IdeasRegenerateSchema,
  PlanPatchSchema,
  PlanSchema,
  TimelineItemSchema,
  VendorSchema,
} from './schemas';

/** Event vertical. */
export type EventType = 'wedding' | 'birthday' | 'community';

/** Vendor lifecycle state. */
export type VendorStatus = 'to_find' | 'contacted' | 'booked';

/** Validated user input from the wizard. */
export type EventInput = z.infer<typeof EventInputSchema>;
/** A single budget line. */
export type BudgetItem = z.infer<typeof BudgetItemSchema>;
/** A single timeline milestone. */
export type TimelineItem = z.infer<typeof TimelineItemSchema>;
/** A single vendor checklist entry. */
export type Vendor = z.infer<typeof VendorSchema>;
/** A single idea card. */
export type Idea = z.infer<typeof IdeaSchema>;
/** A complete generated plan. */
export type Plan = z.infer<typeof PlanSchema>;
/** Chat request body. */
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
/** Chat final result. */
export type ChatResult = z.infer<typeof ChatResultSchema>;
/** Partial plan patch from the assistant. */
export type PlanPatch = z.infer<typeof PlanPatchSchema>;
/** Ideas-regenerate request body. */
export type IdeasRegenerateRequest = z.infer<typeof IdeasRegenerateSchema>;
