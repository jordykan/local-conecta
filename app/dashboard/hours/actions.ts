"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { businessHoursSchema } from "@/lib/validations/business"

export async function updateBusinessHours(businessId: string, data: unknown) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "No autorizado." }

  const { data: business } = await supabase
    .from("businesses")
    .select("id, slug")
    .eq("id", businessId)
    .eq("owner_id", user.id)
    .single()

  if (!business) return { error: "No tienes permiso." }

  const parsed = businessHoursSchema.safeParse(data)
  if (!parsed.success) return { error: "Horarios invalidos." }

  // Delete existing + insert new
  await supabase.from("business_hours").delete().eq("business_id", businessId)

  const records = parsed.data.map((h) => ({
    business_id: businessId,
    day_of_week: h.dayOfWeek,
    open_time: h.isClosed ? null : h.openTime || "09:00",
    close_time: h.isClosed ? null : h.closeTime || "18:00",
    is_closed: h.isClosed,
  }))

  const { error } = await supabase.from("business_hours").insert(records)

  if (error) return { error: "No se pudieron guardar los horarios." }

  revalidatePath("/dashboard/hours")
  revalidatePath(`/businesses/${business.slug}`)
  return { success: true }
}
