import { COUNTED_TYPES, SEASON, TYPE_META } from '@/config/arcade';
import { formatMonth } from '@/lib/badges';
import type { BadgeType } from '@/lib/types';
import { cx } from '@/components/ui/cx';
import { Input } from '@/components/ui/Input';

export type Scope = 'season' | 'lifetime';
export type SortKey = 'date-desc' | 'date-asc' | 'name';

export interface FilterState {
  scope: Scope;
  type: BadgeType | 'ALL';
  month: string;
  query: string;
  sort: SortKey;
}

interface Props {
  state: FilterState;
  months: string[];
  onChange: (patch: Partial<FilterState>) => void;
  counts: { season: number; lifetime: number };
}

const selectClass = 'h-12 w-full border-3 border-ink bg-white px-3 font-mono text-sm focus:bg-yellow';
const toggle = (on: boolean) =>
  cx(
    'min-h-11 border-3 border-ink px-3 text-sm font-extrabold uppercase transition-transform duration-100',
    on ? 'translate-x-[2px] translate-y-[2px] shadow-none' : 'shadow-brutal-sm hover:-translate-x-px hover:-translate-y-px',
  );

export function Filters({ state, months, onChange, counts }: Props) {
  return (
    <div className="space-y-4 border-3 border-ink bg-white p-4 shadow-brutal">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Season scope">
        {(['season', 'lifetime'] as const).map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={state.scope === s}
            onClick={() => onChange({ scope: s, month: 'ALL' })}
            className={toggle(state.scope === s)}
            style={{ backgroundColor: state.scope === s ? 'var(--yellow)' : 'var(--white)' }}
          >
            {s === 'season' ? `${SEASON.label} (${counts.season})` : `Lifetime (${counts.lifetime})`}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Badge type">
        {(['ALL', ...COUNTED_TYPES] as const).map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={state.type === t}
            onClick={() => onChange({ type: t })}
            className={toggle(state.type === t)}
            style={{ backgroundColor: state.type === t ? (t === 'ALL' ? 'var(--yellow)' : `var(${TYPE_META[t].colorVar})`) : 'var(--white)' }}
          >
            {t === 'ALL' ? 'All' : TYPE_META[t].label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-xs font-bold uppercase">
          Search
          <Input
            type="search"
            value={state.query}
            onChange={(e) => onChange({ query: e.target.value })}
            placeholder="Badge title"
            className="mt-1 h-12 text-sm"
          />
        </label>
        <label className="block text-xs font-bold uppercase">
          Month
          <select className={`${selectClass} mt-1`} value={state.month} onChange={(e) => onChange({ month: e.target.value })}>
            <option value="ALL">All months</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {formatMonth(m)}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-bold uppercase">
          Sort
          <select
            className={`${selectClass} mt-1`}
            value={state.sort}
            onChange={(e) => onChange({ sort: e.target.value as SortKey })}
          >
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="name">Name A–Z</option>
          </select>
        </label>
      </div>
    </div>
  );
}
