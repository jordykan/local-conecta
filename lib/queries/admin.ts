import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

/**
 * Verifica si el usuario actual es admin (community_admin o super_admin)
 * Si no lo es, redirige a la página principal
 */
export async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || (profile.role !== "community_admin" && profile.role !== "super_admin")) {
    redirect("/")
  }

  return { user, profile }
}

/**
 * Obtiene las estadísticas generales del sistema
 */
export async function getAdminStats() {
  const supabase = await createClient()

  const [
    { count: totalBusinesses },
    { count: pendingBusinesses },
    { count: activeBusinesses },
    { count: totalUsers },
    { count: totalBookings },
    { count: totalReviews },
  ] = await Promise.all([
    supabase.from("businesses").select("*", { count: "exact", head: true }),
    supabase.from("businesses").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("businesses").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("reviews").select("*", { count: "exact", head: true }),
  ])

  return {
    totalBusinesses: totalBusinesses ?? 0,
    pendingBusinesses: pendingBusinesses ?? 0,
    activeBusinesses: activeBusinesses ?? 0,
    totalUsers: totalUsers ?? 0,
    totalBookings: totalBookings ?? 0,
    totalReviews: totalReviews ?? 0,
  }
}

/**
 * Obtiene negocios por estado con información del propietario
 */
export async function getBusinessesByStatus(status?: "pending" | "active" | "suspended") {
  const supabase = await createClient()

  let query = supabase
    .from("businesses")
    .select(`
      *,
      owner:profiles!businesses_owner_id_fkey(id, full_name, phone),
      category:categories(name, slug)
    `)
    .order("created_at", { ascending: false })

  if (status) {
    query = query.eq("status", status)
  }

  return query
}

/**
 * Obtiene todas las categorías ordenadas por sort_order
 */
export async function getAllCategories() {
  const supabase = await createClient()

  return supabase.from("categories").select("*").order("sort_order", { ascending: true })
}

/**
 * Actualiza el estado de un negocio
 */
export async function updateBusinessStatus(businessId: string, status: "pending" | "active" | "suspended") {
  const supabase = await createClient()

  return supabase.from("businesses").update({ status, updated_at: new Date().toISOString() }).eq("id", businessId)
}
