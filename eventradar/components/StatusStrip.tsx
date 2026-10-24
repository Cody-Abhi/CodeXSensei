import type { SourceStatus } from "@/lib/types";

/**
 * Per-source status strip, e.g. "Devfolio ✓ 12 · Devpost ✗ blocked".
 * Green tick + count for a source that returned, red cross + reason for a
 * source that failed — shown even while results render.
 */
export default function StatusStrip({ sources }: { sources: SourceStatus[] }) {
  if (sources.length === 0) return null;
  return (
    <div className="scroll-thin flex gap-2 overflow-x-auto pb-1 text-xs">
      {sources.map((s) => (
        <a
          key={`${s.name}-${s.url}`}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          title={s.error ? `${s.name}: ${s.error}` : `${s.name}: ${s.count} found`}
          className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 transition hover:brightness-125 ${
            s.ok
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
              : "border-rose-400/30 bg-rose-400/10 text-rose-200"
          }`}
        >
          <span className="font-medium">{s.name}</span>
          {s.ok ? (
            <span aria-label="ok">✓ {s.count}</span>
          ) : (
            <span aria-label="failed" className="max-w-[12rem] truncate">
              ✗ {s.error ?? "failed"}
            </span>
          )}
        </a>
      ))}
    </div>
  );
}
