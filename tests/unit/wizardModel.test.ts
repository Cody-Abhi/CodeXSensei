import { describe, expect, it } from 'vitest';

import {
  EMPTY_FORM,
  validateForm,
  validateStep,
  type WizardForm,
} from '../../src/client/features/wizard/wizardModel';

const validForm: WizardForm = {
  type: 'wedding',
  name: 'Aisha & Rohan',
  date: '2099-02-14',
  city: 'Jaipur',
  guests: '300',
  budget: '1500000',
  currency: 'INR',
  vibes: ['traditional'],
  dietary: ['vegetarian'],
  notes: 'Haldi',
};

describe('validateForm', () => {
  it('parses a valid form into EventInput with minor-unit budget', () => {
    const { errors, input } = validateForm(validForm);
    expect(errors).toEqual({});
    expect(input).not.toBeNull();
    expect(input?.budgetMinor).toBe(150_000_000);
    expect(input?.guests).toBe(300);
  });

  it('reports friendly field errors for an empty form', () => {
    const { errors, input } = validateForm(EMPTY_FORM);
    expect(input).toBeNull();
    expect(errors.type).toBeDefined();
    expect(errors.name).toBeDefined();
    expect(errors.guests).toMatch(/1 and 5000/);
    expect(errors.budget).toMatch(/greater than zero/);
  });

  it('rejects a past date', () => {
    const { errors } = validateForm({ ...validForm, date: '2000-01-01' });
    expect(errors.date).toBeDefined();
  });
});

describe('validateStep', () => {
  it('only returns errors for the current step', () => {
    const errors = validateStep(1, EMPTY_FORM);
    expect(errors.type).toBeDefined();
    expect(errors.name).toBeUndefined();
  });

  it('passes a completed step', () => {
    expect(validateStep(2, validForm)).toEqual({});
  });
});
