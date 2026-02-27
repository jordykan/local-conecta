"use client"

import { useEffect, useState, useCallback, useRef } from "react"
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
  const onNewMessageRef = useRef(onNewMessage)

  // Keep ref updated
  useEffect(() => {
    onNewMessageRef.current = onNewMessage
  }, [onNewMessage])

  // Update messages when initialMessages change (e.g., page refresh)
  // Only reset if we don't have messages yet
  useEffect(() => {
    if (messages.length === 0 || initialMessages.length > messages.length) {
      console.log("[useRealtimeMessages] Resetting messages to initialMessages")
      setMessages(initialMessages)
    }
  }, [initialMessages])

  // Subscribe to new messages
  useEffect(() => {
    if (!isConnected || !conversationId) {
      console.log("[useRealtimeMessages] Not connected or no conversationId", {
        isConnected,
        conversationId,
      })
      return
    }

    console.log("[useRealtimeMessages] Setting up channel for:", conversationId)

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
          console.log("[useRealtimeMessages] New message received:", payload)

          try {
            // Fetch the full message with profile data
            const { data: fullMessage, error } = await supabase
              .from("messages")
              .select(
                `*,
                profiles ( id, full_name, avatar_url )`
              )
              .eq("id", payload.new.id)
              .single()

            if (error) {
              console.error("[useRealtimeMessages] Error fetching message:", error)
              return
            }

            if (fullMessage) {
              console.log("[useRealtimeMessages] Full message fetched:", fullMessage)
              const newMessage = fullMessage as MessageWithSender
              setMessages((prev) => [...prev, newMessage])
              onNewMessageRef.current?.(newMessage)
            } else {
              console.warn("[useRealtimeMessages] No message data returned")
            }
          } catch (err) {
            console.error("[useRealtimeMessages] Exception fetching message:", err)
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
          console.log("[useRealtimeMessages] Message updated:", payload)
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
      .subscribe((status) => {
        console.log("[useRealtimeMessages] Subscription status:", status)
      })

    setChannel(messageChannel)

    return () => {
      console.log("[useRealtimeMessages] Cleaning up channel for:", conversationId)
      supabase.removeChannel(messageChannel)
    }
  }, [supabase, conversationId, isConnected])

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
      console.log("[markAllAsRead] Starting for conversation:", conversationId, "user:", userId)

      const { data, error, count } = await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .neq("sender_id", userId)
        .is("read_at", null)
        .select()

      console.log("[markAllAsRead] Result:", { data, error, count, affectedRows: data?.length })

      if (error) {
        console.error("[markAllAsRead] Error:", error)
      }
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
