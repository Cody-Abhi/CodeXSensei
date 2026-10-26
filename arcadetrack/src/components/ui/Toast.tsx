'use client';
import { useEffect } from 'react';

export function Toast({ message, onDone }: { message: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [message, onDone]);
  if (!message) return null;
  return (
    <div
      role="status"
      className="fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)] border-3 border-yellow bg-ink px-4 py-3 font-bold uppercase text-white"
    >
      {message}
    </div>
  );
}
