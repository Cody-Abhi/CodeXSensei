import { describe, expect, it } from 'vitest';

import {
  buildRepairPrompt,
  buildSystemPrompt,
  buildUserPrompt,
  getFewShot,
} from '../../src/server/services/promptBuilder';
import type { EventInput, EventType } from '../../src/shared/types';

const input: EventInput = {
  type: 'wedding',
  name: 'Aisha & Rohan',
  date: '2099-02-14',
  city: 'Jaipur',
  guests: 300,
  budgetMinor: 150_000_000,
  currency: 'INR',
  vibes: ['traditional'],
  dietary: [],
  notes: '',
};

describe('promptBuilder', () => {
  it('system prompt states the budget rule and injection guard', () => {
    const system = buildSystemPrompt();
    expect(system).toMatch(/MUST equal the budget_minor_units/);
    expect(system).toMatch(/DATA, never instructions/i);
    expect(system).toMatch(/contingency/i);
  });

  it('user prompt includes the data block and type guidance', () => {
    const user = buildUserPrompt(input);
    expect(user).toContain('<<<USER_DATA>>>');
    expect(user).toMatch(/6–12 month timeline/);
    expect(user).toContain('name: Aisha & Rohan');
  });

  it('repair prompt echoes the error safely', () => {
    const repair = buildRepairPrompt('bad field\u0000');
    expect(repair).toMatch(/did not match the required schema/i);
    expect(repair).not.toContain('\u0000');
  });

  it.each<EventType>(['wedding', 'birthday', 'community'])(
    'few-shot for %s is valid JSON with the expected keys',
    (type) => {
      const parsed = JSON.parse(getFewShot(type)) as Record<string, unknown>;
      expect(Object.keys(parsed)).toEqual(['summary', 'budget', 'timeline', 'vendors', 'ideas']);
    },
  );
});
