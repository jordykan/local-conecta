"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

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

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    business_id: businessId,
    content: trimmed,
  })

  if (error) return { error: "No se pudo enviar el mensaje." }

  revalidatePath(`/dashboard/messages/${conversationId}`)
  revalidatePath(`/dashboard/messages`)
  revalidatePath(`/account/messages`)
  return { success: true }
}
