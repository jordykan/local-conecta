import { createClient } from "@/lib/supabase/server"
import type { Message, Business, Profile } from "@/lib/types/database"

export type ConversationPreview = {
  conversation_id: string
  business_id: string
  last_message: string
  last_message_at: string
  unread_count: number
  businesses: Pick<Business, "id" | "name" | "slug" | "logo_url"> | null
}

export type MessageWithSender = Message & {
  profiles: Pick<Profile, "id" | "full_name" | "avatar_url"> | null
}

export async function getConversationsByUser(userId: string) {
  const supabase = await createClient()

  // 1. Get the user's own business IDs (to exclude business-owner conversations)
  const { data: ownedBusinesses } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", userId)

  const ownedBusinessIds = new Set(
    ownedBusinesses?.map((b) => b.id) ?? []
  )

  // 2. Get conversation IDs where the user has sent at least one message
  const { data: userMessages } = await supabase
    .from("messages")
    .select("conversation_id, business_id")
    .eq("sender_id", userId)

  // Filter out conversations where the user is the business owner
  const userConversationIds = [
    ...new Set(
      userMessages
        ?.filter((m) => !ownedBusinessIds.has(m.business_id))
        .map((m) => m.conversation_id) ?? []
    ),
  ]

  if (userConversationIds.length === 0) return { data: [], error: null }

  // 3. Get ALL messages from those conversations (includes business replies)
  const { data: messages, error } = await supabase
    .from("messages")
    .select(
      `id, conversation_id, sender_id, business_id, content, is_read, created_at,
      businesses ( id, name, slug, logo_url )`
    )
    .in("conversation_id", userConversationIds)
    .order("created_at", { ascending: false })

  if (error || !messages) return { data: [], error }

  // Group by conversation_id, get latest message per conversation
  const conversationsMap = new Map<string, ConversationPreview>()

  for (const msg of messages) {
    if (!conversationsMap.has(msg.conversation_id)) {
      const unreadCount = messages.filter(
        (m) =>
          m.conversation_id === msg.conversation_id &&
          m.sender_id !== userId &&
          !m.is_read
      ).length

      conversationsMap.set(msg.conversation_id, {
        conversation_id: msg.conversation_id,
        business_id: msg.business_id,
        last_message: msg.content,
        last_message_at: msg.created_at,
        unread_count: unreadCount,
        businesses: msg.businesses as ConversationPreview["businesses"],
      })
    }
  }

  return { data: Array.from(conversationsMap.values()), error: null }
}

export async function getMessagesByConversation(
  conversationId: string,
  userId: string
) {
  const supabase = await createClient()

  // Verify user is part of this conversation
  const { data: userMessage } = await supabase
    .from("messages")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("sender_id", userId)
    .limit(1)
    .single()

  if (!userMessage) return { data: [], error: null, business: null }

  // Get conversation info (business)
  const { data: convInfo } = await supabase
    .from("messages")
    .select("business_id, businesses ( id, name, slug, logo_url )")
    .eq("conversation_id", conversationId)
    .limit(1)
    .single()

  // Get all messages in conversation
  const { data: messages, error } = await supabase
    .from("messages")
    .select(
      `*,
      profiles ( id, full_name, avatar_url )`
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  // Mark unread messages as read
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .eq("is_read", false)

  return {
    data: (messages ?? []) as MessageWithSender[],
    error,
    business: convInfo?.businesses as ConversationPreview["businesses"],
  }
}

export type BusinessConversationPreview = {
  conversation_id: string
  business_id: string
  last_message: string
  last_message_at: string
  unread_count: number
  user: Pick<Profile, "id" | "full_name" | "avatar_url"> | null
}

export async function getConversationsByBusiness(businessId: string) {
  const supabase = await createClient()

  const { data: messages, error } = await supabase
    .from("messages")
    .select(
      `id, conversation_id, sender_id, business_id, content, is_read, created_at,
      profiles ( id, full_name, avatar_url )`
    )
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })

  if (error || !messages) return { data: [], error }

  // Group by conversation
  const conversationsMap = new Map<string, BusinessConversationPreview>()

  for (const msg of messages) {
    if (!conversationsMap.has(msg.conversation_id)) {
      // Find the first message from a user (not the business owner) to get the user info
      const userMsg = messages.find(
        (m) =>
          m.conversation_id === msg.conversation_id &&
          m.profiles !== null
      )

      const unreadCount = messages.filter(
        (m) =>
          m.conversation_id === msg.conversation_id &&
          !m.is_read
      ).length

      conversationsMap.set(msg.conversation_id, {
        conversation_id: msg.conversation_id,
        business_id: msg.business_id,
        last_message: msg.content,
        last_message_at: msg.created_at,
        unread_count: unreadCount,
        user: userMsg?.profiles as BusinessConversationPreview["user"],
      })
    }
  }

  return { data: Array.from(conversationsMap.values()), error: null }
}

export async function getMessagesByConversationForBusiness(
  conversationId: string,
  businessId: string
) {
  const supabase = await createClient()

  // Verify this conversation belongs to this business
  const { data: convMsg } = await supabase
    .from("messages")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("business_id", businessId)
    .limit(1)
    .single()

  if (!convMsg) return { data: [], error: null, user: null }

  // Get all messages
  const { data: messages, error } = await supabase
    .from("messages")
    .select(
      `*,
      profiles ( id, full_name, avatar_url )`
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  // Find the user (someone who is not the business owner)
  // We infer this by checking sender_ids — the business owner replies as themselves
  const allSenders = messages?.map((m) => m.profiles).filter(Boolean) ?? []
  const user = allSenders.length > 0 ? allSenders[0] : null

  // Mark unread messages as read (for business owner)
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (authUser) {
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", authUser.id)
      .eq("is_read", false)
  }

  return {
    data: (messages ?? []) as MessageWithSender[],
    error,
    user: user as Pick<Profile, "id" | "full_name" | "avatar_url"> | null,
  }
}

