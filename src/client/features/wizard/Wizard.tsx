import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../components/Button';
import { Field } from '../../components/Field';
import { usePlanStore } from '../../store/planStore';
import {
  CURRENCY_OPTIONS,
  DIETARY_OPTIONS,
  EMPTY_FORM,
  EVENT_TYPE_OPTIONS,
  STEP_FIELDS,
  STEP_LABELS,
  VIBE_OPTIONS,
  validateForm,
  validateStep,
  type WizardErrors,
  type WizardForm,
} from './wizardModel';
import './Wizard.css';

const MAX_VIBES = 6;

/** Find the first step (1-indexed) that owns any of the given errors. */
function firstErrorStep(errors: WizardErrors): number {
  for (const step of [1, 2, 3]) {
    if ((STEP_FIELDS[step] ?? []).some((field) => errors[field] !== undefined)) {
      return step;
    }
  }
  return 1;
}

/**
 * Three-step event wizard (PRD §F1). Validates inline with accessible errors,
 * focuses an error summary on failure, and on success kicks off plan generation
 * then navigates to the plan dashboard.
 *
 * @returns The wizard form.
 */
export function Wizard(): React.JSX.Element {
  const navigate = useNavigate();
  const generate = usePlanStore((s) => s.generate);
  const [form, setForm] = useState<WizardForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<WizardErrors>({});
  const [step, setStep] = useState(1);
  const [errorTick, setErrorTick] = useState(0);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (errorTick > 0 && Object.keys(errors).length > 0) {
      summaryRef.current?.focus();
    }
  }, [errorTick, errors]);

  function update<K extends keyof WizardForm>(key: K, value: WizardForm[K]): void {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleTag(key: 'vibes' | 'dietary', value: string, max?: number): void {
    setForm((prev) => {
      const has = prev[key].includes(value);
      const next = has ? prev[key].filter((v) => v !== value) : [...prev[key], value];
      if (!has && max !== undefined && next.length > max) {
        return prev;
      }
      return { ...prev, [key]: next };
    });
  }

  function goNext(): void {
    const stepErrors = validateStep(step, form);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) {
      setStep((s) => Math.min(STEP_LABELS.length, s + 1));
    } else {
      setErrorTick((t) => t + 1);
    }
  }

  function handleSubmit(event?: React.FormEvent): void {
    event?.preventDefault();
    const { errors: allErrors, input } = validateForm(form);
    setErrors(allErrors);
    if (input) {
      void generate(input);
      navigate('/plan');
      return;
    }
    setStep(firstErrorStep(allErrors));
    setErrorTick((t) => t + 1);
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="pp-wizard">
      <h1>Plan your event</h1>
      <ol className="pp-stepper" aria-label="Progress">
        {STEP_LABELS.map((label, index) => {
          const n = index + 1;
          const state = n === step ? 'current' : n < step ? 'done' : 'upcoming';
          return (
            <li
              key={label}
              className={`pp-stepper__item is-${state}`}
              aria-current={n === step ? 'step' : undefined}
            >
              <span className="pp-stepper__num" aria-hidden="true">
                {n < step ? '✓' : n}
              </span>
              <span>
                Step {n}: {label}
                {n < step ? ' (done)' : ''}
              </span>
            </li>
          );
        })}
      </ol>

      <form onSubmit={handleSubmit} noValidate>
        {hasErrors && (
          <div ref={summaryRef} tabIndex={-1} role="alert" className="pp-errorsummary">
            <strong>Please fix the following:</strong>
            <ul>
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        {step === 1 && (
          <fieldset className="pp-fieldset">
            <legend>Choose your event type</legend>
            <div className="pp-typegrid">
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`pp-typecard tone-${opt.tone}${
                    form.type === opt.value ? ' is-selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="event-type"
                    value={opt.value}
                    checked={form.type === opt.value}
                    onChange={() => update('type', opt.value)}
                    className="visually-hidden"
                  />
                  <span className="pp-typecard__icon" aria-hidden="true">
                    {opt.icon}
                  </span>
                  <span className="pp-typecard__label">{opt.label}</span>
                  <span className="pp-typecard__blurb">{opt.blurb}</span>
                  <span className="pp-typecard__check">
                    {form.type === opt.value ? '✓ Selected' : ' '}
                  </span>
                </label>
              ))}
            </div>
            {errors.type && <p className="pp-field__error">{errors.type}</p>}
          </fieldset>
        )}

        {step === 2 && (
          <div className="pp-step">
            <Field id="w-name" label="Event name" error={errors.name} required>
              {(c) => (
                <input
                  {...c}
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="e.g. Aisha & Rohan"
                  maxLength={120}
                />
              )}
            </Field>
            <Field id="w-date" label="Event date" error={errors.date} required>
              {(c) => (
                <input
                  {...c}
                  type="date"
                  value={form.date}
                  onChange={(e) => update('date', e.target.value)}
                />
              )}
            </Field>
            <Field id="w-city" label="City" error={errors.city} required>
              {(c) => (
                <input
                  {...c}
                  type="text"
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                  placeholder="e.g. Jaipur"
                  maxLength={120}
                />
              )}
            </Field>
            <Field id="w-guests" label="Guest count" error={errors.guests} required>
              {(c) => (
                <input
                  {...c}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={5000}
                  value={form.guests}
                  onChange={(e) => update('guests', e.target.value)}
                  placeholder="e.g. 300"
                />
              )}
            </Field>
            <div className="pp-budgetrow">
              <Field id="w-budget" label="Total budget" error={errors.budget} required>
                {(c) => (
                  <input
                    {...c}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={form.budget}
                    onChange={(e) => update('budget', e.target.value)}
                    placeholder="e.g. 1500000"
                  />
                )}
              </Field>
              <Field id="w-currency" label="Currency">
                {(c) => (
                  <select
                    {...c}
                    value={form.currency}
                    onChange={(e) => update('currency', e.target.value as WizardForm['currency'])}
                  >
                    {CURRENCY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="pp-step">
            <fieldset className="pp-fieldset">
              <legend>
                Vibe tags <span className="pp-hint-inline">(up to {MAX_VIBES})</span>
              </legend>
              <div className="pp-tags" role="group" aria-label="Vibe tags">
                {VIBE_OPTIONS.map((vibe) => {
                  const active = form.vibes.includes(vibe);
                  return (
                    <button
                      type="button"
                      key={vibe}
                      className={`pp-tag${active ? ' is-active' : ''}`}
                      aria-pressed={active}
                      onClick={() => toggleTag('vibes', vibe, MAX_VIBES)}
                    >
                      {active ? '✓ ' : ''}
                      {vibe}
                    </button>
                  );
                })}
              </div>
              <p className="pp-field__hint">{form.vibes.length} selected</p>
            </fieldset>

            <fieldset className="pp-fieldset">
              <legend>Dietary needs</legend>
              <div className="pp-tags" role="group" aria-label="Dietary needs">
                {DIETARY_OPTIONS.map((diet) => {
                  const active = form.dietary.includes(diet);
                  return (
                    <button
                      type="button"
                      key={diet}
                      className={`pp-tag${active ? ' is-active' : ''}`}
                      aria-pressed={active}
                      onClick={() => toggleTag('dietary', diet)}
                    >
                      {active ? '✓ ' : ''}
                      {diet}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <Field
              id="w-notes"
              label="Cultural or religious notes"
              hint={`${form.notes.length}/300 — e.g. Haldi, Mehendi, Sangeet`}
              error={errors.notes}
            >
              {(c) => (
                <textarea
                  {...c}
                  rows={3}
                  maxLength={300}
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                />
              )}
            </Field>
          </div>
        )}

        <div className="pp-wizard__nav">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          {step < STEP_LABELS.length ? (
            <Button key="next" type="button" tone="blue" onClick={goNext}>
              Next
            </Button>
          ) : (
            <Button key="submit" type="button" tone="green" onClick={() => handleSubmit()}>
              Generate my plan ✨
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
