import type { HTMLAttributes } from 'react';
import { cx } from './cx';

interface Props extends HTMLAttributes<HTMLDivElement> {
  colorVar?: string;
}

export function Stamp({ colorVar = '--white', className, style, ...rest }: Props) {
  return (
    <div
      className={cx(
        '-rotate-6 border-3 border-ink px-4 py-1 text-2xl font-extrabold uppercase tracking-wider text-ink shadow-brutal-sm',
        className,
      )}
      style={{ backgroundColor: `var(${colorVar})`, ...style }}
      {...rest}
    />
  );
}
