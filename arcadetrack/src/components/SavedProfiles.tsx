'use client';
import { formatDistanceToNow, parseISO } from 'date-fns';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getTierInfo } from '@/lib/points';
import { useTracker } from '@/store/useTracker';
import { Card } from './ui/Card';
import { Chip } from './ui/Chip';

export function SavedProfiles() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const profiles = useTracker((s) => s.profiles);
  const remove = useTracker((s) => s.removeProfile);

  const list = Object.values(profiles).sort((a, b) => b.lastFetchedAt.localeCompare(a.lastFetchedAt));
  if (!mounted || list.length === 0) return null;

  return (
    <section aria-labelledby="saved-h" className="mt-12 space-y-4">
      <h2 id="saved-h" className="text-2xl uppercase">
        Saved profiles
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2">
        {list.map((p) => {
          const pts = p.snapshots.at(-1)?.points ?? 0;
          const tier = getTierInfo(pts).current;
          return (
            <li key={p.profileId}>
              <Card className="flex flex-col gap-2 p-4">
                <Link href={`/dashboard?id=${p.profileId}`} className="break-words text-lg font-extrabold underline decoration-2 underline-offset-2">
                  {p.name}
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold">{pts} pts</span>
                  <Chip colorVar={tier?.colorVar ?? '--white'}>{tier?.name ?? 'Unranked'}</Chip>
                </div>
                <p className="font-mono text-xs">Updated {formatDistanceToNow(parseISO(p.lastFetchedAt), { addSuffix: true })}</p>
                <button
                  type="button"
                  onClick={() => remove(p.profileId)}
                  aria-label={`Remove ${p.name}`}
                  className="w-fit text-xs font-bold uppercase underline"
                >
                  Remove
                </button>
              </Card>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
