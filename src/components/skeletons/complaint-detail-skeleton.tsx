import { ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";
import { MapSkeleton } from "./map-skeleton";

/**
 * Complaint detail loading skeleton matching the reference.
 * Shows: back nav, circular loader, detail rows, map placeholder.
 */
export function ComplaintDetailSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Back navigation */}
      <div className="flex items-center gap-2 text-muted">
        <Icon icon={ArrowLeft} size={20} />
        <span className="text-sm font-medium">Back</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main content */}
        <div className="flex flex-col gap-6">
          {/* Main card */}
          <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-surface p-10 shadow-e1">
            {/* Circular loader */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/20">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/5">
                <Loader2 size={28} className="animate-spin text-primary opacity-60" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-ink">Complaint Details Loading...</h2>
            <p className="text-sm text-muted">Fetching complaint information from the database</p>
          </div>

          {/* Detail rows */}
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6 shadow-e1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton-shimmer-light h-4 w-28 rounded bg-sunken" />
                <div
                  className="skeleton-shimmer-light h-4 flex-1 rounded bg-sunken"
                  style={{ maxWidth: `${60 + (i % 3) * 15}%` }}
                />
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6 shadow-e1">
            <div className="skeleton-shimmer-light h-5 w-24 rounded bg-sunken" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 pl-2">
                <div className="skeleton-shimmer-light mt-1 h-3 w-3 shrink-0 rounded-full bg-sunken" />
                <div className="flex flex-1 flex-col gap-1">
                  <div className="skeleton-shimmer-light h-4 w-48 rounded bg-sunken" />
                  <div className="skeleton-shimmer-light h-3 w-32 rounded bg-sunken" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-6">
          {/* Map */}
          <MapSkeleton className="h-[220px]" />

          {/* Info card */}
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 shadow-e1">
            <div className="skeleton-shimmer-light h-4 w-20 rounded bg-sunken" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="skeleton-shimmer-light h-3 w-20 rounded bg-sunken" />
                <div className="skeleton-shimmer-light h-3 w-24 rounded bg-sunken" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
