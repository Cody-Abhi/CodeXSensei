import type { HTMLAttributes, ReactNode } from 'react';

import type { Tone } from './Button';
import './Card.css';

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Optional header strip tone (event colour). Renders a titled strip. */
  headerTone?: Tone;
  /** Optional heading rendered in the header strip. */
  title?: ReactNode;
  /** Heading level for the title (default 2). */
  titleLevel?: 2 | 3;
  children?: ReactNode;
}

/**
 * Bordered paper surface with a hard offset shadow and an optional coloured
 * header strip (PRD §10).
 *
 * @param props - Card props including optional `headerTone` and `title`.
 * @returns A styled section element.
 */
export function Card({
  headerTone,
  title,
  titleLevel = 2,
  className,
  children,
  ...rest
}: CardProps): React.JSX.Element {
  const classes = ['pp-card', className].filter(Boolean).join(' ');
  const Heading = `h${titleLevel}` as 'h2' | 'h3';
  return (
    <section className={classes} {...rest}>
      {title !== undefined && (
        <div className={`pp-card__strip${headerTone ? ` tone-${headerTone}` : ''}`}>
          <Heading className="pp-card__title">{title}</Heading>
        </div>
      )}
      <div className="pp-card__body">{children}</div>
    </section>
  );
}
