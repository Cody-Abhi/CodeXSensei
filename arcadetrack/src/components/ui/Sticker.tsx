import type { ReactNode } from 'react';

export function Sticker({ children = 'NEW!' }: { children?: ReactNode }) {
  return (
    <span className="absolute -right-3 -top-3 z-10 grid h-14 w-14 rotate-12 place-items-center rounded-full border-3 border-ink bg-pink text-xs font-extrabold text-ink shadow-brutal-sm">
      {children}
    </span>
  );
}
