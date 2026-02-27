"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { profileUpdateSchema } from "@/lib/validations/profile"
import { sendNotificationIfEnabled, NOTIFICATION_TYPE } from "@/lib/services/push-notifications"

export async function updateProfile(data: unknown) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "No autorizado." }

  const parsed = profileUpdateSchema.safeParse(data)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos invalidos."
    return { error: firstError }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) return { error: "No se pudo actualizar el perfil." }

  revalidatePath("/account")
  revalidatePath("/", "layout")
  return { success: true }
}

export async function cancelBooking(bookingId: string, reason: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "No autorizado." }

  if (!reason.trim()) return { error: "Indica el motivo de la cancelacion." }

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, user_id, status")
    .eq("id", bookingId)
    .single()

  if (!booking || booking.user_id !== user.id) {
    return { error: "No tienes permiso para cancelar este apartado." }
  }

  if (booking.status !== "pending" && booking.status !== "confirmed") {
    return { error: "Solo puedes cancelar apartados pendientes o confirmados." }
  }

  const { error } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancellation_reason: reason.trim(),
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", bookingId)

  if (error) return { error: "No se pudo cancelar el apartado." }

  revalidatePath("/account/bookings")
  return { success: true }
}

export async function sendMessage(
  conversationId: string,
  businessId: string,
  content: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "No autorizado." }

  if (!content.trim()) return { error: "El mensaje no puede estar vacio." }

  // Get business info and owner for notification
  const { data: business } = await supabase
    .from("businesses")
    .select("name, owner_id")
    .eq("id", businessId)
    .single()

  // Get user profile for notification
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    business_id: businessId,
    content: content.trim(),
  })

  if (error) return { error: "No se pudo enviar el mensaje." }

  // Send push notification to business owner
  if (business && profile) {
    const messagePreview = content.trim().length > 50
      ? content.trim().substring(0, 50) + '...'
      : content.trim()

    await sendNotificationIfEnabled(
      {
        userId: business.owner_id,
        title: `Mensaje de ${profile.full_name}`,
        body: messagePreview,
        url: `/dashboard/messages/${conversationId}`,
        tag: "message",
        icon: "/icon.svg"
      },
      NOTIFICATION_TYPE.NEW_MESSAGE
    )
  }

  revalidatePath(`/account/messages/${conversationId}`)
  return { success: true }
}
