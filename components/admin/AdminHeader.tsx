"use client"

import { Button } from "@/components/ui/button"
import { IconMenu2, IconLogout, IconShield, IconSun, IconMoon } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type AdminHeaderProps = {
  user: {
    id: string
    email: string
    role: string
  }
  onMenuClick: () => void
}

export function AdminHeader({ user, onMenuClick }: AdminHeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        <IconMenu2 className="h-5 w-5" />
      </Button>

      <div className="flex flex-1 items-center justify-end gap-3">
        {/* Role Badge */}
        <div className="hidden sm:flex items-center gap-2 rounded-lg border bg-orange-50 dark:bg-orange-950/30 px-3 py-1.5">
          <IconShield className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <span className="text-sm font-medium text-orange-700 dark:text-orange-300 capitalize">
            {user.role.replace("_", " ")}
          </span>
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9"
        >
          <IconSun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <IconMoon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Cambiar tema</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-sm font-semibold text-white ring-2 ring-orange-200 dark:ring-orange-900 transition-all hover:ring-4">
                {user.email[0]?.toUpperCase()}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">Administrador</p>
                <p className="text-xs leading-none text-muted-foreground mt-1">{user.email}</p>
                <div className="sm:hidden flex items-center gap-2 mt-2 px-2 py-1 rounded-md bg-orange-50 dark:bg-orange-950/30 w-fit">
                  <IconShield className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs font-medium text-orange-700 dark:text-orange-300 capitalize">
                    {user.role.replace("_", " ")}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <form action="/auth/signout" method="post">
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full cursor-pointer flex items-center">
                  <IconLogout className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
