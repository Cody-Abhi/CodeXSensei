export default function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="pointer-events-none absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="mb-3 h-5 w-2/3 rounded bg-white/10" />
      <div className="mb-2 h-3 w-1/3 rounded bg-white/10" />
      <div className="mb-4 h-3 w-1/2 rounded bg-white/10" />
      <div className="mb-4 flex gap-2">
        <div className="h-5 w-16 rounded-full bg-white/10" />
        <div className="h-5 w-20 rounded-full bg-white/10" />
      </div>
      <div className="h-8 w-28 rounded bg-white/10" />
    </div>
  );
}
