"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconUser,
  IconCalendarEvent,
  IconMessageCircle,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/account", label: "Mi cuenta", icon: IconUser },
  { href: "/account/bookings", label: "Mis reservas", icon: IconCalendarEvent },
  { href: "/account/messages", label: "Mis mensajes", icon: IconMessageCircle },
]

export function AccountNav() {
  const pathname = usePathname()

  return (
    <nav>
      {/* Mobile: horizontal tab bar */}
      <div className="flex gap-1 overflow-x-auto border-b border-border/60 pb-px lg:hidden">
        {navItems.map((item) => {
          const isActive =
            item.href === "/account"
              ? pathname === "/account"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="size-[18px]" />
              {item.label}
              {isActive && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </div>

      {/* Desktop: vertical sidebar nav */}
      <div className="hidden space-y-1 lg:block">
        {navItems.map((item) => {
          const isActive =
            item.href === "/account"
              ? pathname === "/account"
              : pathname.startsWith(item.href)

          return (
            <div key={item.href} className="relative">
              {isActive && (
                <div className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
              )}
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <item.icon className="size-[18px] shrink-0" />
                {item.label}
              </Link>
            </div>
          )
        })}
      </div>
    </nav>
  )
}
