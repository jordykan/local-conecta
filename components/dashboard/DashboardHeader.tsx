"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTransition } from "react"
import { useTheme } from "next-themes"
import { IconSun, IconMoon, IconBell, IconExternalLink, IconLogout } from "@tabler/icons-react"
import { logout } from "@/app/(auth)/actions"
import { DashboardMobileNav } from "@/components/dashboard/DashboardSidebar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { DashboardUser, DashboardBusiness } from "./types"

interface DashboardHeaderProps {
  business: DashboardBusiness
  user: DashboardUser
}

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Vista general",
  "/dashboard/products": "Productos y servicios",
  "/dashboard/hours": "Horarios de atencion",
  "/dashboard/bookings": "Apartados",
  "/dashboard/messages": "Mensajes",
  "/dashboard/promotions": "Promociones",
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Cambiar tema"
      className="text-muted-foreground hover:text-foreground"
    >
      <IconSun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
      <IconMoon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
    </Button>
  )
}

export function DashboardHeader({ business, user }: DashboardHeaderProps) {
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  const pageTitle = PAGE_TITLES[pathname] ?? "Dashboard"
  const isRoot = pathname === "/dashboard"

  function handleLogout() {
    startTransition(() => {
      logout()
    })
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b border-border/60 bg-background/80 px-4 backdrop-blur-lg lg:px-6">
      {/* Mobile */}
      <div className="flex flex-1 items-center gap-3 lg:hidden">
        <DashboardMobileNav business={business} user={user} />
        <nav className="flex items-center gap-1.5 text-sm">
          {!isRoot && (
            <>
              <Link
                href="/dashboard"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
              <span className="text-muted-foreground/50">/</span>
            </>
          )}
          <span className="font-medium">{pageTitle}</span>
        </nav>
      </div>

      {/* Desktop */}
      <nav className="hidden items-center gap-1.5 text-sm lg:flex">
        {!isRoot && (
          <>
            <Link
              href="/dashboard"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <span className="text-muted-foreground/50">/</span>
          </>
        )}
        <span className="font-medium">{pageTitle}</span>
      </nav>

      <div className="hidden flex-1 items-center justify-end gap-1 lg:flex">
        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon-sm"
          className="relative text-muted-foreground hover:text-foreground"
          aria-label="Notificaciones"
          disabled
        >
          <IconBell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" />
        </Button>

        <Separator orientation="vertical" className="mx-2 h-5" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 px-2">
              <Avatar size="sm">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                ) : null}
                <AvatarFallback className="text-[10px]">
                  {user.fullName?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="max-w-[120px] truncate text-xs font-medium">
                {user.fullName || user.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col">
                <span className="text-xs font-medium">{user.fullName || "Mi cuenta"}</span>
                <span className="text-[11px] text-muted-foreground">{user.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {business.status === "active" && (
              <DropdownMenuItem asChild>
                <Link href={`/businesses/${business.slug}`}>
                  <IconExternalLink className="size-3.5" />
                  Ver perfil publico
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleLogout}>
              <IconLogout className="size-3.5" />
              Cerrar sesion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
