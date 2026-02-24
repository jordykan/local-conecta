import Link from "next/link"
import { IconArrowRight, IconBuildingStore } from "@tabler/icons-react"
import { BusinessCard } from "@/components/businesses/BusinessCard"
import type { BusinessDirectoryItem } from "@/lib/queries/business"
import { isCurrentlyOpen } from "@/components/businesses/BusinessHoursDisplay"

interface FeaturedBusinessesSectionProps {
  businesses: BusinessDirectoryItem[]
}

export function FeaturedBusinessesSection({
  businesses,
}: FeaturedBusinessesSectionProps) {
  if (businesses.length === 0) return null

  return (
    <section className="bg-muted/30 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Descubre lo que hay en tu comunidad
            </h2>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Negocios destacados cerca de ti
            </p>
          </div>
          <Link
            href="/businesses"
            className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 md:flex"
          >
            Ver todos
            <IconArrowRight className="size-4" />
          </Link>
        </div>

        {/* Mobile: horizontal scroll / Desktop: grid */}
        <div className="mt-8 flex gap-4 overflow-x-auto pb-4 scrollbar-none md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-4">
          {businesses.map((biz) => {
            const hours = biz.business_hours ?? []
            const isOpen = isCurrentlyOpen(hours as any)

            return (
              <BusinessCard
                key={biz.id}
                slug={biz.slug}
                name={biz.name}
                category={biz.categories?.name ?? "Sin categoría"}
                description={
                  biz.short_description || biz.description || ""
                }
                coverUrl={biz.cover_url ?? undefined}
                logoUrl={biz.logo_url ?? undefined}
                rating={4.5}
                isOpen={isOpen}
              />
            )
          })}
        </div>

        <div className="mt-6 flex justify-center md:hidden">
          <Link
            href="/businesses"
            className="flex items-center gap-1 text-sm font-medium text-primary"
          >
            Ver todos los negocios
            <IconArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
