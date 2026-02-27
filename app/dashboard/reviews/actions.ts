"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { ownerReplySchema } from "@/lib/validations/review"
import { sendNotificationIfEnabled, NOTIFICATION_TYPE } from "@/lib/services/push-notifications"

async function verifyBusinessOwnership(businessId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { supabase, error: "No autorizado." }

  const { data: business } = await supabase
    .from("businesses")
    .select("id, slug")
    .eq("id", businessId)
    .eq("owner_id", user.id)
    .single()

  if (!business) {
    return {
      supabase,
      error: "No tienes permiso para acceder a este negocio.",
    }
  }

  return { supabase, business, error: null }
}

export async function replyToReview(data: unknown) {
  const parsed = ownerReplySchema.safeParse(data)
  if (!parsed.success) {
    return { error: "Datos inválidos" }
  }

  const { reviewId, ownerReply } = parsed.data

  const supabase = await createClient()

  // Obtener review para verificar ownership del negocio y obtener datos del usuario
  const { data: review } = await supabase
    .from("reviews")
    .select("business_id, user_id")
    .eq("id", reviewId)
    .single()

  if (!review) {
    return { error: "Reseña no encontrada" }
  }

  const { error: authError, business, supabase: authSupabase } = await verifyBusinessOwnership(
    review.business_id,
  )

  if (authError || !business) {
    return { error: authError ?? "Error de autorización" }
  }

  // Get business name for notification
  const { data: businessData } = await authSupabase
    .from("businesses")
    .select("name")
    .eq("id", review.business_id)
    .single()

  const { error } = await supabase
    .from("reviews")
    .update({
      owner_reply: ownerReply,
      owner_replied_at: new Date().toISOString(),
    })
    .eq("id", reviewId)

  if (error) {
    return { error: "No se pudo guardar la respuesta" }
  }

  // Send push notification to the user who wrote the review
  if (businessData) {
    await sendNotificationIfEnabled(
      {
        userId: review.user_id,
        title: "Respuesta a tu reseña",
        body: `${businessData.name} respondió a tu reseña`,
        url: `/businesses/${business.slug}`,
        tag: "review",
        icon: "/icon.svg"
      },
      NOTIFICATION_TYPE.REVIEW_RESPONSE
    )
  }

  revalidatePath("/dashboard/reviews")
  revalidatePath(`/businesses/${business.slug}`)

  return { success: true }
}

export async function deleteOwnerReply(reviewId: string) {
  const supabase = await createClient()

  // Obtener review para verificar ownership
  const { data: review } = await supabase
    .from("reviews")
    .select("business_id")
    .eq("id", reviewId)
    .single()

  if (!review) {
    return { error: "Reseña no encontrada" }
  }

  const { error: authError, business } = await verifyBusinessOwnership(
    review.business_id,
  )

  if (authError || !business) {
    return { error: authError ?? "Error de autorización" }
  }

  const { error } = await supabase
    .from("reviews")
    .update({
      owner_reply: null,
      owner_replied_at: null,
    })
    .eq("id", reviewId)

  if (error) {
    return { error: "No se pudo eliminar la respuesta" }
  }

  revalidatePath("/dashboard/reviews")
  revalidatePath(`/businesses/${business.slug}`)

  return { success: true }
}
