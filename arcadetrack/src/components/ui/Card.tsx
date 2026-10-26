import type { HTMLAttributes } from 'react';
import { cx } from './cx';

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('relative border-3 border-ink bg-white p-5 shadow-brutal', className)} {...rest} />;
}
