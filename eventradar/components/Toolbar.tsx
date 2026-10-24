"use client";

export type SortKey = "date" | "source";
export type FilterKey = "online" | "offline" | "hackathon" | "meetup";

const FILTERS: { key: FilterKey; label: string; color: string }[] = [
  { key: "online", label: "Online", color: "bg-brut-cyan" },
  { key: "offline", label: "Offline", color: "bg-brut-lime" },
  { key: "hackathon", label: "Hackathon", color: "bg-brut-purple" },
  { key: "meetup", label: "Meetup", color: "bg-brut-orange" },
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
      <div className="brutal-sm bg-brut-yellow px-3 py-1.5 text-sm font-bold uppercase">
        {count} {count === 1 ? "event" : "events"}
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
              className={`brutal-press px-3 py-1.5 text-xs font-bold uppercase ${
                active ? f.color : "bg-white"
              }`}
            >
              {f.label}
            </button>
          );
        })}

        {/* Sort */}
        <label className="ml-1 flex items-center gap-1.5 text-xs font-bold uppercase">
          Sort
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="brutal-sm cursor-pointer bg-white px-2 py-1.5 text-xs font-bold uppercase outline-none"
          >
            <option value="date">Date</option>
            <option value="source">Source</option>
          </select>
        </label>
      </div>
    </div>
  );
}
