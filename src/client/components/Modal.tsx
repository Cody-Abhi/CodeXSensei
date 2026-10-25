import { useEffect, useId, useRef, type ReactNode } from 'react';

import './Modal.css';

export interface ModalProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the dialog requests to close (close button, Esc, backdrop). */
  onClose: () => void;
  /** Dialog title; provides the accessible name via `aria-labelledby`. */
  title: ReactNode;
  children?: ReactNode;
}

/**
 * Accessible modal built on the native `<dialog>` element: focus is trapped by
 * the platform, Escape closes it, and focus returns to the invoker on close
 * (PRD §10). Rendered as text; never injects HTML.
 *
 * @param props - Modal props.
 * @returns A dialog element.
 */
export function Modal({ open, onClose, title, children }: ModalProps): React.JSX.Element {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) {
      return undefined;
    }
    const handleClose = (): void => onClose();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  return (
    <dialog ref={ref} className="pp-modal" aria-labelledby={titleId}>
      <div className="pp-modal__head">
        <h2 id={titleId} className="pp-modal__title">
          {title}
        </h2>
        <button
          type="button"
          className="pp-modal__close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <div className="pp-modal__body">{children}</div>
    </dialog>
  );
}
