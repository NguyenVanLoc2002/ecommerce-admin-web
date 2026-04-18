import { cn } from '@/shared/utils/cn';

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
        className,
      )}
    />
  );
}

export function SkeletonTable({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-0 rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex gap-4 border-b bg-gray-50 px-4 py-3">
        {[40, 200, 120, 100, 80].map((w, i) => (
          <SkeletonBlock key={i} className="h-4" style={{ width: w }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 border-b last:border-0 px-4 py-3.5 items-center">
          <SkeletonBlock className="h-4 w-4 rounded" />
          <SkeletonBlock className="h-4 w-48" />
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-5 w-20 rounded-full" />
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-8 w-8 rounded ml-auto" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <SkeletonBlock className="h-7 w-64" />
        <SkeletonBlock className="h-4 w-40" />
      </div>
      <div className="grid grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-5 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonForm({ fields = 6 }: { fields?: number }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <SkeletonBlock className="h-3 w-28" />
          <SkeletonBlock className="h-9 w-full rounded-md" />
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <SkeletonBlock className="h-9 w-24 rounded-md" />
        <SkeletonBlock className="h-9 w-20 rounded-md" />
      </div>
    </div>
  );
}

export function SkeletonTimeline({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <SkeletonBlock className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5 pt-1">
            <SkeletonBlock className="h-4 w-48" />
            <SkeletonBlock className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-3">
      <SkeletonBlock className="h-4 w-28" />
      <SkeletonBlock className="h-8 w-36" />
      <SkeletonBlock className="h-3 w-20" />
    </div>
  );
}
