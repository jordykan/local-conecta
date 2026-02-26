"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function toggleFavorite(businessId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Debes iniciar sesión para agregar a favoritos" }
  }

  // Verificar si ya existe
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("business_id", businessId)
    .maybeSingle()

  if (existing) {
    // Remover de favoritos
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", existing.id)

    if (error) {
      return { success: false, error: "No se pudo quitar de favoritos" }
    }

    revalidatePath("/businesses")
    revalidatePath(`/businesses/${businessId}`)
    revalidatePath("/account/favorites")

    return { success: true, action: "removed" }
  } else {
    // Agregar a favoritos
    const { error } = await supabase.from("favorites").insert({
      user_id: user.id,
      business_id: businessId,
    })

    if (error) {
      return { success: false, error: "No se pudo agregar a favoritos" }
    }

    revalidatePath("/businesses")
    revalidatePath(`/businesses/${businessId}`)
    revalidatePath("/account/favorites")

    return { success: true, action: "added" }
  }
}
