import { Skeleton } from "@/components/ui/skeleton"

export default function BusinessDetailLoading() {
  return (
    <div className="pb-16">
      {/* Hero */}
      <div className="relative">
        <Skeleton className="h-48 w-full sm:h-64" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="-mt-12 flex items-end gap-4">
            <Skeleton className="size-24 rounded-2xl border-4 border-background" />
            <div className="mb-2 flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto mt-8 max-w-5xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Products skeleton */}
          <div>
            <Skeleton className="mb-4 h-6 w-48" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-xl border">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="space-y-5">
            <Skeleton className="h-10 w-full rounded-lg" />
            <div className="space-y-3 rounded-xl border p-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="space-y-3 rounded-xl border p-4">
              <Skeleton className="h-4 w-36" />
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
