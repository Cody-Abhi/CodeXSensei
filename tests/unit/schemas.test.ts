import { describe, expect, it } from 'vitest';

import {
  ChatRequestSchema,
  EventInputSchema,
  PlanPatchSchema,
  PlanSchema,
} from '../../src/shared/schemas';
import { buildFallbackPlan } from '../../src/shared/templates';
import type { EventInput } from '../../src/shared/types';

const validInput: EventInput = {
  type: 'wedding',
  name: 'Aisha & Rohan',
  date: '2099-02-14',
  city: 'Jaipur',
  guests: 300,
  budgetMinor: 150_000_000,
  currency: 'INR',
  vibes: ['traditional', 'luxe'],
  dietary: ['vegetarian'],
  notes: 'Haldi and Mehendi welcome.',
};

describe('EventInputSchema', () => {
  it('accepts valid input and applies array/string defaults', () => {
    const parsed = EventInputSchema.parse({
      type: 'birthday',
      name: 'Kiaan 7th',
      date: '2099-05-01',
      city: 'Pune',
      guests: 20,
      budgetMinor: 2_500_000,
      currency: 'INR',
    });
    expect(parsed.vibes).toEqual([]);
    expect(parsed.dietary).toEqual([]);
    expect(parsed.notes).toBe('');
  });

  it('rejects unknown keys (strict)', () => {
    const result = EventInputSchema.safeParse({ ...validInput, sneaky: true });
    expect(result.success).toBe(false);
  });

  it.each([
    ['past date', { ...validInput, date: '2000-01-01' }],
    ['too many guests', { ...validInput, guests: 6000 }],
    ['zero guests', { ...validInput, guests: 0 }],
    ['non-positive budget', { ...validInput, budgetMinor: 0 }],
    ['empty name', { ...validInput, name: '' }],
    ['bad currency', { ...validInput, currency: 'GBP' }],
    ['too many vibes', { ...validInput, vibes: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] }],
    ['notes too long', { ...validInput, notes: 'x'.repeat(301) }],
  ])('rejects %s', (_label, candidate) => {
    expect(EventInputSchema.safeParse(candidate).success).toBe(false);
  });
});

describe('PlanSchema', () => {
  it('accepts a fallback-generated plan', () => {
    expect(PlanSchema.safeParse(buildFallbackPlan(validInput)).success).toBe(true);
  });

  it('rejects a plan missing required fields', () => {
    const { summary: _summary, ...rest } = buildFallbackPlan(validInput);
    expect(PlanSchema.safeParse(rest).success).toBe(false);
  });
});

describe('ChatRequestSchema', () => {
  const plan = buildFallbackPlan(validInput);

  it('accepts a valid chat request', () => {
    expect(ChatRequestSchema.safeParse({ plan, message: 'Make it cheaper' }).success).toBe(true);
  });

  it.each([
    ['empty message', ''],
    ['over-long message', 'x'.repeat(501)],
  ])('rejects %s', (_label, message) => {
    expect(ChatRequestSchema.safeParse({ plan, message }).success).toBe(false);
  });
});

describe('PlanPatchSchema', () => {
  it('accepts an empty patch and a partial patch', () => {
    expect(PlanPatchSchema.safeParse({}).success).toBe(true);
    expect(PlanPatchSchema.safeParse({ summary: 'Updated' }).success).toBe(true);
  });

  it('rejects unknown keys', () => {
    expect(PlanPatchSchema.safeParse({ nope: 1 }).success).toBe(false);
  });
});
