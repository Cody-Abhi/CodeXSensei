import type { Tone } from './Button';
import './ProgressBar.css';

export interface ProgressBarProps {
  /** Current value. */
  value: number;
  /** Maximum value (default 100). */
  max?: number;
  /** Accessible, visible label describing what is progressing. */
  label: string;
  /** Fill tone. */
  tone?: Tone;
}

/**
 * Bordered, striped progress meter with a numeric percentage label. Exposes
 * `role="progressbar"` with value semantics so status is not colour-only
 * (PRD §10/§11).
 *
 * @param props - Progress bar props.
 * @returns A labelled progress meter.
 */
export function ProgressBar({
  value,
  max = 100,
  label,
  tone = 'green',
}: ProgressBarProps): React.JSX.Element {
  const safeMax = max <= 0 ? 100 : max;
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const pct = Math.round((clamped / safeMax) * 100);
  return (
    <div className="pp-progress">
      <div className="pp-progress__head">
        <span className="pp-progress__label">{label}</span>
        <span className="pp-progress__pct">{pct}%</span>
      </div>
      <div
        className="pp-progress__track"
        role="progressbar"
        aria-label={label}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={safeMax}
      >
        <div className={`pp-progress__fill tone-${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
