"use client";

export type SortKey = "date" | "source";
export type FilterKey = "online" | "offline" | "hackathon" | "meetup";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "online", label: "Online" },
  { key: "offline", label: "Offline" },
  { key: "hackathon", label: "Hackathon" },
  { key: "meetup", label: "Meetup" },
];

export default function Toolbar({
  count,
  sort,
  onSortChange,
  activeFilters,
  onToggleFilter,
}: {
  count: number;
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
  activeFilters: Set<FilterKey>;
  onToggleFilter: (f: FilterKey) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="text-sm text-slate-400">
        <span className="font-semibold text-slate-200">{count}</span>{" "}
        {count === 1 ? "event" : "events"}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Filter chips */}
        {FILTERS.map((f) => {
          const active = activeFilters.has(f.key);
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => onToggleFilter(f.key)}
              aria-pressed={active}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                active
                  ? "border-indigo-400/50 bg-indigo-500/20 text-indigo-100"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {f.label}
            </button>
          );
        })}

        {/* Sort */}
        <label className="ml-1 flex items-center gap-1.5 text-xs text-slate-400">
          Sort
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-200 outline-none focus:border-indigo-400/50"
          >
            <option value="date">Date</option>
            <option value="source">Source</option>
          </select>
        </label>
      </div>
    </div>
  );
}
