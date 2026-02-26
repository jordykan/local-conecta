import {
  IconPhoto,
  IconMapPin,
  IconCircleFilled,
  IconBrandWhatsapp,
  IconPhone,
  IconStarFilled,
} from "@tabler/icons-react"
import type { Business, Category } from "@/lib/types/database"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ShareButton } from "./ShareButton"
import { FavoriteButton } from "@/components/shared/FavoriteButton"

interface BusinessProfileProps {
  business: Business & { categories: Category | null }
  isOpen: boolean
  isFavorited?: boolean
}

function formatWhatsAppUrl(number: string): string {
  const cleaned = number.replace(/\D/g, "")
  return `https://wa.me/${cleaned}`
}

export function BusinessProfile({
  business,
  isOpen,
  isFavorited = false,
}: BusinessProfileProps) {
  return (
    <div>
      {/* Cover */}
      <div className="h-36 overflow-hidden bg-muted sm:h-48 lg:h-56">
        {business.cover_url ? (
          <img
            src={business.cover_url}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-muted">
            <IconPhoto className="size-12 text-muted-foreground/15" />
          </div>
        )}
      </div>

      {/* Profile info */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Logo overlapping cover */}
        <div className="-mt-12 sm:-mt-14">
          <div className="size-24 shrink-0 overflow-hidden rounded-2xl border-4 border-background bg-card shadow-md sm:size-28">
            {business.logo_url ? (
              <img
                src={business.logo_url}
                alt={business.name}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-primary/5">
                <span className="text-3xl font-bold text-primary/40 sm:text-4xl">
                  {business.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Name + meta */}
        <div className="mt-3">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {business.name}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {business.categories && (
              <Badge variant="secondary" className="text-xs">
                {business.categories.name}
              </Badge>
            )}
            {business.is_featured && (
              <Badge className="gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-xs">
                <IconStarFilled className="h-3 w-3" />
                Destacado
              </Badge>
            )}
            {business.address && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <IconMapPin className="size-3.5 shrink-0" />
                <span className="line-clamp-1">{business.address}</span>
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                isOpen
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground"
              }`}
            >
              <IconCircleFilled className="size-2" />
              {isOpen ? "Abierto ahora" : "Cerrado"}
            </span>
          </div>

          {/* Description */}
          {(business.short_description || business.description) && (
            <div className="mt-4">
              {business.short_description && (
                <p className="text-sm font-medium leading-relaxed text-foreground">
                  {business.short_description}
                </p>
              )}
              {business.description && (
                <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {business.description}
                </p>
              )}
            </div>
          )}

          {/* CTA buttons */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {business.whatsapp && (
              <Button
                asChild
                className="flex-1 bg-[#25D366] text-white hover:bg-[#1DA851] sm:flex-initial"
              >
                <a
                  href={formatWhatsAppUrl(business.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconBrandWhatsapp className="mr-2 size-4" />
                  WhatsApp
                </a>
              </Button>
            )}
            {business.phone && (
              <Button
                asChild
                variant="outline"
                className="flex-1 sm:flex-initial"
              >
                <a href={`tel:${business.phone}`}>
                  <IconPhone className="mr-2 size-4" />
                  Llamar
                </a>
              </Button>
            )}
            <FavoriteButton
              businessId={business.id}
              isFavorited={isFavorited}
              variant="outline"
              size="default"
              showLabel
            />
          </div>
        </div>

        <Separator className="mt-6" />
      </div>
    </div>
  )
}
