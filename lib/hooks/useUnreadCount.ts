"use client"

import { useEffect, useState, useCallback } from "react"
import { useRealtimeContext } from "@/lib/contexts/RealtimeContext"

type UseUnreadCountOptions = {
  userId: string
  businessId?: string // If user is business owner, pass business ID
}

export function useUnreadCount({ userId, businessId }: UseUnreadCountOptions) {
  const { supabase, isConnected } = useRealtimeContext()
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch initial count
  const fetchCount = useCallback(async () => {
    try {
      setLoading(true)

      if (businessId) {
        // Business owner: count messages TO the business
        const { data, error } = await supabase.rpc(
          "get_business_unread_count",
          { business_uuid: businessId }
        )

        if (!error && typeof data === "number") {
          setCount(data)
        }
      } else {
        // Regular user: count messages in their conversations
        const { data, error } = await supabase.rpc("get_unread_count", {
          user_uuid: userId,
        })

        if (!error && typeof data === "number") {
          setCount(data)
        }
      }
    } catch (error) {
      console.error("Error fetching unread count:", error)
    } finally {
      setLoading(false)
    }
  }, [supabase, userId, businessId])

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchCount()
    }
  }, [userId, fetchCount])

  // Subscribe to message changes
  useEffect(() => {
    if (!isConnected || !userId) return

    // Get user's conversation IDs first
    const setupSubscription = async () => {
      let conversationIds: string[] = []

      if (businessId) {
        // For business owners, subscribe to all messages for their business
        const { data } = await supabase
          .from("messages")
          .select("conversation_id")
          .eq("business_id", businessId)

        conversationIds = [
          ...new Set(data?.map((m) => m.conversation_id) ?? []),
        ]
      } else {
        // For regular users, subscribe to their conversations
        const { data } = await supabase
          .from("messages")
          .select("conversation_id")
          .eq("sender_id", userId)

        conversationIds = [
          ...new Set(data?.map((m) => m.conversation_id) ?? []),
        ]
      }

      if (conversationIds.length === 0) return

      // Subscribe to changes in all user's conversations
      const channel = supabase
        .channel(`unread:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
          },
          (payload) => {
            // Check if message is in user's conversations and not sent by user
            if (
              conversationIds.includes(payload.new.conversation_id as string) &&
              payload.new.sender_id !== userId
            ) {
              setCount((prev) => prev + 1)
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "messages",
          },
          (payload) => {
            // If message was marked as read, decrease count
            if (
              payload.new.read_at &&
              !payload.old.read_at &&
              conversationIds.includes(payload.new.conversation_id as string)
            ) {
              setCount((prev) => Math.max(0, prev - 1))
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    setupSubscription()
  }, [supabase, userId, businessId, isConnected])

  const refresh = useCallback(() => {
    fetchCount()
  }, [fetchCount])

  const decrementCount = useCallback(() => {
    setCount((prev) => Math.max(0, prev - 1))
  }, [])

  const resetCount = useCallback(() => {
    setCount(0)
  }, [])

  return {
    count,
    loading,
    isConnected,
    refresh,
    decrementCount,
    resetCount,
  }
}
