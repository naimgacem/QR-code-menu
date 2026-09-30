/**
 * Loading placeholders shaped like the screens they stand in for, so the
 * layout doesn't jump when the real content streams in.
 */

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`admin-skeleton ${className}`} />;
}

function HeaderSkeleton() {
  return (
    <div className="mb-8 space-y-3">
      <Skeleton className="h-8 w-52 rounded-lg" />
      <Skeleton className="h-4 w-72 max-w-full rounded" />
    </div>
  );
}

export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Chargement…">
      <HeaderSkeleton />
      <Skeleton className="mb-4 h-11 w-full rounded-[10px]" />
      <div className="mb-6 flex gap-2">
        {["w-16", "w-[72px]", "w-20", "w-[88px]"].map((w) => (
          <Skeleton key={w} className={`h-8 rounded-full ${w}`} />
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-line-soft bg-surface">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-line-soft px-4 py-3 last:border-b-0"
          >
            <Skeleton className="h-14 w-14 flex-shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/5 rounded" />
              <Skeleton className="h-3.5 w-24 rounded" />
            </div>
            <Skeleton className="h-6 w-10 flex-shrink-0 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div aria-busy="true" aria-label="Chargement…">
      <Skeleton className="mb-3 h-5 w-20 rounded" />
      <HeaderSkeleton />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-line-soft bg-surface p-5">
            <Skeleton className="mb-4 h-4 w-24 rounded" />
            <Skeleton className="aspect-[4/3] w-full max-w-md rounded-xl" />
          </div>
          <div className="space-y-5 rounded-2xl border border-line-soft bg-surface p-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3.5 w-28 rounded" />
                <Skeleton className="h-11 w-full rounded-[10px]" />
              </div>
            ))}
          </div>
        </div>
        <div className="hidden space-y-5 lg:block">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Chargement…">
      <HeaderSkeleton />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[108px] rounded-2xl" />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}
