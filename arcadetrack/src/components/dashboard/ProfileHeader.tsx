import { getTierInfo } from '@/lib/points';
import { Stamp } from '@/components/ui/Stamp';
import { Card } from '@/components/ui/Card';
import { TIER_NOTE } from '@/config/arcade';

interface Props {
  name: string;
  avatar: string;
  memberSince: string | null;
  points: number;
}

export function ProfileHeader({ name, avatar, memberSince, points }: Props) {
  const { current } = getTierInfo(points);
  return (
    <Card className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt={`${name} avatar`} width={80} height={80} className="h-20 w-20 border-3 border-ink object-cover" />
        ) : (
          <div aria-hidden className="grid h-20 w-20 place-items-center border-3 border-ink bg-yellow text-3xl font-extrabold">
            {name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="break-words text-2xl uppercase sm:text-3xl">{name}</h1>
          {memberSince && <p className="font-mono text-sm">Member since {memberSince}</p>}
        </div>
      </div>
      <div className="flex items-center gap-5 self-start sm:self-auto">
        <div>
          <p className="text-xs font-bold uppercase">Arcade points</p>
          <p className="font-mono text-[96px] font-bold leading-none" aria-label={`${points} points`}>
            {points}
          </p>
        </div>
        <div title={TIER_NOTE}>
          {current ? (
            <Stamp colorVar={current.colorVar}>{current.name}</Stamp>
          ) : (
            <Stamp colorVar="--white" className="text-lg">
              Unranked
            </Stamp>
          )}
        </div>
      </div>
    </Card>
  );
}
