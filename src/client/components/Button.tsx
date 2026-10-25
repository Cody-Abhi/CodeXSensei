import type { ButtonHTMLAttributes } from 'react';

import './Button.css';

/** Neobrutal palette tones usable as a solid fill. */
export type Tone = 'yellow' | 'pink' | 'blue' | 'green' | 'orange' | 'purple' | 'red';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style: solid fill (default) or outline on paper. */
  variant?: 'solid' | 'outline';
  /** Accent tone for the fill / outline accent. */
  tone?: Tone;
  /** Larger hit area / type scale. */
  size?: 'md' | 'lg';
}

/**
 * Primary interactive control. Presses down on click (translate + shadow
 * collapse) per PRD §10; focus ring is the global 4px dashed outline.
 *
 * @param props - Standard button props plus `variant`, `tone`, `size`.
 * @returns A styled button element.
 */
export function Button({
  variant = 'solid',
  tone = 'yellow',
  size = 'md',
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps): React.JSX.Element {
  const classes = ['pp-btn', `pp-btn--${variant}`, `pp-btn--${size}`, `tone-${tone}`, className]
    .filter(Boolean)
    .join(' ');
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
