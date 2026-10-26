import { TYPE_META } from '@/config/arcade';
import { Card } from '@/components/ui/Card';
import { skillPairingHint, type PointsBreakdown } from '@/lib/points';

export function StatCards({ b, lifetimeTotal }: { b: PointsBreakdown; lifetimeTotal: number }) {
  const stats = [
    { label: 'Games', value: b.games, colorVar: TYPE_META.GAME.colorVar },
    { label: 'Trivia', value: b.trivia, colorVar: TYPE_META.TRIVIA.colorVar },
    { label: 'Skill Badges', value: b.skills, colorVar: TYPE_META.SKILL.colorVar },
    { label: 'Other', value: b.other, colorVar: TYPE_META.OTHER.colorVar },
    { label: 'Total badges', value: b.total, colorVar: '--yellow' },
  ];
  const hint = skillPairingHint(b.skills);
  return (
    <section aria-label="Season stats" className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 lg:gap-6">
        {stats.map((s, i) => (
          <Card
            key={s.label}
            className={`p-4 ${i === stats.length - 1 ? 'col-span-2 lg:col-span-1' : ''}`}
            style={{ backgroundColor: `var(${s.colorVar})` }}
          >
            <p className="text-xs font-bold uppercase">{s.label}</p>
            <p className="font-mono text-4xl font-bold">{s.value}</p>
          </Card>
        ))}
      </div>
      <p className="border-3 border-ink bg-white p-3 text-sm font-bold">
        {hint.text} <span className="font-mono">({b.skillPoints} pt{b.skillPoints === 1 ? '' : 's'} from skills)</span>
      </p>
      <p className="font-mono text-xs">
        Season counts only. Lifetime: {lifetimeTotal} badge{lifetimeTotal === 1 ? '' : 's'}.
      </p>
    </section>
  );
}
