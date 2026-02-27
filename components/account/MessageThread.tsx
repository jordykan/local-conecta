"use client"

import { useState, useTransition, useRef, useEffect, useMemo } from "react"
import { IconSend, IconCheck, IconClock, IconAlertCircle } from "@tabler/icons-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { sendMessage } from "@/app/(main)/account/actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TypingIndicator } from "@/components/shared/TypingIndicator"
import { useRealtimeMessages } from "@/lib/hooks/useRealtimeMessages"
import { useTypingIndicator } from "@/lib/hooks/useTypingIndicator"
import type { MessageWithSender } from "@/lib/queries/messages"

type MessageStatus = "sending" | "sent" | "error"

type OptimisticMessage = MessageWithSender & {
  tempId?: string
  status?: MessageStatus
}

interface MessageThreadProps {
  initialMessages: MessageWithSender[]
  conversationId: string
  businessId: string
  currentUserId: string
  currentUserName: string
}

export function MessageThread({
  initialMessages,
  conversationId,
  businessId,
  currentUserId,
  currentUserName,
}: MessageThreadProps) {
  const [content, setContent] = useState("")
  const [pending, startTransition] = useTransition()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [optimisticMessages, setOptimisticMessages] = useState<OptimisticMessage[]>([])

  // Use Realtime hooks
  const { messages: realtimeMessages, markAllAsRead } = useRealtimeMessages({
    conversationId,
    initialMessages,
    onNewMessage: (newMessage) => {
      // Mark as read if message is not from current user
      if (newMessage.sender_id !== currentUserId) {
        markAllAsRead(currentUserId)
      }

      // Remove optimistic message when real message arrives
      setOptimisticMessages((prev) =>
        prev.filter((msg) => msg.content !== newMessage.content)
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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length, typingUsers.length])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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
      const result = await sendMessage(conversationId, businessId, messageContent)

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

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
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
      const result = await sendMessage(conversationId, businessId, message.content)

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
      {/* Messages list */}
      <div
        ref={scrollRef}
        className="max-h-[60vh] min-h-[200px] space-y-3 overflow-y-auto rounded-xl border border-border/60 bg-muted/20 p-4"
      >
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No hay mensajes aun
          </p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === currentUserId
            const initials =
              msg.profiles?.full_name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() ?? "?"
            const status = (msg as OptimisticMessage).status

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2.5",
                  isOwn ? "flex-row-reverse" : "flex-row"
                )}
              >
                <Avatar className="size-7 shrink-0">
                  <AvatarFallback
                    className={cn(
                      "text-[10px] font-semibold",
                      isOwn
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3.5 py-2",
                    isOwn
                      ? "rounded-tr-md bg-primary text-primary-foreground"
                      : "rounded-tl-md bg-card border border-border/60"
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                  <div
                    className={cn(
                      "mt-1 flex items-center gap-1.5 text-[10px]",
                      isOwn
                        ? "text-primary-foreground/60"
                        : "text-muted-foreground"
                    )}
                  >
                    <span suppressHydrationWarning>
                      {new Date(msg.created_at).toLocaleTimeString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isOwn && status && (
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
                              className="ml-1 underline hover:text-primary-foreground transition-colors"
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
              </div>
            )
          })
        )}
        {/* Typing Indicator */}
        <TypingIndicator typingUsers={typingUsers} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <Textarea
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          rows={1}
          className="min-h-[44px] resize-none"
        />
        <Button
          type="submit"
          size="icon"
          disabled={pending || !content.trim()}
          className="size-11 shrink-0"
        >
          <IconSend className="size-4" />
        </Button>
      </form>
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        Presiona Enter para enviar, Shift+Enter para nueva linea
      </p>
    </div>
  )
}
