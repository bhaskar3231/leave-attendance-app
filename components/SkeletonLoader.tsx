export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`bg-gray-200 animate-pulse rounded ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div className="w-12 h-12 bg-gray-200 animate-pulse rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonLine className="h-6 w-20" />
        <SkeletonLine className="h-4 w-32" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center justify-between px-6 py-3">
      <div className="space-y-1.5">
        <SkeletonLine className="h-4 w-32" />
        <SkeletonLine className="h-3 w-24" />
      </div>
      <SkeletonLine className="h-5 w-16 rounded-full" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar skeleton */}
      <div className="w-64 min-h-screen bg-gray-900 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-700">
          <div className="h-6 bg-gray-700 animate-pulse rounded w-36" />
        </div>
        <div className="flex-1 px-3 py-4 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 bg-gray-800 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
      {/* Main skeleton */}
      <div className="flex-1 flex flex-col">
        <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
          <div className="h-5 bg-gray-200 animate-pulse rounded w-40" />
        </div>
        <div className="flex-1 p-6 bg-gray-50 space-y-6">
          <div className="grid grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
