import { Skeleton } from "@/components/ui/skeleton"

export default function BookingsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-6 w-36" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      <Skeleton className="h-10 w-56" />

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/60 p-4"
          >
            <div className="flex items-start gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
