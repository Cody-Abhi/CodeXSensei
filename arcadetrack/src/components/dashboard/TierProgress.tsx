import { TIERS, TIER_NOTE } from '@/config/arcade';
import { getTierInfo } from '@/lib/points';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function TierProgress({ points }: { points: number }) {
  const { current, next, pointsToNext } = getTierInfo(points);
  const top = TIERS[TIERS.length - 1];
  return (
    <Card>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl uppercase">Tier progress</h2>
        <p className="font-mono text-sm font-bold" aria-live="polite">
          {next ? `${pointsToNext} point${pointsToNext === 1 ? '' : 's'} to ${next.name}` : `${top.name} reached!`}
        </p>
      </div>
      <div className="mt-4">
        <ProgressBar
          label="Progress toward the next Arcade prize tier"
          value={points}
          max={top.min}
          colorVar={(current ?? TIERS[0]).colorVar}
          milestones={TIERS.map((t) => ({ label: t.name, at: t.min }))}
        />
      </div>
      <p className="text-xs">{TIER_NOTE}</p>
    </Card>
  );
}
