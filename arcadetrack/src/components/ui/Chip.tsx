import type { HTMLAttributes } from 'react';
import { cx } from './cx';

interface Props extends HTMLAttributes<HTMLSpanElement> {
  /** CSS custom property name, e.g. "--pink". */
  colorVar?: string;
}

export function Chip({ colorVar = '--white', className, style, ...rest }: Props) {
  return (
    <span
      className={cx('inline-block border-2 border-ink px-2 py-0.5 text-xs font-bold uppercase text-ink', className)}
      style={{ backgroundColor: `var(${colorVar})`, ...style }}
      {...rest}
    />
  );
}
