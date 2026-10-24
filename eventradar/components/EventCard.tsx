import type { EventItem } from "@/lib/types";
import { formatDate, minutesAgo } from "@/lib/dates";

const TYPE_STYLES: Record<EventItem["event_type"], string> = {
  hackathon: "bg-brut-purple",
  meetup: "bg-brut-cyan",
  conference: "bg-brut-orange",
  workshop: "bg-brut-lime",
  other: "bg-white",
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
    <div className="brutal flex flex-col bg-white p-5 transition-transform hover:-translate-y-1">
      {/* Title + type chip */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold leading-tight">{event.name}</h3>
        <span
          className={`shrink-0 border-[3px] border-black px-2 py-0.5 text-[11px] font-bold uppercase ${
            TYPE_STYLES[event.event_type]
          }`}
        >
          {event.event_type}
        </span>
      </div>

      {/* Date (raw text in tooltip) */}
      <div
        className="mb-3 inline-flex w-fit items-center gap-1.5 border-2 border-black bg-brut-yellow px-2 py-0.5 text-sm font-semibold"
        title={event.date_text || "No raw date text on page"}
      >
        🗓 {dateRange}
      </div>

      {/* Mode + venue */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm font-medium">
        {event.mode ? (
          <span className="border-2 border-black bg-paper px-2 py-0.5 text-xs font-bold">
            {MODE_LABEL[event.mode]}
          </span>
        ) : null}
        <span className={event.venue_or_city ? "" : "text-black/40"}>
          {event.venue_or_city ?? "Venue: not listed"}
        </span>
      </div>

      {/* Themes (up to 3) */}
      {event.themes.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {event.themes.slice(0, 3).map((t) => (
            <span
              key={t}
              className="border-2 border-black bg-brut-cyan px-2 py-0.5 text-[11px] font-bold"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Eligibility */}
      <div className="mb-4 text-sm">
        {event.eligibility ? (
          <span>
            <span className="font-bold uppercase">Eligibility: </span>
            {event.eligibility}
          </span>
        ) : (
          <span className="text-black/40">Eligibility: not listed</span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-auto flex flex-wrap items-center gap-2">
        {event.registration_url && (
          <a
            href={event.registration_url}
            target="_blank"
            rel="noopener noreferrer"
            className="brutal-press bg-brut-pink px-3 py-1.5 text-sm font-bold uppercase"
          >
            Register →
          </a>
        )}
        <a
          href={event.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="brutal-press bg-white px-3 py-1.5 text-sm font-bold uppercase"
        >
          View source
        </a>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t-[3px] border-black pt-2 text-[11px] font-bold uppercase">
        <span className="bg-black px-1.5 text-white">{event.source_name}</span>
        <span className="text-black/50">{checkedLabel(event.fetched_at)}</span>
      </div>
    </div>
  );
}
