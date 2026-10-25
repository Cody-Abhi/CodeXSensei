import { describe, expect, it } from 'vitest';

import { sumMinor } from '../../src/shared/money';
import { PlanSchema } from '../../src/shared/schemas';
import { buildFallbackPlan } from '../../src/shared/templates';
import type { EventInput, EventType } from '../../src/shared/types';

function inputFor(type: EventType, overrides: Partial<EventInput> = {}): EventInput {
  return {
    type,
    name: 'Test Event',
    date: '2099-09-09',
    city: 'Mumbai',
    guests: 120,
    budgetMinor: 9_999_999,
    currency: 'INR',
    vibes: ['modern'],
    dietary: [],
    notes: '',
    ...overrides,
  };
}

describe('buildFallbackPlan', () => {
  it.each<EventType>(['wedding', 'birthday', 'community'])(
    'produces a schema-valid plan for %s',
    (type) => {
      const plan = buildFallbackPlan(inputFor(type));
      expect(PlanSchema.safeParse(plan).success).toBe(true);
    },
  );

  it.each<EventType>(['wedding', 'birthday', 'community'])(
    'budget sums to the exact input budget for %s',
    (type) => {
      const budgetMinor = 1_234_567;
      const plan = buildFallbackPlan(inputFor(type, { budgetMinor }));
      expect(sumMinor(plan.budget.map((b) => b.amountMinor))).toBe(budgetMinor);
    },
  );

  it('schedules the timeline in ascending date order with all items pending', () => {
    const plan = buildFallbackPlan(inputFor('wedding'));
    const dates = plan.timeline.map((t) => t.dueDate);
    expect([...dates].sort()).toEqual(dates);
    expect(plan.timeline.every((t) => t.done === false)).toBe(true);
  });

  it('starts every vendor as "to_find" with unique ids', () => {
    const plan = buildFallbackPlan(inputFor('community'));
    expect(plan.vendors.every((v) => v.status === 'to_find')).toBe(true);
    const ids = plan.vendors.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('personalizes the first idea only when vibes are provided', () => {
    const withVibes = buildFallbackPlan(inputFor('wedding', { vibes: ['eco-friendly'] }));
    expect(withVibes.ideas[0]?.description).toMatch(/eco-friendly vibe/i);

    const withoutVibes = buildFallbackPlan(inputFor('birthday', { vibes: [] }));
    expect(withoutVibes.ideas[0]?.description).not.toMatch(/vibe\./i);
  });

  it('summarises with the event name and city', () => {
    const plan = buildFallbackPlan(inputFor('wedding', { name: 'Aisha & Rohan', city: 'Jaipur' }));
    expect(plan.summary).toContain('Aisha & Rohan');
    expect(plan.summary).toContain('Jaipur');
  });
});
