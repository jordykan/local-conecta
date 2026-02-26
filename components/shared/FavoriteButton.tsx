"use client"

import { useState } from "react"
import { IconHeart, IconHeartFilled } from "@tabler/icons-react"
import { toast } from "sonner"
import { toggleFavorite } from "@/app/actions/favorites"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
  businessId: string
  isFavorited: boolean
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
  showLabel?: boolean
  className?: string
}

export function FavoriteButton({
  businessId,
  isFavorited: initialIsFavorited,
  variant = "ghost",
  size = "icon",
  showLabel = false,
  className,
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited)
  const [pending, setPending] = useState(false)

  async function handleToggle(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()
    // Stop all event propagation to prevent Link navigation
    if (e.nativeEvent.stopImmediatePropagation) {
      e.nativeEvent.stopImmediatePropagation()
    }

    if (pending) return

    setPending(true)

    const timeoutId = setTimeout(() => {
      setPending(false)
    }, 5000)

    try {
      const result = await toggleFavorite(businessId)

      clearTimeout(timeoutId)

      if (result?.success === false || result?.error) {
        toast.error("Error al actualizar favoritos", {
          description: result.error || "No se pudo completar la acción"
        })
        return
      }

      if (result?.success && result?.action) {
        setIsFavorited(result.action === "added")
        toast.success(
          result.action === "added"
            ? "Agregado a favoritos"
            : "Quitado de favoritos",
          {
            description: result.action === "added"
              ? "El negocio se guardó en tu lista de favoritos"
              : "El negocio se quitó de tu lista de favoritos"
          }
        )
      }
    } catch (error) {
      clearTimeout(timeoutId)
      toast.error("Error inesperado", {
        description: "Ocurrió un error al actualizar tus favoritos"
      })
    } finally {
      setPending(false)
    }
  }

  const Icon = isFavorited ? IconHeartFilled : IconHeart

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={pending}
      className={cn(
        "transition-colors",
        isFavorited && "text-red-500 hover:text-red-600",
        className,
      )}
      aria-label={isFavorited ? "Quitar de favoritos" : "Agregar a favoritos"}
    >
      <Icon className={cn("size-5", showLabel && "mr-1.5")} />
      {showLabel && (isFavorited ? "Favorito" : "Guardar")}
    </Button>
  )
}
