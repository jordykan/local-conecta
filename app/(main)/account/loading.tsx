import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export default function AccountLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>

      <div className="flex items-center gap-4">
        <Skeleton className="size-16 rounded-full" />
        <div>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-2 h-3 w-28" />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <Skeleton className="mb-2 h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div>
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div>
          <Skeleton className="mb-2 h-4 w-36" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  )
}
