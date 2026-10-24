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
      className="brutal flex flex-col gap-4 bg-brut-blue p-5 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide">
          Topic <span className="text-brut-red">*</span>
        </label>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
          placeholder="e.g. AI hackathon"
          className="brutal-sm w-full bg-white px-3 py-2.5 text-sm font-semibold placeholder:text-black/40 focus:outline-none focus:shadow-[6px_6px_0_0_#000]"
        />
      </div>

      <div className="sm:w-48">
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide">
          Location
        </label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="India"
          className="brutal-sm w-full bg-white px-3 py-2.5 text-sm font-semibold placeholder:text-black/40 focus:outline-none focus:shadow-[6px_6px_0_0_#000]"
        />
      </div>

      <label className="brutal-sm flex cursor-pointer select-none items-center gap-2 bg-white px-3 py-2.5 text-sm font-bold uppercase">
        <input
          type="checkbox"
          checked={online}
          onChange={(e) => setOnline(e.target.checked)}
          className="h-5 w-5 appearance-none border-[3px] border-black bg-white checked:bg-brut-pink checked:after:ml-[3px] checked:after:block checked:after:h-[10px] checked:after:w-[5px] checked:after:rotate-45 checked:after:border-b-[3px] checked:after:border-r-[3px] checked:after:border-black"
        />
        Online only
      </label>

      <button
        type="submit"
        disabled={loading || !topic.trim()}
        className="brutal-press bg-brut-yellow px-6 py-2.5 text-sm font-bold uppercase disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
