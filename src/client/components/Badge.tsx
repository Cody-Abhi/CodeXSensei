import type { HTMLAttributes, ReactNode } from 'react';

import type { Tone } from './Button';
import './Badge.css';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Fill tone. */
  tone?: Tone;
  /** Optional leading icon/emoji (decorative; keep text meaningful too). */
  icon?: ReactNode;
  children: ReactNode;
}

/**
 * Small uppercase, bordered tag. Status is never conveyed by colour alone, so
 * the label text always carries the meaning (PRD §10/§11).
 *
 * @param props - Badge props including `tone` and optional `icon`.
 * @returns A styled span.
 */
export function Badge({
  tone = 'yellow',
  icon,
  className,
  children,
  ...rest
}: BadgeProps): React.JSX.Element {
  const classes = ['pp-badge', `tone-${tone}`, className].filter(Boolean).join(' ');
  return (
    <span className={classes} {...rest}>
      {icon !== undefined && (
        <span className="pp-badge__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
