import Link from "next/link"
import { IconStar, IconMapPin } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export interface BusinessCardProps {
  slug: string
  name: string
  category: string
  categoryColor?: string
  description: string
  coverUrl?: string
  logoUrl?: string
  rating: number
  isOpen: boolean
}

export function BusinessCard({
  slug,
  name,
  category,
  categoryColor = "hsl(25, 95%, 53%)",
  description,
  coverUrl,
  rating,
  isOpen,
  logoUrl,
}: BusinessCardProps) {
  return (
    <Link href={`/businesses/${slug}`} className="group min-w-[260px]">
      <Card className="h-full overflow-hidden border-border/60 py-0 shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
        {/* Cover image */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`Portada de ${name}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${categoryColor}22, ${categoryColor}08)`,
              }}
            >
              <IconMapPin className="size-10 text-primary/30" stroke={1.5} />
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="flex flex-1 flex-col gap-2 p-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
              {name}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{category}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <IconStar className="size-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium">{rating.toFixed(1)}</span>
            </div>
            <span className="text-muted-foreground">·</span>
            <Badge
              variant={isOpen ? "default" : "secondary"}
              className={
                isOpen
                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              }
            >
              {isOpen ? "Abierto" : "Cerrado"}
            </Badge>
          </div>

          <p className="mt-auto line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
