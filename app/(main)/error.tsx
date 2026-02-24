"use client"

import { useEffect } from "react"
import { IconAlertTriangle, IconRefresh, IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Error in main layout:", error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <IconAlertTriangle className="size-7 text-destructive" />
      </div>
      <h2 className="text-xl font-bold">Algo salió mal</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        No pudimos cargar esta página. Intenta de nuevo o regresa al directorio.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={reset}>
          <IconRefresh className="mr-1.5 size-4" />
          Reintentar
        </Button>
        <Button asChild>
          <Link href="/businesses">
            <IconArrowLeft className="mr-1.5 size-4" />
            Ver negocios
          </Link>
        </Button>
      </div>
    </div>
  )
}
