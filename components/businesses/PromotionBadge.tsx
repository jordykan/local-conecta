import { IconTag } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"

export function PromotionBadge({ className }: { className?: string }) {
  return (
    <Badge
      className={`inline-flex items-center gap-1 border-0 bg-primary/90 text-primary-foreground shadow-sm ${className}`}
    >
      <IconTag className="size-3" />
      Promoción
    </Badge>
  )
}
