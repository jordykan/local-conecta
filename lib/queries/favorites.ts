import { createClient } from "@/lib/supabase/server"
import type { Business } from "@/lib/types/database"

export type FavoriteWithBusiness = {
  id: string
  business_id: string
  created_at: string
  business: Pick<
    Business,
    | "id"
    | "name"
    | "slug"
    | "description"
    | "short_description"
    | "category_id"
    | "logo_url"
    | "cover_url"
    | "status"
  > & {
    category: { name: string; slug: string } | null
    business_hours?: any[]
  }
}

/**
 * Obtiene todos los favoritos de un usuario con info del negocio
 */
export async function getFavoritesByUser(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("favorites")
    .select(
      `
      id,
      business_id,
      created_at,
      business:businesses (
        id,
        name,
        slug,
        description,
        short_description,
        category_id,
        logo_url,
        cover_url,
        status,
        business_hours (
          day_of_week,
          open_time,
          close_time,
          is_closed
        ),
        category:categories (
          name,
          slug
        )
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return { data: data as FavoriteWithBusiness[] | null, error }
}

/**
 * Verifica si un negocio está en favoritos del usuario
 */
export async function isFavorited(userId: string, businessId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("business_id", businessId)
    .maybeSingle()

  if (error) return false
  return !!data
}

/**
 * Cuenta cuántos usuarios tienen este negocio en favoritos
 */
export async function countFavorites(businessId: string) {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from("favorites")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)

  if (error) return 0
  return count ?? 0
}
