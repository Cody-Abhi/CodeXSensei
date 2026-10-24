"use client";

import { useMemo, useState } from "react";
import SearchForm from "@/components/SearchForm";
import StatusStrip from "@/components/StatusStrip";
import EventCard from "@/components/EventCard";
import SkeletonCard from "@/components/SkeletonCard";
import Toolbar, { type SortKey, type FilterKey } from "@/components/Toolbar";
import type { EventsApiResponse, EventItem, SearchQuery } from "@/lib/types";

const INITIAL_QUERY: SearchQuery = {
  topic: "AI hackathon",
  location: "Bangalore",
  online: false,
};

function isOnline(e: EventItem): boolean {
  return e.mode === "online" || e.mode === "hybrid";
}

export default function Home() {
  const [data, setData] = useState<EventsApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<SearchQuery>(INITIAL_QUERY);

  const [sort, setSort] = useState<SortKey>("date");
  const [filters, setFilters] = useState<Set<FilterKey>>(new Set());

  async function search(query: SearchQuery) {
    setLoading(true);
    setFatalError(null);
    setData(null);
    setLastQuery(query);
    setFilters(new Set());
    try {
      const params = new URLSearchParams({
        topic: query.topic,
        location: query.location,
        online: String(query.online),
      });
      const res = await fetch(`/api/events?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) {
        setFatalError(json.error ?? `Request failed (${res.status})`);
        return;
      }
      setData(json as EventsApiResponse);
    } catch (err) {
      setFatalError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function toggleFilter(f: FilterKey) {
    setFilters((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  }

  const visible = useMemo(() => {
    if (!data) return [];
    let list = data.events;

    const modeFilters: FilterKey[] = [];
    const typeFilters: FilterKey[] = [];
    if (filters.has("online")) modeFilters.push("online");
    if (filters.has("offline")) modeFilters.push("offline");
    if (filters.has("hackathon")) typeFilters.push("hackathon");
    if (filters.has("meetup")) typeFilters.push("meetup");

    if (modeFilters.length) {
      list = list.filter((e) => {
        const online = isOnline(e);
        return (
          (filters.has("online") && online) ||
          (filters.has("offline") && e.mode === "offline")
        );
      });
    }
    if (typeFilters.length) {
      list = list.filter((e) =>
        typeFilters.includes(e.event_type as FilterKey)
      );
    }

    const sorted = [...list];
    if (sort === "source") {
      sorted.sort((a, b) => a.source_name.localeCompare(b.source_name));
    }
    // "date" order already applied by the pipeline; keep it.
    return sorted;
  }, [data, filters, sort]);

  const hasResults = data && data.events.length > 0;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Event<span className="text-indigo-400">Radar</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Live tech-event finder — hackathons, meetups &amp; more, aggregated
          across sources in one search.
        </p>
      </header>

      <SearchForm initial={INITIAL_QUERY} loading={loading} onSearch={search} />

      {/* Status strip */}
      {(loading || data) && (
        <div className="mt-6">
          {data && <StatusStrip sources={data.sources} />}
          {loading && (
            <div className="text-xs text-slate-400">
              Scanning sources for “{lastQuery.topic}”
              {lastQuery.location ? ` in ${lastQuery.location}` : ""}…
            </div>
          )}
        </div>
      )}

      {/* Fatal error (e.g. missing API keys) */}
      {fatalError && (
        <div className="mt-6 rounded-lg border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          <p className="font-semibold">Something went wrong</p>
          <p className="mt-1 text-rose-200/80">{fatalError}</p>
        </div>
      )}

      {/* Partial-failure banner — shown alongside results */}
      {data && data.errors.length > 0 && (
        <div className="mt-6 rounded-lg border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          <p className="font-semibold">
            Some sources didn&apos;t respond (results below are from the rest)
          </p>
          <ul className="mt-1 list-inside list-disc text-amber-100/80">
            {data.errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Toolbar */}
      {hasResults && (
        <div className="mt-8">
          <Toolbar
            count={visible.length}
            sort={sort}
            onSortChange={setSort}
            activeFilters={filters}
            onToggleFilter={toggleFilter}
          />
        </div>
      )}

      {/* Results / skeletons */}
      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        {!loading &&
          visible.map((e) => (
            <EventCard key={`${e.source_url}-${e.name}`} event={e} />
          ))}
      </section>

      {/* Empty states */}
      {!loading && data && data.events.length === 0 && !fatalError && (
        <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-lg font-semibold text-white">No events found</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            Try broadening the topic (e.g. just “hackathon”) or removing the
            location to search all of India.
          </p>
        </div>
      )}

      {/* Filtered-to-empty */}
      {!loading && hasResults && visible.length === 0 && (
        <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400">
          No events match the active filters. Clear a filter to see more.
        </div>
      )}

      {data && (
        <footer className="mt-10 text-center text-xs text-slate-600">
          Fetched {data.events.length} events in {(data.tookMs / 1000).toFixed(1)}s ·
          Missing data always shown as “Not listed”, never filled from another
          source.
        </footer>
      )}
    </main>
  );
}
