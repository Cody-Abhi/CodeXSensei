import { BADGE_TYPES, TYPE_META } from '@/config/arcade';
import { formatDay } from '@/lib/badges';
import type { Badge, BadgeType } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Sticker } from '@/components/ui/Sticker';

interface Props {
  badges: Badge[];
  newIds: Set<string>;
  onOverride: (badgeId: string, type: BadgeType | null) => void;
}

export function BadgeGrid({ badges, newIds, onOverride }: Props) {
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {badges.map((b) => (
        <li key={b.id}>
          <Card className="flex h-full flex-col gap-3 p-4">
            {newIds.has(b.id) && <Sticker />}
            <div className="grid place-items-center border-3 border-ink bg-bg p-3">
              {b.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.imageUrl} alt={b.title} width={120} height={120} loading="lazy" className="h-28 w-28 object-contain" />
              ) : (
                <div className="grid h-28 w-28 place-items-center font-mono text-xs">No image</div>
              )}
            </div>
            <h3 className="break-words text-base leading-snug">
              {b.badgeUrl ? (
                <a href={b.badgeUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-2 underline-offset-2">
                  {b.title}
                </a>
              ) : (
                b.title
              )}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <Chip colorVar={TYPE_META[b.type].colorVar}>{TYPE_META[b.type].label}</Chip>
              {b.overridden && <Chip colorVar="--yellow">Edited</Chip>}
              {!b.earnedAt && <Chip colorVar="--orange">Date unknown</Chip>}
              {b.earnedAt && !b.inSeason && <Chip>Lifetime</Chip>}
            </div>
            <p className="font-mono text-sm">{b.earnedAt ? formatDay(b.earnedAt) : '—'}</p>
            <label className="mt-auto block text-xs font-bold uppercase">
              Type
              <select
                aria-label={`Type for ${b.title}`}
                className="mt-1 h-10 w-full border-3 border-ink bg-white px-2 font-mono text-sm focus:bg-yellow"
                value={b.overridden ? b.type : ''}
                onChange={(e) => onOverride(b.id, (e.target.value || null) as BadgeType | null)}
              >
                <option value="">Auto ({TYPE_META[b.type].label})</option>
                {BADGE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_META[t].label}
                  </option>
                ))}
              </select>
            </label>
          </Card>
        </li>
      ))}
    </ul>
  );
}
