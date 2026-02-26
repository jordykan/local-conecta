"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { IconSend } from "@tabler/icons-react"
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

  // Use Realtime hooks
  const { messages, markAllAsRead } = useRealtimeMessages({
    conversationId,
    initialMessages,
    onNewMessage: (newMessage) => {
      // Mark as read if message is not from current user
      if (newMessage.sender_id !== currentUserId) {
        markAllAsRead(currentUserId)
      }
    },
  })

  const { typingUsers, startTyping, stopTyping } = useTypingIndicator({
    conversationId,
    currentUserId,
    currentUserName,
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    stopTyping() // Stop typing indicator

    startTransition(async () => {
      const result = await sendMessage(conversationId, businessId, content.trim())

      if (result?.error) {
        toast.error("Error al enviar mensaje", {
          description: result.error
        })
      } else {
        setContent("")
      }
    })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
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
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      isOwn
                        ? "text-primary-foreground/60"
                        : "text-muted-foreground"
                    )}
                  >
                    {new Date(msg.created_at).toLocaleTimeString("es-MX", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
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
