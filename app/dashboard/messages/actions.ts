"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { sendNotificationIfEnabled, NOTIFICATION_TYPE } from "@/lib/services/push-notifications"

export async function replyAsBusinessOwner(
  conversationId: string,
  businessId: string,
  content: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "No autenticado." }

  // Verify ownership
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("owner_id", user.id)
    .single()

  if (!business) return { error: "No tienes permiso para esta acción." }

  // Verify conversation belongs to this business
  const { data: convMsg } = await supabase
    .from("messages")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("business_id", businessId)
    .limit(1)
    .single()

  if (!convMsg)
    return { error: "Conversación no encontrada." }

  const trimmed = content.trim()
  if (!trimmed) return { error: "El mensaje no puede estar vacío." }
  if (trimmed.length > 2000) return { error: "El mensaje es demasiado largo." }

  // Get business name and find customer (recipient) from previous messages
  const { data: businessData } = await supabase
    .from("businesses")
    .select("name, owner_id")
    .eq("id", businessId)
    .single()

  // Find the customer in this conversation (sender who is not the business owner)
  const { data: previousMessages } = await supabase
    .from("messages")
    .select("sender_id")
    .eq("conversation_id", conversationId)
    .eq("business_id", businessId)
    .neq("sender_id", user.id)
    .limit(1)

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    business_id: businessId,
    content: trimmed,
  })

  if (error) return { error: "No se pudo enviar el mensaje." }

  // Send push notification to the customer
  if (businessData && previousMessages && previousMessages.length > 0) {
    const customerId = previousMessages[0].sender_id
    const messagePreview = trimmed.length > 50 ? trimmed.substring(0, 50) + '...' : trimmed

    await sendNotificationIfEnabled(
      {
        userId: customerId,
        title: `Mensaje de ${businessData.name}`,
        body: messagePreview,
        url: `/account/messages/${conversationId}`,
        tag: "message",
        icon: "/icon.svg"
      },
      NOTIFICATION_TYPE.NEW_MESSAGE
    )
  }

  revalidatePath(`/dashboard/messages/${conversationId}`)
  revalidatePath(`/dashboard/messages`)
  revalidatePath(`/account/messages`)
  return { success: true }
}
