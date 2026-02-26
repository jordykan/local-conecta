import { Suspense } from "react"
import { IconSearch, IconBuildingStore } from "@tabler/icons-react"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import {
  getBusinessesDirectory,
  getCategories,
} from "@/lib/queries/business"
import type { BusinessDirectoryItem } from "@/lib/queries/business"
import { getAverageRating, countReviews } from "@/lib/queries/reviews"
import { getFavoritesByUser } from "@/lib/queries/favorites"
import { isCurrentlyOpen } from "@/components/businesses/BusinessHoursDisplay"
import { BusinessCard } from "@/components/businesses/BusinessCard"
import { BusinessFilters } from "@/components/businesses/BusinessFilters"
import { SearchBar } from "@/components/shared/SearchBar"
import { EmptyState } from "@/components/shared/EmptyState"

export const metadata: Metadata = {
  title: "Negocios — Local Conecta",
  description:
    "Descubre los negocios locales de tu comunidad. Busca por nombre, categoría y más.",
}

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string; promotions?: string }>
}

export default async function BusinessesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const q = params.q?.trim() ?? ""
  const categorySlug = params.category ?? ""
  const hasPromotionsFilter = params.promotions === "true"

  // Get current user and favorites
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: businesses }, { data: categories }, { data: favorites }] =
    await Promise.all([
      getBusinessesDirectory({
        q: q || undefined,
        categorySlug: categorySlug || undefined,
        hasPromotions: hasPromotionsFilter || undefined,
      }),
      getCategories(),
      user ? getFavoritesByUser(user.id) : Promise.resolve({ data: null }),
    ])

  const allBusinesses = (businesses ?? []) as BusinessDirectoryItem[]
  const allCategories = categories ?? []
  const favoriteIds = new Set(favorites?.map((f) => f.business_id) ?? [])

  // Get category name for heading
  const activeCat = categorySlug
    ? allCategories.find((c) => c.slug === categorySlug)
    : null

  // Obtener ratings para cada negocio
  const businessesWithRatings = await Promise.all(
    allBusinesses.map(async (biz) => {
      const [averageRating, totalReviews] = await Promise.all([
        getAverageRating(biz.id),
        countReviews(biz.id),
      ])
      return { ...biz, averageRating, totalReviews }
    }),
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          {activeCat ? activeCat.name : "Negocios"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {activeCat
            ? `Explora negocios de ${activeCat.name.toLowerCase()} en tu comunidad`
            : "Descubre lo que tu comunidad tiene para ofrecer"}
        </p>
      </div>

      {/* Search bar */}
      <div className="mx-auto mb-6 max-w-lg">
        <SearchBar />
      </div>

      {/* Filters */}
      <Suspense>
        <BusinessFilters categories={allCategories} />
      </Suspense>

      {/* Results */}
      <div className="mt-8">
        {businessesWithRatings.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {businessesWithRatings.length}{" "}
              {businessesWithRatings.length === 1 ? "negocio" : "negocios"}
              {q ? ` para "${q}"` : ""}
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {businessesWithRatings.map((biz) => {
                const hours = biz.business_hours ?? []
                const isOpen = isCurrentlyOpen(hours as any)
                const hasPromotions = (biz.promotions?.length ?? 0) > 0

                return (
                  <BusinessCard
                    key={biz.id}
                    businessId={biz.id}
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
                    hasPromotions={hasPromotions}
                    isFeatured={biz.is_featured}
                    averageRating={biz.averageRating}
                    totalReviews={biz.totalReviews}
                    isFavorited={favoriteIds.has(biz.id)}
                  />
                )
              })}
            </div>
          </>
        ) : (
          <EmptyState
            icon={q ? IconSearch : IconBuildingStore}
            title={q ? "Sin resultados" : "No hay negocios aún"}
            description={
              q
                ? `No encontramos negocios que coincidan con "${q}". Intenta con otro término.`
                : "Aún no hay negocios registrados en esta comunidad."
            }
          />
        )}
      </div>
    </div>
  )
}
