"use client"

import { useEffect, useState, useCallback } from "react"
import { useRealtimeContext } from "@/lib/contexts/RealtimeContext"
import type { MessageWithSender } from "@/lib/queries/messages"
import type { RealtimeChannel } from "@supabase/supabase-js"

type UseRealtimeMessagesOptions = {
  conversationId: string
  initialMessages: MessageWithSender[]
  onNewMessage?: (message: MessageWithSender) => void
}

export function useRealtimeMessages({
  conversationId,
  initialMessages,
  onNewMessage,
}: UseRealtimeMessagesOptions) {
  const { supabase, isConnected } = useRealtimeContext()
  const [messages, setMessages] = useState<MessageWithSender[]>(initialMessages)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  // Update messages when initialMessages change (e.g., page refresh)
  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  // Subscribe to new messages
  useEffect(() => {
    if (!isConnected || !conversationId) return

    const messageChannel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch the full message with profile data
          const { data: fullMessage } = await supabase
            .from("messages")
            .select(
              `*,
              profiles ( id, full_name, avatar_url )`
            )
            .eq("id", payload.new.id)
            .single()

          if (fullMessage) {
            const newMessage = fullMessage as MessageWithSender
            setMessages((prev) => [...prev, newMessage])
            onNewMessage?.(newMessage)
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Update message (e.g., when marked as read)
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id
                ? { ...msg, ...payload.new }
                : msg
            )
          )
        }
      )
      .subscribe()

    setChannel(messageChannel)

    return () => {
      supabase.removeChannel(messageChannel)
    }
  }, [supabase, conversationId, isConnected, onNewMessage])

  const markAsRead = useCallback(
    async (messageId: string) => {
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("id", messageId)
    },
    [supabase]
  )

  const markAllAsRead = useCallback(
    async (userId: string) => {
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .neq("sender_id", userId)
        .is("read_at", null)
    },
    [supabase, conversationId]
  )

  return {
    messages,
    isConnected,
    markAsRead,
    markAllAsRead,
    channel,
  }
}
