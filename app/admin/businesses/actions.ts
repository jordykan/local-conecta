"use server"

import { requireAdmin } from "@/lib/queries/admin"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function approveBusiness(businessId: string) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from("businesses")
      .update({
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", businessId)

    if (error) throw error

    revalidatePath("/admin/businesses")
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error al aprobar negocio:", error)
    return { success: false, error: "Error al aprobar el negocio" }
  }
}

export async function suspendBusiness(businessId: string) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from("businesses")
      .update({
        status: "suspended",
        updated_at: new Date().toISOString(),
      })
      .eq("id", businessId)

    if (error) throw error

    revalidatePath("/admin/businesses")
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error al suspender negocio:", error)
    return { success: false, error: "Error al suspender el negocio" }
  }
}

export async function rejectBusiness(businessId: string) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    // Opción 1: Suspender el negocio (más común)
    const { error } = await supabase
      .from("businesses")
      .update({
        status: "suspended",
        updated_at: new Date().toISOString(),
      })
      .eq("id", businessId)

    if (error) throw error

    revalidatePath("/admin/businesses")
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error al rechazar negocio:", error)
    return { success: false, error: "Error al rechazar el negocio" }
  }
}

export async function toggleFeaturedBusiness(businessId: string, isFeatured: boolean) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from("businesses")
      .update({
        is_featured: isFeatured,
        updated_at: new Date().toISOString(),
      })
      .eq("id", businessId)

    if (error) throw error

    revalidatePath("/admin/businesses")
    revalidatePath("/businesses")
    return { success: true }
  } catch (error) {
    console.error("Error al actualizar negocio destacado:", error)
    return { success: false, error: "Error al actualizar el negocio" }
  }
}
