"use client"

import { useState, useTransition } from "react"
import { IconEdit, IconTrash, IconPhoto, IconTag, IconCalendar } from "@tabler/icons-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Promotion } from "@/lib/types/database"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  togglePromotionStatus,
  deletePromotion,
} from "@/app/dashboard/promotions/actions"

interface PromotionCardProps {
  promotion: Promotion
  onEdit?: (promotion: Promotion) => void
}

function formatDiscount(promotion: Promotion): string {
  if (!promotion.discount_type || promotion.discount_type === "freeform") {
    return "Ver detalles"
  }
  if (promotion.discount_type === "percentage") {
    return `${promotion.discount_value}% de descuento`
  }
  if (promotion.discount_type === "fixed") {
    return `$${promotion.discount_value} de descuento`
  }
  if (promotion.discount_type === "bogo") {
    return "2x1"
  }
  return "Promoción especial"
}

function isExpired(promotion: Promotion): boolean {
  if (!promotion.ends_at) return false
  return new Date(promotion.ends_at) < new Date()
}

function isActive(promotion: Promotion): boolean {
  if (!promotion.is_active) return false
  if (isExpired(promotion)) return false
  if (promotion.starts_at && new Date(promotion.starts_at) > new Date()) {
    return false
  }
  return true
}

export function PromotionCard({ promotion, onEdit }: PromotionCardProps) {
  const [active, setActive] = useState(promotion.is_active)
  const [toggling, startToggle] = useTransition()
  const [deleting, startDelete] = useTransition()

  const expired = isExpired(promotion)
  const activeNow = isActive(promotion)

  function handleToggle(checked: boolean) {
    if (expired) {
      toast.error("No puedes activar una promoción que ya expiró")
      return
    }

    setActive(checked)
    startToggle(async () => {
      const result = await togglePromotionStatus(promotion.id, checked)
      if (result?.error) {
        setActive(!checked)
        toast.error(result.error)
      }
    })
  }

  function handleDelete() {
    startDelete(async () => {
      const result = await deletePromotion(promotion.id)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Promoción eliminada")
      }
    })
  }

  return (
    <Card className="relative overflow-hidden">
      {deleting && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70">
          <div className="flex flex-col items-center gap-2">
            <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-xs text-muted-foreground">Eliminando...</span>
          </div>
        </div>
      )}

      <div className="relative aspect-[4/3] bg-muted">
        {promotion.image_url ? (
          <img
            src={promotion.image_url}
            alt={promotion.title}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-muted">
            <IconTag className="size-12 text-primary/30" />
          </div>
        )}

        <div className="absolute left-3 top-3 flex gap-2">
          <Badge
            variant={activeNow ? "default" : "secondary"}
            className="text-[11px]"
          >
            {expired ? "Expirada" : activeNow ? "Activa" : "Inactiva"}
          </Badge>
          {promotion.discount_type && promotion.discount_type !== "freeform" && (
            <Badge variant="outline" className="bg-white/90 text-[11px] backdrop-blur-sm">
              {formatDiscount(promotion)}
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="text-sm font-semibold leading-tight">{promotion.title}</h3>
        </div>

        {promotion.description && (
          <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
            {promotion.description}
          </p>
        )}

        {/* Fecha de vigencia */}
        <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <IconCalendar className="size-3.5" />
          <span>
            {promotion.starts_at && promotion.ends_at
              ? `${format(new Date(promotion.starts_at), "d MMM", { locale: es })} - ${format(new Date(promotion.ends_at), "d MMM yyyy", { locale: es })}`
              : promotion.ends_at
                ? `Hasta ${format(new Date(promotion.ends_at), "d MMM yyyy", { locale: es })}`
                : promotion.starts_at
                  ? `Desde ${format(new Date(promotion.starts_at), "d MMM yyyy", { locale: es })}`
                  : "Sin fecha límite"}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-border/50 pt-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={active}
              onCheckedChange={handleToggle}
              disabled={toggling || expired}
              className="scale-90"
            />
            <span className="text-xs text-muted-foreground">
              {expired ? "Expirada" : active ? "Activa" : "Inactiva"}
            </span>
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => onEdit?.(promotion)}
            >
              <IconEdit className="size-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:text-destructive"
                  disabled={deleting}
                >
                  <IconTrash className="size-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar {promotion.title}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. La promoción será
                    eliminada permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
