"use client"

import { cn } from "@/lib/utils"

type TypingUser = {
  userId: string
  userName: string
  timestamp: number
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[]
  className?: string
}

export function TypingIndicator({ typingUsers, className }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null

  const displayText = getTypingText(typingUsers)

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground",
        className
      )}
    >
      <div className="flex gap-1">
        <span className="size-1.5 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: "0ms" }} />
        <span className="size-1.5 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: "150ms" }} />
        <span className="size-1.5 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: "300ms" }} />
      </div>
      <span>{displayText}</span>
    </div>
  )
}

function getTypingText(users: TypingUser[]): string {
  if (users.length === 0) return ""
  if (users.length === 1) return `${users[0].userName} está escribiendo...`
  if (users.length === 2) {
    return `${users[0].userName} y ${users[1].userName} están escribiendo...`
  }
  return `${users[0].userName} y ${users.length - 1} más están escribiendo...`
}
