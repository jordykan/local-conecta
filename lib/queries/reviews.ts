import { createClient } from "@/lib/supabase/server"
import type { Review, Profile } from "@/lib/types/database"

export type ReviewWithAuthor = Review & {
  profiles: Pick<Profile, "id" | "full_name" | "avatar_url"> | null
}

/**
 * Obtiene todas las reseñas de un negocio con info del autor
 */
export async function getReviewsByBusiness(businessId: string) {
  const supabase = await createClient()
  return supabase
    .from("reviews")
    .select(`
      *,
      profiles (id, full_name, avatar_url)
    `)
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .returns<ReviewWithAuthor[]>()
}

/**
 * Obtiene reseñas escritas por un usuario
 */
export async function getReviewsByUser(userId: string) {
  const supabase = await createClient()
  return supabase
    .from("reviews")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
}

/**
 * Obtiene una reseña específica
 */
export async function getReviewById(reviewId: string) {
  const supabase = await createClient()
  return supabase
    .from("reviews")
    .select("*")
    .eq("id", reviewId)
    .single()
}

/**
 * Calcula el rating promedio de un negocio
 */
export async function getAverageRating(businessId: string): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("reviews")
    .select("rating")
    .eq("business_id", businessId)

  if (!data || data.length === 0) return 0

  const sum = data.reduce((acc, review) => acc + review.rating, 0)
  return Math.round((sum / data.length) * 10) / 10 // Redondear a 1 decimal
}

/**
 * Cuenta las reseñas de un negocio
 */
export async function countReviews(businessId: string): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("business_id", businessId)

  return count ?? 0
}

/**
 * Verifica si un usuario ya dejó review en un negocio
 */
export async function hasUserReviewed(
  userId: string,
  businessId: string,
): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", userId)
    .eq("business_id", businessId)
    .single()

  return !!data
}

/**
 * Verifica si un usuario puede dejar review (tiene booking completado)
 */
export async function canUserReview(
  userId: string,
  businessId: string,
): Promise<{ canReview: boolean; reason?: string }> {
  const supabase = await createClient()

  // Verificar si ya dejó review
  const hasReviewed = await hasUserReviewed(userId, businessId)
  if (hasReviewed) {
    return { canReview: false, reason: "Ya dejaste una reseña en este negocio" }
  }

  // Verificar si tiene booking completado
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id")
    .eq("user_id", userId)
    .eq("business_id", businessId)
    .eq("status", "completed")
    .limit(1)

  if (!bookings || bookings.length === 0) {
    return {
      canReview: false,
      reason: "Debes tener una reserva completada para dejar una reseña",
    }
  }

  return { canReview: true }
}
