import { redirect } from "next/navigation"
import { IconHeart, IconHeartFilled } from "@tabler/icons-react"
import { createClient } from "@/lib/supabase/server"
import { getFavoritesByUser } from "@/lib/queries/favorites"
import { getAverageRating, countReviews } from "@/lib/queries/reviews"
import { isCurrentlyOpen } from "@/components/businesses/BusinessHoursDisplay"
import { BusinessCard } from "@/components/businesses/BusinessCard"
import { EmptyState } from "@/components/shared/EmptyState"

export const metadata = {
  title: "Mis Favoritos — Local Conecta",
  description: "Negocios que has guardado en tus favoritos",
}

export default async function FavoritesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: favorites } = await getFavoritesByUser(user.id)

  // Filter out favorites with no business (in case business was deleted)
  const validFavorites = (favorites ?? []).filter((fav) => fav.business)

  // Get ratings for each business
  const favoritesWithRatings = await Promise.all(
    validFavorites.map(async (fav) => {
      const [averageRating, totalReviews] = await Promise.all([
        getAverageRating(fav.business_id),
        countReviews(fav.business_id),
      ])
      return { ...fav, averageRating, totalReviews }
    }),
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Mis Favoritos</h2>
        <p className="mt-2 text-muted-foreground">
          {validFavorites.length > 0
            ? `${validFavorites.length} ${validFavorites.length === 1 ? "negocio guardado" : "negocios guardados"}`
            : "Aún no has guardado ningún negocio"}
        </p>
      </div>

      {/* Results */}
      {favoritesWithRatings.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {favoritesWithRatings.map((fav) => {
            const biz = fav.business
            const hours = biz.business_hours ?? []
            const isOpen = isCurrentlyOpen(hours as any)

            return (
              <BusinessCard
                key={biz.id}
                businessId={biz.id}
                slug={biz.slug}
                name={biz.name}
                category={biz.category?.name ?? "Sin categoría"}
                description={biz.short_description || biz.description || ""}
                coverUrl={biz.cover_url ?? undefined}
                logoUrl={biz.logo_url ?? undefined}
                rating={4.5}
                isOpen={isOpen}
                averageRating={fav.averageRating}
                totalReviews={fav.totalReviews}
                isFavorited={true}
              />
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={IconHeart}
          title="No tienes favoritos guardados"
          description="Explora negocios y guarda tus favoritos haciendo clic en el corazón."
          actionLabel="Explorar negocios"
          actionHref="/businesses"
        />
      )}
    </div>
  )
}
