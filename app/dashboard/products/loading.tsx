import { Skeleton } from "@/components/ui/skeleton"

export default function ProductsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Tabs */}
      <Skeleton className="h-10 w-72" />

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border">
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-3 w-full" />
              <div className="flex items-center justify-between border-t pt-3">
                <Skeleton className="h-5 w-20" />
                <div className="flex gap-1">
                  <Skeleton className="size-8" />
                  <Skeleton className="size-8" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
