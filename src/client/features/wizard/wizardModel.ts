import { toMinor } from '../../../shared/money';
import { EventInputSchema } from '../../../shared/schemas';
import type { Currency, EventInput, EventType } from '../../../shared/types';

/** Raw wizard form state (all text inputs are strings until validated). */
export interface WizardForm {
  type: EventType | null;
  name: string;
  date: string;
  city: string;
  guests: string;
  budget: string;
  currency: Currency;
  vibes: string[];
  dietary: string[];
  notes: string;
}

/** Field-level validation errors keyed by form field. */
export type WizardErrors = Partial<Record<keyof WizardForm, string>>;

/** An empty form with sensible defaults. */
export const EMPTY_FORM: WizardForm = {
  type: null,
  name: '',
  date: '',
  city: '',
  guests: '',
  budget: '',
  currency: 'INR',
  vibes: [],
  dietary: [],
  notes: '',
};

/** Event-type options for the step-1 radio cards. */
export const EVENT_TYPE_OPTIONS: ReadonlyArray<{
  value: EventType;
  label: string;
  icon: string;
  tone: 'pink' | 'yellow' | 'blue';
  blurb: string;
}> = [
  { value: 'wedding', label: 'Wedding', icon: '💍', tone: 'pink', blurb: 'Big day, big plans.' },
  { value: 'birthday', label: 'Birthday', icon: '🎂', tone: 'yellow', blurb: 'Make it a bash.' },
  {
    value: 'community',
    label: 'Community event',
    icon: '🎪',
    tone: 'blue',
    blurb: 'Melas, drives, festivals.',
  },
];

/** Preset vibe tags. */
export const VIBE_OPTIONS = [
  'traditional',
  'modern',
  'eco-friendly',
  'minimal',
  'luxe',
  'festive',
  'playful',
  'elegant',
] as const;

/** Preset dietary tags. */
export const DIETARY_OPTIONS = [
  'vegetarian',
  'vegan',
  'jain',
  'halal',
  'gluten-free',
  'nut-free',
] as const;

/** Supported currencies for the select. */
export const CURRENCY_OPTIONS: ReadonlyArray<{ value: Currency; label: string }> = [
  { value: 'INR', label: '₹ INR' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
];

/** Step labels for the stepper. */
export const STEP_LABELS = ['Event type', 'Basics', 'Preferences'] as const;

/** Which form fields belong to each (1-indexed) wizard step. */
export const STEP_FIELDS: Record<number, Array<keyof WizardForm>> = {
  1: ['type'],
  2: ['name', 'date', 'city', 'guests', 'budget', 'currency'],
  3: ['vibes', 'dietary', 'notes'],
};

const FRIENDLY_MESSAGES: Partial<Record<keyof WizardForm, string>> = {
  type: 'Choose an event type.',
  name: 'Give your event a name.',
  date: 'Pick a date in the future.',
  city: 'Enter the city.',
  guests: 'Enter a guest count between 1 and 5000.',
  budget: 'Enter a total budget greater than zero.',
};

/** Build a validation candidate (converting numbers) from the form. */
function toCandidate(form: WizardForm): unknown {
  return {
    type: form.type ?? undefined,
    name: form.name,
    date: form.date,
    city: form.city,
    guests: form.guests.trim() === '' ? Number.NaN : Number(form.guests),
    budgetMinor: form.budget.trim() === '' ? Number.NaN : toMinor(Number(form.budget)),
    currency: form.currency,
    vibes: form.vibes,
    dietary: form.dietary,
    notes: form.notes,
  };
}

/**
 * Validate the whole form. Returns field errors and, when valid, the parsed
 * {@link EventInput}. Error messages are user-friendly per field.
 *
 * @param form - The raw wizard form.
 * @returns `{ errors, input }` — `input` is null when invalid.
 */
export function validateForm(form: WizardForm): { errors: WizardErrors; input: EventInput | null } {
  const result = EventInputSchema.safeParse(toCandidate(form));
  if (result.success) {
    return { errors: {}, input: result.data };
  }
  const errors: WizardErrors = {};
  for (const issue of result.error.issues) {
    const rawKey = String(issue.path[0] ?? '');
    const field = (rawKey === 'budgetMinor' ? 'budget' : rawKey) as keyof WizardForm;
    if (field && errors[field] === undefined) {
      errors[field] = FRIENDLY_MESSAGES[field] ?? issue.message;
    }
  }
  return { errors, input: null };
}

/**
 * Validate only the fields belonging to a given step (for Next-button gating).
 *
 * @param step - 1-indexed step.
 * @param form - The raw wizard form.
 * @returns Errors limited to that step's fields.
 */
export function validateStep(step: number, form: WizardForm): WizardErrors {
  const fields = STEP_FIELDS[step] ?? [];
  const { errors } = validateForm(form);
  const stepErrors: WizardErrors = {};
  for (const field of fields) {
    if (errors[field] !== undefined) {
      stepErrors[field] = errors[field];
    }
  }
  return stepErrors;
}
