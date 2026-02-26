"use server"

import { trackProfileView } from "@/lib/queries/analytics"
import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"

/**
 * Registra una vista al perfil público de un negocio
 */
export async function registerProfileView(businessId: string) {
  try {
    const supabase = await createClient()
    const headersList = await headers()

    // Obtener usuario actual (si está autenticado)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Obtener IP y user agent del visitante
    const ipAddress = headersList.get("x-forwarded-for") ?? null
    const userAgent = headersList.get("user-agent") ?? null

    await trackProfileView(businessId, user?.id ?? null, ipAddress, userAgent)

    return { success: true }
  } catch (error) {
    console.error("Error registering profile view:", error)
    return { success: false }
  }
}
