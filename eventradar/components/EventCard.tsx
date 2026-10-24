import type { EventItem } from "@/lib/types";
import { formatDate, minutesAgo } from "@/lib/dates";

const TYPE_STYLES: Record<EventItem["event_type"], string> = {
  hackathon: "bg-violet-400/15 text-violet-200 border-violet-400/30",
  meetup: "bg-sky-400/15 text-sky-200 border-sky-400/30",
  conference: "bg-amber-400/15 text-amber-200 border-amber-400/30",
  workshop: "bg-teal-400/15 text-teal-200 border-teal-400/30",
  other: "bg-slate-400/15 text-slate-200 border-slate-400/30",
};

const MODE_LABEL: Record<NonNullable<EventItem["mode"]>, string> = {
  online: "🌐 Online",
  offline: "📍 In person",
  hybrid: "🔀 Hybrid",
};

function checkedLabel(fetchedAt: string): string {
  const m = minutesAgo(fetchedAt);
  if (m <= 0) return "checked just now";
  return `checked ${m} min ago`;
}

export default function EventCard({ event }: { event: EventItem }) {
  const dateLabel = formatDate(event.start_date, event.date_text);
  const dateRange =
    event.end_date && event.end_date !== event.start_date
      ? `${dateLabel} – ${formatDate(event.end_date, "")}`
      : dateLabel;

  return (
    <div className="flex flex-col rounded-xl border border-white/10 bg-white/5 p-5 transition hover:border-white/20 hover:bg-white/[0.07]">
      {/* Title + type chip */}
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug text-white">
          {event.name}
        </h3>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${
            TYPE_STYLES[event.event_type]
          }`}
        >
          {event.event_type}
        </span>
      </div>

      {/* Date (raw text in tooltip) */}
      <div
        className="mb-2 text-sm text-slate-300"
        title={event.date_text || "No raw date text on page"}
      >
        🗓 {dateRange}
      </div>

      {/* Mode + venue */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-300">
        {event.mode ? (
          <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs">
            {MODE_LABEL[event.mode]}
          </span>
        ) : null}
        <span className={event.venue_or_city ? "" : "text-slate-500"}>
          {event.venue_or_city ?? "Venue: not listed"}
        </span>
      </div>

      {/* Themes (up to 3) */}
      {event.themes.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {event.themes.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded bg-white/5 px-2 py-0.5 text-[11px] text-slate-300 ring-1 ring-white/10"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Eligibility */}
      <div className="mb-4 text-sm">
        {event.eligibility ? (
          <span className="text-slate-300">
            <span className="text-slate-500">Eligibility: </span>
            {event.eligibility}
          </span>
        ) : (
          <span className="text-slate-500">Eligibility: not listed</span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-auto flex items-center gap-2">
        {event.registration_url && (
          <a
            href={event.registration_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-400"
          >
            Register
          </a>
        )}
        <a
          href={event.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-white/10"
        >
          View source
        </a>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-[11px] text-slate-500">
        <span>{event.source_name}</span>
        <span>{checkedLabel(event.fetched_at)}</span>
      </div>
    </div>
  );
}
