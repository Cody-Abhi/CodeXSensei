import { forwardRef, type InputHTMLAttributes } from 'react';
import { cx } from './cx';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cx(
        'h-16 w-full border-3 border-ink bg-white px-4 font-mono text-base text-ink placeholder:text-black/50 focus:bg-yellow',
        className,
      )}
      {...rest}
    />
  );
});
