"use client"

import { useEffect } from "react"
import { IconAlertTriangle, IconHome, IconRefresh } from "@tabler/icons-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Unhandled error:", error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-destructive/10">
        <IconAlertTriangle className="size-8 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">
        Algo salió mal
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Ocurrió un error inesperado. Puedes intentar de nuevo o volver al inicio.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={reset}>
          <IconRefresh className="mr-1.5 size-4" />
          Intentar de nuevo
        </Button>
        <Button asChild>
          <Link href="/">
            <IconHome className="mr-1.5 size-4" />
            Ir al inicio
          </Link>
        </Button>
      </div>
      {error.digest && (
        <p className="mt-4 text-xs text-muted-foreground/60">
          Código: {error.digest}
        </p>
      )}
    </div>
  )
}
