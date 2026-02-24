"use client"

import { Toaster } from "sileo"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function SileoToaster() {
  const { theme, resolvedTheme } = useTheme()

  // evita mismatch de hidratación
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark"

  return (
    <Toaster
      position="top-right"
      options={{
        fill: isDark ? "#FFFFFF" : "#171717",
        styles: {
          title: isDark ? "text-black!" : "text-white!",
          description: isDark ? "text-black/75!" : "text-white/70!",
        },
      }}
    />
  )
}
