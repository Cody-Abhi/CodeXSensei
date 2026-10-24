import { getTinyFish, fetchPages, type MarkdownPage } from "./tinyfish";
import { buildFixedSources, sourceNameFromUrl } from "./sources";
import { extractFromPage } from "./extract";
import { postProcess } from "./postprocess";
import {
  fetchUnstopViaAgent,
  unstopEnabled,
  UNSTOP_SOURCE,
} from "./unstop";
import type {
  EventItem,
  EventsApiResponse,
  ExtractedEvent,
  SearchQuery,
  SourceStatus,
} from "./types";

const MAX_SEARCH_URLS = 5;

/**
 * The full EventRadar pipeline (PRD steps A–E):
 *   A. fixed source URLs from the query
 *   B. TinyFish Search → top 5 new URLs
 *   C. TinyFish Fetch all URLs (markdown), per-URL failures recorded
 *   D. LLM extraction per page (zod-validated, retry once)
 *   E. post-process: filter / dedupe / sort
 * One failing source never fails the whole request.
 */
export async function runPipeline(query: SearchQuery): Promise<EventsApiResponse> {
  const started = Date.now();
  const fetchedAt = new Date().toISOString();
  const client = getTinyFish();

  // A. Fixed sources.
  const fixed = buildFixedSources(query);
  const urlToName = new Map<string, string>();
  for (const s of fixed) urlToName.set(s.url, s.name);

  // B. TinyFish Search → take top 5 URLs not already in the fixed list.
  let searchError: string | null = null;
  const searchUrls: string[] = [];
  try {
    const res = await client.search.query({
      query: `${query.topic} hackathon OR meetup ${query.location} 2026`,
      location: "IN",
    });
    for (const r of res.results ?? []) {
      if (searchUrls.length >= MAX_SEARCH_URLS) break;
      if (!r.url || urlToName.has(r.url)) continue;
      if (searchUrls.includes(r.url)) continue;
      searchUrls.push(r.url);
      urlToName.set(r.url, sourceNameFromUrl(r.url));
    }
  } catch (err) {
    searchError = err instanceof Error ? err.message : String(err);
  }

  const allUrls = [...fixed.map((s) => s.url), ...searchUrls];

  // C. Fetch everything as markdown (chunked to 10/call inside fetchPages).
  const { pages, errors: fetchErrors } = await fetchPages(allUrls);
  const fetchedByUrl = new Map<string, MarkdownPage>();
  for (const p of pages) fetchedByUrl.set(p.url, p);
  const errorByUrl = new Map<string, string>();
  for (const e of fetchErrors) errorByUrl.set(e.url, e.error);

  // D. Extract from each fetched page in parallel.
  const extractions = await Promise.all(
    pages.map(async (page) => ({
      url: page.url,
      events: await extractFromPage(page),
    }))
  );
  const eventsByUrl = new Map<string, ExtractedEvent[]>();
  for (const x of extractions) eventsByUrl.set(x.url, x.events);

  // Optional: Unstop via the Agent API (only when explicitly enabled).
  let unstop: { events: ExtractedEvent[]; error: string | null } | null = null;
  if (unstopEnabled()) {
    unstop = await fetchUnstopViaAgent(query.topic);
  }

  // Assemble the raw list (url → events) with source names for post-process.
  const raw: { event: ExtractedEvent; sourceName: string }[] = [];
  for (const [url, events] of eventsByUrl) {
    const name = urlToName.get(url) ?? sourceNameFromUrl(url);
    for (const event of events) raw.push({ event, sourceName: name });
  }
  if (unstop) {
    for (const event of unstop.events) {
      raw.push({ event, sourceName: UNSTOP_SOURCE.name });
    }
  }

  // E. Post-process into the final honest list.
  const events: EventItem[] = postProcess(raw, query, fetchedAt);

  // Per-source status strip. Count kept events per source after post-process.
  const keptBySource = new Map<string, number>();
  for (const e of events) {
    keptBySource.set(e.source_name, (keptBySource.get(e.source_name) ?? 0) + 1);
  }

  const sources: SourceStatus[] = [];
  const sourceEntries = [
    ...fixed.map((s) => ({ name: s.name, url: s.url })),
    ...searchUrls.map((u) => ({ name: urlToName.get(u) ?? sourceNameFromUrl(u), url: u })),
  ];
  for (const s of sourceEntries) {
    const fetchErr = errorByUrl.get(s.url);
    const got = fetchedByUrl.has(s.url);
    const extractedCount = eventsByUrl.get(s.url)?.length ?? 0;
    const kept = keptBySource.get(s.name) ?? 0;
    sources.push({
      name: s.name,
      url: s.url,
      ok: got && !fetchErr,
      count: kept || extractedCount,
      error: fetchErr ?? (got ? null : "no response"),
    });
  }
  if (unstop) {
    sources.push({
      name: UNSTOP_SOURCE.name,
      url: UNSTOP_SOURCE.url,
      ok: unstop.error === null,
      count: keptBySource.get(UNSTOP_SOURCE.name) ?? unstop.events.length,
      error: unstop.error,
    });
  }

  // Human-readable failed-source summaries for the error banner.
  const errors: string[] = [];
  if (searchError) errors.push(`TinyFish Search failed: ${searchError}`);
  for (const s of sources) {
    if (!s.ok && s.error) errors.push(`${s.name}: ${s.error}`);
  }

  return {
    query,
    events,
    sources,
    errors,
    tookMs: Date.now() - started,
  };
}
