"use client"

import { useState, useTransition, useRef, useEffect, useMemo } from "react"
import { IconSend, IconArrowLeft, IconCheck, IconClock, IconAlertCircle } from "@tabler/icons-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import type { MessageWithSender } from "@/lib/queries/messages"
import { replyAsBusinessOwner } from "@/app/dashboard/messages/actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { TypingIndicator } from "@/components/shared/TypingIndicator"
import { useRealtimeMessages } from "@/lib/hooks/useRealtimeMessages"
import { useTypingIndicator } from "@/lib/hooks/useTypingIndicator"
import { cn } from "@/lib/utils"

type MessageStatus = "sending" | "sent" | "error"

type OptimisticMessage = MessageWithSender & {
  tempId?: string
  status?: MessageStatus
}

interface DashboardMessageThreadProps {
  initialMessages: MessageWithSender[]
  conversationId: string
  businessId: string
  currentUserId: string
  currentUserName: string
  userName: string
}

export function DashboardMessageThread({
  initialMessages,
  conversationId,
  businessId,
  currentUserId,
  currentUserName,
  userName,
}: DashboardMessageThreadProps) {
  const [content, setContent] = useState("")
  const [pending, startTransition] = useTransition()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [optimisticMessages, setOptimisticMessages] = useState<OptimisticMessage[]>([])

  // Use Realtime hooks
  const { messages: realtimeMessages, markAllAsRead } = useRealtimeMessages({
    conversationId,
    initialMessages,
    onNewMessage: (newMessage) => {
      // Mark as read if message is not from current user (business owner)
      if (newMessage.sender_id !== currentUserId) {
        markAllAsRead(currentUserId)
      }

      // Remove optimistic message when real message arrives
      // Match by content AND sender AND timestamp proximity (within 5 seconds)
      setOptimisticMessages((prev) =>
        prev.filter((msg) => {
          const isSameSender = msg.sender_id === newMessage.sender_id
          const isSameContent = msg.content === newMessage.content
          const msgTime = new Date(msg.created_at).getTime()
          const newMsgTime = new Date(newMessage.created_at).getTime()
          const isCloseInTime = Math.abs(msgTime - newMsgTime) < 5000 // Within 5 seconds

          // Keep the optimistic message if it doesn't match
          return !(isSameSender && isSameContent && isCloseInTime)
        })
      )
    },
  })

  // Combine realtime messages with optimistic messages
  const messages = useMemo(() => {
    return [...realtimeMessages, ...optimisticMessages].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  }, [realtimeMessages, optimisticMessages])

  const { typingUsers, startTyping, stopTyping } = useTypingIndicator({
    conversationId,
    currentUserId,
    currentUserName,
  })

  // Auto-scroll when messages or typing users change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length, typingUsers.length])

  // Mark messages as read when entering chat
  useEffect(() => {
    markAllAsRead(currentUserId)
  }, [markAllAsRead, currentUserId])

  function handleSend() {
    if (!content.trim()) return

    stopTyping() // Stop typing indicator

    const messageContent = content.trim()
    const tempId = `temp-${Date.now()}`

    // Create optimistic message
    const optimisticMessage: OptimisticMessage = {
      id: tempId,
      tempId,
      conversation_id: conversationId,
      sender_id: currentUserId,
      business_id: businessId,
      content: messageContent,
      is_read: true,
      created_at: new Date().toISOString(),
      read_at: null,
      profiles: {
        id: currentUserId,
        full_name: currentUserName,
        avatar_url: null,
      },
      status: "sending",
    }

    // Add optimistic message immediately
    setOptimisticMessages((prev) => [...prev, optimisticMessage])
    setContent("")

    // Send message to server
    startTransition(async () => {
      const result = await replyAsBusinessOwner(
        conversationId,
        businessId,
        messageContent
      )

      if (result?.error) {
        // Update status to error
        setOptimisticMessages((prev) =>
          prev.map((msg) =>
            msg.tempId === tempId ? { ...msg, status: "error" as MessageStatus } : msg
          )
        )
        toast.error("Error al enviar mensaje", {
          description: result.error,
        })
      } else {
        // Update status to sent (will be removed when realtime message arrives)
        setOptimisticMessages((prev) =>
          prev.map((msg) =>
            msg.tempId === tempId ? { ...msg, status: "sent" as MessageStatus } : msg
          )
        )
      }
    })
  }

  function retryMessage(messageId: string) {
    const message = optimisticMessages.find((msg) => msg.id === messageId)
    if (!message) return

    // Update status to sending
    setOptimisticMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, status: "sending" as MessageStatus } : msg
      )
    )

    // Retry sending
    startTransition(async () => {
      const result = await replyAsBusinessOwner(
        conversationId,
        businessId,
        message.content
      )

      if (result?.error) {
        setOptimisticMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, status: "error" as MessageStatus } : msg
          )
        )
        toast.error("Error al reenviar mensaje", {
          description: result.error,
        })
      } else {
        setOptimisticMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, status: "sent" as MessageStatus } : msg
          )
        )
      }
    })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value)
    if (e.target.value.trim()) {
      startTyping()
    } else {
      stopTyping()
    }
  }

  // Stop typing when component unmounts
  useEffect(() => {
    return () => {
      stopTyping()
    }
  }, [stopTyping])

  return (
    <div className="flex flex-col">
      {/* Back link */}
      <Link
        href="/dashboard/messages"
        className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <IconArrowLeft className="size-4" />
        Volver a mensajes
      </Link>

      {/* Messages */}
      <div className="mb-4 space-y-3 rounded-lg border p-4" style={{ maxHeight: "60vh", overflowY: "auto" }}>
        {messages.map((msg) => {
          const isOwner = msg.sender_id === currentUserId
          const status = (msg as OptimisticMessage).status

          return (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col gap-1",
                isOwner ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2.5",
                  isOwner
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md bg-muted"
                )}
                suppressHydrationWarning
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              <div
                className="flex items-center gap-1.5 px-1 text-[10px] text-muted-foreground"
                suppressHydrationWarning
              >
                <span suppressHydrationWarning>
                  {format(new Date(msg.created_at), "d MMM, HH:mm", {
                    locale: es,
                  })}
                </span>
                {isOwner && status && (
                  <>
                    {status === "sending" && (
                      <IconClock className="size-3 animate-pulse" />
                    )}
                    {status === "sent" && <IconCheck className="size-3" />}
                    {status === "error" && (
                      <>
                        <IconAlertCircle className="size-3 text-destructive" />
                        <button
                          onClick={() => retryMessage(msg.id)}
                          className="ml-1 underline hover:text-foreground transition-colors"
                          disabled={pending}
                        >
                          Reintentar
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
        {/* Typing Indicator */}
        <TypingIndicator typingUsers={typingUsers} />
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          placeholder={`Responder a ${userName}...`}
          rows={2}
          className="resize-none"
          maxLength={2000}
          disabled={pending}
        />
        <Button
          onClick={handleSend}
          disabled={pending || !content.trim()}
          size="icon"
          className="shrink-0 self-end"
        >
          <IconSend className="size-4" />
        </Button>
      </div>
    </div>
  )
}
