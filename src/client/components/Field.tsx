import type { ReactNode } from 'react';

import './Field.css';

/** Props injected into the control rendered by a {@link Field}. */
export interface FieldControlProps {
  id: string;
  className: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
}

export interface FieldProps {
  /** Unique id; wired to the label and the control. */
  id: string;
  /** Always-visible label (PRD §11). */
  label: ReactNode;
  /** Optional helper text, shown when there is no error. */
  hint?: ReactNode;
  /** Error message; when present the control is marked invalid. */
  error?: ReactNode;
  /** Marks the field as required (visual marker + `aria-required`). */
  required?: boolean;
  /**
   * Render the control (input/textarea/select) with the supplied accessibility
   * props spread onto it.
   */
  children: (control: FieldControlProps) => ReactNode;
}

/**
 * Accessible form field wrapper: visible label above, helper/error wiring via
 * `aria-describedby`, `aria-invalid` and `aria-required` (PRD §5/§11). The
 * control itself is provided by the caller through a render prop so any input
 * type can be used while keeping the accessibility contract.
 *
 * @param props - Field props.
 * @returns The labelled field group.
 */
export function Field({
  id,
  label,
  hint,
  error,
  required = false,
  children,
}: FieldProps): React.JSX.Element {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  const control: FieldControlProps = {
    id,
    className: `pp-input${error ? ' pp-input--error' : ''}`,
    ...(describedBy ? { 'aria-describedby': describedBy } : {}),
    ...(error ? { 'aria-invalid': true } : {}),
    ...(required ? { 'aria-required': true } : {}),
  };

  return (
    <div className="pp-field">
      <label className="pp-field__label" htmlFor={id}>
        {label}
        {required && (
          <span className="pp-field__req" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {children(control)}
      {error ? (
        <p id={errorId} className="pp-field__error">
          <span className="pp-field__error-icon" aria-hidden="true">
            ⚠
          </span>
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={hintId} className="pp-field__hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
