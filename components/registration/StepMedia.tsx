"use client"

import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/shared/ImageUpload"

interface StepMediaProps {
  logoUrl: string | null
  coverUrl: string | null
  onNext: (data: { logoUrl: string | null; coverUrl: string | null }) => void
  onBack: () => void
  userId: string
}

export function StepMedia({
  logoUrl,
  coverUrl,
  onNext,
  onBack,
  userId,
}: StepMediaProps) {
  let currentLogo = logoUrl
  let currentCover = coverUrl

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onNext({ logoUrl: currentLogo, coverUrl: currentCover })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <ImageUpload
        bucket="public"
        path={`businesses/${userId}/logos`}
        currentUrl={logoUrl}
        onChange={(url) => {
          currentLogo = url
        }}
        label="Logo del negocio"
        aspect="square"
      />

      <ImageUpload
        bucket="public"
        path={`businesses/${userId}/covers`}
        currentUrl={coverUrl}
        onChange={(url) => {
          currentCover = url
        }}
        label="Foto de portada"
        aspect="video"
      />

      <p className="text-xs text-muted-foreground">
        Las imagenes son opcionales. Puedes agregarlas despues desde tu dashboard.
      </p>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="ghost" onClick={onBack} className="h-11">
          Atras
        </Button>
        <Button type="submit" className="h-11 px-8">
          Siguiente
        </Button>
      </div>
    </form>
  )
}
