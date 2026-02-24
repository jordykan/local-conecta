"use client"

import Link from "next/link"
import { IconChevronRight } from "@tabler/icons-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { ConversationPreview } from "@/lib/queries/messages"

interface ConversationCardProps {
  conversation: ConversationPreview
}

export function ConversationCard({ conversation }: ConversationCardProps) {
  const timeAgo = formatTimeAgo(conversation.last_message_at)

  return (
    <Link
      href={`/account/messages/${conversation.conversation_id}`}
      className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-border hover:bg-accent/30"
    >
      <Avatar className="size-10 shrink-0">
        {conversation.businesses?.logo_url ? (
          <AvatarImage
            src={conversation.businesses.logo_url}
            alt={conversation.businesses.name ?? ""}
          />
        ) : null}
        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
          {conversation.businesses?.name?.charAt(0).toUpperCase() ?? "N"}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold">
            {conversation.businesses?.name ?? "Negocio"}
          </p>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {timeAgo}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-muted-foreground">
            {conversation.last_message}
          </p>
          {conversation.unread_count > 0 && (
            <Badge className="size-5 shrink-0 justify-center rounded-full p-0 text-[10px]">
              {conversation.unread_count}
            </Badge>
          )}
        </div>
      </div>

      <IconChevronRight className="size-4 shrink-0 text-muted-foreground/50" />
    </Link>
  )
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "ahora"
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`

  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  })
}
