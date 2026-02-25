import { createClient } from "@/lib/supabase/server"
import type { Promotion } from "@/lib/types/database"

/**
 * Obtiene todas las promociones de un negocio (activas e inactivas)
 * Para uso en el dashboard del dueño
 */
export async function getPromotionsByBusiness(businessId: string) {
  const supabase = await createClient()
  return supabase
    .from("promotions")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
}

/**
 * Obtiene solo las promociones activas y vigentes de un negocio
 * Para mostrar en el perfil público
 */
export async function getActivePromotionsByBusiness(businessId: string) {
  const supabase = await createClient()
  const now = new Date().toISOString()

  return supabase
    .from("promotions")
    .select("*")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order("created_at", { ascending: false })
}

/**
 * Obtiene una promoción por ID
 */
export async function getPromotionById(promotionId: string) {
  const supabase = await createClient()
  return supabase.from("promotions").select("*").eq("id", promotionId).single()
}

/**
 * Verifica si un negocio tiene promociones activas
 */
export async function businessHasActivePromotions(
  businessId: string,
): Promise<boolean> {
  const { data } = await getActivePromotionsByBusiness(businessId)
  return (data?.length ?? 0) > 0
}

/**
 * Cuenta las promociones activas de un negocio
 */
export async function countActivePromotions(
  businessId: string,
): Promise<number> {
  const { data } = await getActivePromotionsByBusiness(businessId)
  return data?.length ?? 0
}
