"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { IconMenu2, IconUser, IconCalendarEvent, IconMessageCircle, IconLogout, IconChevronDown, IconLayoutDashboard, IconSun, IconMoon, IconShield } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { UnreadBadge } from "@/components/shared/UnreadBadge"
import { useUnreadCount } from "@/lib/hooks/useUnreadCount"
import { logout } from "@/app/(auth)/actions"

interface NavbarProps {
  user?: {
    id: string
    email: string
    fullName: string
    avatarUrl?: string | null
    role?: string
  } | null
}

function UserAvatar({ user }: { user: NonNullable<NavbarProps["user"]> }) {
  const initials =
    user.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || user.email[0].toUpperCase()

  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.fullName}
        className="size-8 rounded-full object-cover ring-2 ring-border"
      />
    )
  }

  return (
    <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
      {initials}
    </div>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Cambiar tema"
      className="size-9 text-muted-foreground hover:text-foreground"
    >
      <IconSun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
      <IconMoon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
    </Button>
  )
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()
  const isHome = pathname === "/"
  const transparent = isHome

  // Get unread message count
  const { count: unreadCount } = useUnreadCount({
    userId: user?.id ?? "",
    businessId: user?.role === "business_owner" ? undefined : undefined, // TODO: Get business ID if owner
  })

  return (
    <header
      className={
        transparent
          ? "absolute top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-xs"
          : "sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg"
      }
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span
            className={`text-lg font-semibold tracking-tight ${transparent ? "text-white" : "text-foreground"}`}
          >
            Local<span className="text-primary"> Conecta</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          <Link
            href="/businesses"
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              transparent
                ? "text-white/80 hover:text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Explorar
          </Link>


          {!transparent && <ThemeToggle />}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="ml-3 flex items-center gap-2.5 rounded-full border border-border/60 py-1.5 pl-1.5 pr-3 transition-colors hover:bg-accent"
                >
                  <UserAvatar user={user} />
                  <span className="max-w-[120px] truncate text-sm font-medium text-foreground">
                    {user.fullName?.split(" ")[0] || "Cuenta"}
                  </span>
                  <IconChevronDown className="size-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-3">
                  <p className="text-sm font-semibold">
                    {user.fullName || "Usuario"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                {(user.role === "community_admin" || user.role === "super_admin") && (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/admin" className="flex items-center gap-2.5 px-3 py-2">
                      <IconShield className="size-4 text-orange-500" />
                      Panel Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.role === "business_owner" && (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2">
                      <IconLayoutDashboard className="size-4 text-muted-foreground" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/account" className="flex items-center gap-2.5 px-3 py-2">
                    <IconUser className="size-4 text-muted-foreground" />
                    Mi cuenta
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/account/bookings" className="flex items-center gap-2.5 px-3 py-2">
                    <IconCalendarEvent className="size-4 text-muted-foreground" />
                    Mis apartados
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/account/messages" className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2.5">
                      <IconMessageCircle className="size-4 text-muted-foreground" />
                      Mis mensajes
                    </div>
                    {unreadCount > 0 && <UnreadBadge count={unreadCount} size="sm" />}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <form action={logout} className="w-full">
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-muted-foreground"
                    >
                      <IconLogout className="size-4" />
                      Cerrar sesion
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="lg" asChild className="ml-3">
              <Link href="/login">Iniciar sesion</Link>
            </Button>
          )}
        </div>

        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`md:hidden ${transparent ? "text-white hover:bg-white/10" : ""}`}
              aria-label="Abrir menu"
            >
              <IconMenu2 className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>
                <span className="text-lg font-semibold tracking-tight text-foreground">
                  Local<span className="text-primary"> Conecta</span>
                </span>
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 px-6">
              <SheetClose asChild>
                <Link
                  href="/businesses"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  Explorar
                </Link>
              </SheetClose>

              <div className="flex items-center justify-between px-3 py-1">
                <span className="text-xs text-muted-foreground">Tema</span>
                <ThemeToggle />
              </div>

              <Separator className="my-2" />

              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-3">
                    <UserAvatar user={user} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {user.fullName || "Usuario"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  {(user.role === "community_admin" || user.role === "super_admin") && (
                    <SheetClose asChild>
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <IconShield className="size-4 text-orange-500" />
                        Panel Admin
                      </Link>
                    </SheetClose>
                  )}
                  {user.role === "business_owner" && (
                    <SheetClose asChild>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <IconLayoutDashboard className="size-4" />
                        Dashboard
                      </Link>
                    </SheetClose>
                  )}
                  <SheetClose asChild>
                    <Link
                      href="/account"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <IconUser className="size-4" />
                      Mi cuenta
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      href="/account/bookings"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <IconCalendarEvent className="size-4" />
                      Mis apartados
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      href="/account/messages"
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <div className="flex items-center gap-2.5">
                        <IconMessageCircle className="size-4" />
                        Mis mensajes
                      </div>
                      {unreadCount > 0 && <UnreadBadge count={unreadCount} size="sm" />}
                    </Link>
                  </SheetClose>
                  <Separator className="my-2" />
                  <form action={logout}>
                    <SheetClose asChild>
                      <button
                        type="submit"
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <IconLogout className="size-4" />
                        Cerrar sesion
                      </button>
                    </SheetClose>
                  </form>
                </>
              ) : (
                <SheetClose asChild>
                  <Button asChild className="mt-2 w-full">
                    <Link href="/login">Iniciar sesion</Link>
                  </Button>
                </SheetClose>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}
