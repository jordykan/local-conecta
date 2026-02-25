import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { Skeleton } from "@/components/ui/skeleton"

export default function PromotionsLoading() {
  return (
    <DashboardShell description="Cargando promociones...">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Skeleton className="mb-2 h-6 w-48" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg border border-border bg-card"
          >
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="p-4">
              <Skeleton className="mb-2 h-5 w-3/4" />
              <Skeleton className="mb-3 h-4 w-full" />
              <Skeleton className="mb-3 h-4 w-2/3" />
              <div className="flex items-center justify-between border-t border-border/50 pt-3">
                <Skeleton className="h-5 w-24" />
                <div className="flex gap-1">
                  <Skeleton className="size-8" />
                  <Skeleton className="size-8" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  )
}
