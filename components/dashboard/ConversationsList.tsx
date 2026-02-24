"use client"

import Link from "next/link"
import { IconUser, IconCircleFilled } from "@tabler/icons-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import type { BusinessConversationPreview } from "@/lib/queries/messages"
import { Badge } from "@/components/ui/badge"

interface ConversationsListProps {
  conversations: BusinessConversationPreview[]
}

export function ConversationsList({ conversations }: ConversationsListProps) {
  return (
    <div className="divide-y rounded-lg border">
      {conversations.map((conv) => (
        <Link
          key={conv.conversation_id}
          href={`/dashboard/messages/${conv.conversation_id}`}
          className="flex items-start gap-3 p-4 transition-colors hover:bg-muted/50"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            {conv.user?.avatar_url ? (
              <img
                src={conv.user.avatar_url}
                alt=""
                className="size-10 rounded-full object-cover"
              />
            ) : (
              <IconUser className="size-5 text-primary" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium">
                {conv.user?.full_name || "Cliente"}
              </p>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(conv.last_message_at), {
                  addSuffix: true,
                  locale: es,
                })}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm text-muted-foreground">
                {conv.last_message}
              </p>
              {conv.unread_count > 0 && (
                <Badge variant="default" className="size-5 shrink-0 justify-center rounded-full p-0 text-[10px]">
                  {conv.unread_count}
                </Badge>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
