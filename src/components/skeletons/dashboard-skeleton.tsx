import { MetricCardSkeletonLight } from "./metric-card-skeleton";
import { ChartSkeleton } from "./chart-skeleton";
import { MapSkeleton } from "./map-skeleton";
import { cn } from "@/lib/cn";

/**
 * Full dashboard skeleton — 4 metric cards, chart, and map.
 * Matches the reference dashboard loading state.
 * Used as a Suspense fallback or loading.tsx in dashboard routes.
 */
export function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
        <p className="text-sm text-muted">Here&apos;s what&apos;s happening in your city today</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCardSkeletonLight />
        <MetricCardSkeletonLight />
        <MetricCardSkeletonLight />
        <MetricCardSkeletonLight />
      </div>

      {/* Chart + Map row */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <ChartSkeleton />
        <MapSkeleton className="h-full min-h-[300px]" />
      </div>
    </div>
  );
}
