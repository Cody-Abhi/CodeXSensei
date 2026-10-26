import type { ButtonHTMLAttributes } from 'react';
import { cx } from './cx';

const VARIANTS = { yellow: 'bg-yellow', white: 'bg-white', pink: 'bg-pink' } as const;

export function buttonClasses(variant: keyof typeof VARIANTS = 'yellow', extra?: string) {
  return cx(
    'inline-flex min-h-12 items-center justify-center gap-2 border-3 border-ink px-5 py-2 font-extrabold uppercase tracking-wide text-ink',
    'shadow-brutal transition-transform duration-100 ease-out',
    'hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-brutal-hover',
    'active:translate-x-[6px] active:translate-y-[6px] active:shadow-none',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-brutal',
    VARIANTS[variant],
    extra,
  );
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS;
}

export function Button({ variant = 'yellow', className, type = 'button', ...rest }: Props) {
  return <button type={type} className={buttonClasses(variant, className)} {...rest} />;
}
