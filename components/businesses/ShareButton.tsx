"use client"

import { IconLink } from "@tabler/icons-react"
import { sileo } from "sileo"
import { Button } from "@/components/ui/button"

export function ShareButton() {
  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        sileo.success({ title: "Enlace copiado" })
      }
    } catch {
      // User cancelled share dialog
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleShare}
      className="size-10 shrink-0"
    >
      <IconLink className="size-4" />
      <span className="sr-only">Compartir</span>
    </Button>
  )
}
