"use client"

import { cn } from "@/lib/utils"

interface UnreadBadgeProps {
  count: number
  className?: string
  size?: "sm" | "md"
  variant?: "pill" | "dot"
}

export function UnreadBadge({
  count,
  className,
  size = "sm",
  variant = "pill",
}: UnreadBadgeProps) {
  if (count === 0) return null

  if (variant === "dot") {
    return (
      <span
        className={cn(
          "absolute -right-0.5 -top-0.5 flex size-2 rounded-full bg-primary",
          className
        )}
      >
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
      </span>
    )
  }

  const displayCount = count > 99 ? "99+" : count.toString()

  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full bg-primary font-semibold tabular-nums text-primary-foreground",
        size === "sm" && "min-w-5 h-5 px-1.5 text-[10px]",
        size === "md" && "min-w-6 h-6 px-2 text-xs",
        className
      )}
    >
      {displayCount}
    </span>
  )
}
