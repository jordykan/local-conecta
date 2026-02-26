"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { IconSend, IconArrowLeft } from "@tabler/icons-react"
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

  // Use Realtime hooks
  const { messages, markAllAsRead } = useRealtimeMessages({
    conversationId,
    initialMessages,
    onNewMessage: (newMessage) => {
      // Mark as read if message is not from current user (business owner)
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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  function handleSend() {
    if (!content.trim()) return

    stopTyping() // Stop typing indicator

    startTransition(async () => {
      const result = await replyAsBusinessOwner(
        conversationId,
        businessId,
        content
      )
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
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              <span className="px-1 text-[10px] text-muted-foreground">
                {format(new Date(msg.created_at), "d MMM, HH:mm", {
                  locale: es,
                })}
              </span>
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
