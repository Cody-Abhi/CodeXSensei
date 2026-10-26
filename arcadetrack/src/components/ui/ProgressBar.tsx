import { cx } from './cx';

export interface Milestone {
  label: string;
  at: number;
}

interface Props {
  value: number;
  max: number;
  milestones: Milestone[];
  colorVar: string;
  label: string;
}

const pct = (n: number, max: number) => Math.max(0, Math.min(100, (n / max) * 100));

export function ProgressBar({ value, max, milestones, colorVar, label }: Props) {
  return (
    <div className="pb-14 sm:pb-12">
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.min(value, max)}
        className="relative h-8 border-3 border-ink bg-white"
      >
        <div
          className="stripes h-full border-r-3 border-ink"
          style={{ width: `${pct(value, max)}%`, backgroundColor: `var(${colorVar})`, borderRightWidth: value > 0 ? 3 : 0 }}
        />
        {milestones.map((m) => (
          <span
            key={m.label}
            aria-hidden
            className="absolute -bottom-2 -top-2 w-[3px] bg-ink"
            style={{ left: `calc(${pct(m.at, max)}% - ${m.at >= max ? 3 : 1}px)` }}
          />
        ))}
      </div>
      <div className="relative mt-3" aria-hidden>
        {milestones.map((m) => {
          const last = m.at >= max;
          return (
            <span
              key={m.label}
              className={cx(
                'absolute top-0 flex flex-col font-mono text-[11px] font-bold leading-tight',
                last ? 'items-end text-right' : '-translate-x-1/2 items-center text-center',
              )}
              style={{ left: `${pct(m.at, max)}%`, ...(last ? { transform: 'translateX(-100%)' } : {}) }}
            >
              <span className="text-sm">{m.at}</span>
              <span className="hidden uppercase sm:block">{m.label}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
