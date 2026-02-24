import { Skeleton } from "@/components/ui/skeleton"

export default function MessagesLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-6 w-36" />
        <Skeleton className="mt-2 h-4 w-48" />
      </div>

      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border border-border/60 p-4"
          >
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="size-4" />
          </div>
        ))}
      </div>
    </div>
  )
}
