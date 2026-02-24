"use client"

import { useEffect } from "react"
import { IconAlertTriangle, IconRefresh, IconLayoutDashboard } from "@tabler/icons-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Dashboard error:", error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <IconAlertTriangle className="size-7 text-destructive" />
      </div>
      <h2 className="text-xl font-bold">Error en el dashboard</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Ocurrió un problema al cargar esta sección. Intenta de nuevo.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={reset}>
          <IconRefresh className="mr-1.5 size-4" />
          Reintentar
        </Button>
        <Button asChild>
          <Link href="/dashboard">
            <IconLayoutDashboard className="mr-1.5 size-4" />
            Ir al dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}
