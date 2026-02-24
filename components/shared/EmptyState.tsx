import type { Icon } from "@tabler/icons-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon: Icon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

export function EmptyState({
  icon: IconComponent,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/40 px-6 py-16 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted/50">
        <IconComponent className="size-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Button size="lg" asChild className="mt-6">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  )
}
