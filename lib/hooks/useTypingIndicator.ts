"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRealtimeContext } from "@/lib/contexts/RealtimeContext"
import type { RealtimeChannel } from "@supabase/supabase-js"

type TypingUser = {
  userId: string
  userName: string
  timestamp: number
}

type UseTypingIndicatorOptions = {
  conversationId: string
  currentUserId: string
  currentUserName: string
}

const TYPING_TIMEOUT = 3000 // 3 seconds

export function useTypingIndicator({
  conversationId,
  currentUserId,
  currentUserName,
}: UseTypingIndicatorOptions) {
  const { supabase, isConnected } = useRealtimeContext()
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // Subscribe to typing events
  useEffect(() => {
    if (!isConnected || !conversationId) return

    const typingChannel = supabase.channel(
      `typing:${conversationId}`,
      {
        config: {
          broadcast: { self: false }, // Don't receive your own events
        },
      }
    )

    typingChannel
      .on("broadcast", { event: "typing" }, (payload) => {
        const { userId, userName, isTyping } = payload.payload as {
          userId: string
          userName: string
          isTyping: boolean
        }

        if (userId === currentUserId) return // Ignore self

        if (isTyping) {
          setTypingUsers((prev) => {
            const exists = prev.find((u) => u.userId === userId)
            if (exists) {
              return prev.map((u) =>
                u.userId === userId
                  ? { ...u, timestamp: Date.now() }
                  : u
              )
            }
            return [...prev, { userId, userName, timestamp: Date.now() }]
          })
        } else {
          setTypingUsers((prev) => prev.filter((u) => u.userId !== userId))
        }
      })
      .subscribe()

    setChannel(typingChannel)

    // Clean up stale typing indicators
    const interval = setInterval(() => {
      setTypingUsers((prev) =>
        prev.filter((u) => Date.now() - u.timestamp < TYPING_TIMEOUT)
      )
    }, 1000)

    return () => {
      clearInterval(interval)
      supabase.removeChannel(typingChannel)
    }
  }, [supabase, conversationId, currentUserId, isConnected])

  const sendTypingEvent = useCallback(
    (isTyping: boolean) => {
      if (!channel) return

      channel.send({
        type: "broadcast",
        event: "typing",
        payload: {
          userId: currentUserId,
          userName: currentUserName,
          isTyping,
        },
      })
    },
    [channel, currentUserId, currentUserName]
  )

  const startTyping = useCallback(() => {
    sendTypingEvent(true)

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Auto-stop typing after timeout
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingEvent(false)
    }, TYPING_TIMEOUT)
  }, [sendTypingEvent])

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    sendTypingEvent(false)
  }, [sendTypingEvent])

  return {
    typingUsers,
    startTyping,
    stopTyping,
    isConnected,
  }
}
