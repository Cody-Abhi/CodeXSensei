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

    const hasMode = filters.has("online") || filters.has("offline");
    const typeFilters: FilterKey[] = [];
    if (filters.has("hackathon")) typeFilters.push("hackathon");
    if (filters.has("meetup")) typeFilters.push("meetup");

    if (hasMode) {
      list = list.filter(
        (e) =>
          (filters.has("online") && isOnline(e)) ||
          (filters.has("offline") && e.mode === "offline")
      );
    }
    if (typeFilters.length) {
      list = list.filter((e) => typeFilters.includes(e.event_type as FilterKey));
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
      {/* Masthead */}
      <header className="mb-8">
        <div className="brutal inline-block bg-brut-pink px-5 py-3">
          <h1 className="display text-3xl uppercase leading-none sm:text-5xl">
            Event<span className="text-white">Radar</span>
          </h1>
        </div>
        <p className="mt-4 max-w-xl text-sm font-semibold sm:text-base">
          Live tech-event finder — hackathons, meetups &amp; more, scraped &amp;
          structured across sources in <span className="bg-brut-yellow px-1">one search.</span>
        </p>
      </header>

      <SearchForm initial={INITIAL_QUERY} loading={loading} onSearch={search} />

      {/* Status strip */}
      {(loading || data) && (
        <div className="mt-6">
          {data && <StatusStrip sources={data.sources} />}
          {loading && (
            <div className="brutal-sm inline-block bg-white px-3 py-1.5 text-xs font-bold uppercase">
              Scanning sources for “{lastQuery.topic}”
              {lastQuery.location ? ` in ${lastQuery.location}` : ""}…
            </div>
          )}
        </div>
      )}

      {/* Fatal error (e.g. missing API keys) */}
      {fatalError && (
        <div className="brutal mt-6 bg-brut-red p-4 text-sm font-semibold text-white">
          <p className="text-base font-bold uppercase">⚠ Something went wrong</p>
          <p className="mt-1">{fatalError}</p>
        </div>
      )}

      {/* Partial-failure banner — shown alongside results */}
      {data && data.errors.length > 0 && (
        <div className="brutal mt-6 bg-brut-orange p-4 text-sm font-semibold">
          <p className="text-base font-bold uppercase">
            ⚠ Some sources didn&apos;t respond
          </p>
          <p className="text-xs">(results below are from the rest)</p>
          <ul className="mt-2 space-y-1">
            {data.errors.map((e, i) => (
              <li key={i} className="border-l-[3px] border-black pl-2">
                {e}
              </li>
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
      <section className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        {!loading &&
          visible.map((e) => (
            <EventCard key={`${e.source_url}-${e.name}`} event={e} />
          ))}
      </section>

      {/* Empty states */}
      {!loading && data && data.events.length === 0 && !fatalError && (
        <div className="brutal mt-10 bg-white p-8 text-center">
          <p className="display text-2xl uppercase">No events found</p>
          <p className="mx-auto mt-3 max-w-md text-sm font-semibold">
            Try broadening the topic (e.g. just “hackathon”) or removing the
            location to search all of India.
          </p>
        </div>
      )}

      {/* Filtered-to-empty */}
      {!loading && hasResults && visible.length === 0 && (
        <div className="brutal mt-10 bg-white p-8 text-center text-sm font-bold uppercase">
          No events match the active filters. Clear a filter to see more.
        </div>
      )}

      {data && (
        <footer className="mt-12 border-t-[3px] border-black pt-4 text-center text-xs font-semibold">
          Fetched {data.events.length} events in {(data.tookMs / 1000).toFixed(1)}s ·
          Missing data always shown as{" "}
          <span className="bg-brut-yellow px-1">“Not listed”</span>, never filled
          from another source.
        </footer>
      )}
    </main>
  );
}
