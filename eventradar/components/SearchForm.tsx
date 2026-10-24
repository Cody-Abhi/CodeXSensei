"use client";

import { useState } from "react";
import type { SearchQuery } from "@/lib/types";

export default function SearchForm({
  initial,
  loading,
  onSearch,
}: {
  initial: SearchQuery;
  loading: boolean;
  onSearch: (q: SearchQuery) => void;
}) {
  const [topic, setTopic] = useState(initial.topic);
  const [location, setLocation] = useState(initial.location);
  const [online, setOnline] = useState(initial.online);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = topic.trim();
    if (!t) return;
    onSearch({ topic: t, location: location.trim() || "India", online });
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-slate-400">
          Topic <span className="text-rose-400">*</span>
        </label>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
          placeholder="e.g. AI hackathon"
          className="w-full rounded-lg border border-white/10 bg-ink/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-400/50"
        />
      </div>

      <div className="sm:w-48">
        <label className="mb-1 block text-xs font-medium text-slate-400">
          Location
        </label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="India"
          className="w-full rounded-lg border border-white/10 bg-ink/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-400/50"
        />
      </div>

      <label className="flex cursor-pointer select-none items-center gap-2 py-2 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={online}
          onChange={(e) => setOnline(e.target.checked)}
          className="h-4 w-4 accent-indigo-500"
        />
        Online only
      </label>

      <button
        type="submit"
        disabled={loading || !topic.trim()}
        className="rounded-lg bg-indigo-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
