import type { ReactNode } from 'react';

import type { Tone } from './Button';
import './Toast.css';

export interface ToastProps {
  /** Message text. */
  message: ReactNode;
  /** Fill tone. */
  tone?: Tone;
  /** Optional dismiss handler; renders a close button when provided. */
  onDismiss?: () => void;
}

/**
 * Transient status message pinned to the bottom of the viewport. Uses
 * `role="status"` (polite live region) so it is announced without stealing
 * focus (PRD §10/§11).
 *
 * @param props - Toast props.
 * @returns A status region.
 */
export function Toast({ message, tone = 'green', onDismiss }: ToastProps): React.JSX.Element {
  return (
    <div className={`pp-toast tone-${tone}`} role="status">
      <span className="pp-toast__msg">{message}</span>
      {onDismiss && (
        <button type="button" className="pp-toast__close" onClick={onDismiss} aria-label="Dismiss">
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  );
}
