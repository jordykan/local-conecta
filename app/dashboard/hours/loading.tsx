import { Skeleton } from "@/components/ui/skeleton"

export default function HoursLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Days list */}
      <div className="space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border p-4">
            <Skeleton className="h-5 w-24" />
            <div className="flex flex-1 items-center gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-9 w-24" />
            </div>
            <Skeleton className="h-5 w-12" />
          </div>
        ))}
      </div>

      {/* Save button */}
      <Skeleton className="h-10 w-40" />
    </div>
  )
}
