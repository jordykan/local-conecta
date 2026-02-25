"use client"

import {
  IconPhone,
  IconBrandWhatsapp,
  IconTag,
  IconCalendar,
} from "@tabler/icons-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Promotion, Business } from "@/lib/types/database"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface PromotionDetailsModalProps {
  promotion: Promotion
  business: Pick<Business, "id" | "name" | "phone" | "whatsapp">
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatWhatsAppUrl(number: string): string {
  const cleaned = number.replace(/\D/g, "")
  return `https://wa.me/${cleaned}`
}

function formatDiscount(promotion: Promotion): string | null {
  if (!promotion.discount_type || promotion.discount_type === "freeform") {
    return null
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
  return null
}

export function PromotionDetailsModal({
  promotion,
  business,
  open,
  onOpenChange,
}: PromotionDetailsModalProps) {
  const discount = formatDiscount(promotion)
  const hasContact = business.phone || business.whatsapp

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{promotion.title}</DialogTitle>
          <DialogDescription className="sr-only">
            Detalles de la promoción
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Image */}
          <div className="mx-auto max-w-[280px]">
            {promotion.image_url ? (
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-muted">
                <img
                  src={promotion.image_url}
                  alt={promotion.title}
                  className="size-full object-cover"
                />
                {discount && (
                  <Badge className="absolute right-3 top-3 border-0 bg-primary text-primary-foreground shadow-md">
                    {discount}
                  </Badge>
                )}
              </div>
            ) : (
              <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-background">
                <IconTag className="size-12 text-primary/30" strokeWidth={1} />
                {discount && (
                  <Badge className="absolute right-3 top-3 bg-primary text-primary-foreground">
                    {discount}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Discount badge (if present) */}
          {discount && (
            <div className="rounded-lg bg-primary/5 px-3 py-2">
              <p className="text-xs text-muted-foreground">Descuento</p>
              <p className="text-lg font-bold text-primary">{discount}</p>
            </div>
          )}

          {/* Description */}
          {promotion.description && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Descripción
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {promotion.description}
              </p>
            </div>
          )}

          {/* Validity dates */}
          {(promotion.starts_at || promotion.ends_at) && (
            <div className="rounded-lg bg-muted/40 px-3 py-2">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Vigencia
              </p>
              <div className="space-y-1">
                {promotion.starts_at && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <IconCalendar className="size-3.5" />
                    <span>
                      Desde el{" "}
                      {format(new Date(promotion.starts_at), "d 'de' MMMM, yyyy", {
                        locale: es,
                      })}
                    </span>
                  </div>
                )}
                {promotion.ends_at && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <IconCalendar className="size-3.5" />
                    <span>
                      Hasta el{" "}
                      {format(new Date(promotion.ends_at), "d 'de' MMMM, yyyy", {
                        locale: es,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* How to acquire */}
          <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              ¿Cómo aprovecharla?
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Contacta para más información sobre esta promoción.
            </p>
          </div>
        </div>

        {/* Contact buttons */}
        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          {hasContact ? (
            <>
              {business.phone && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full sm:flex-1"
                >
                  <a href={`tel:${business.phone}`}>
                    <IconPhone className="mr-1.5 size-4" />
                    Llamar
                  </a>
                </Button>
              )}
              {business.whatsapp && (
                <Button
                  asChild
                  className="w-full sm:flex-1"
                >
                  <a
                    href={formatWhatsAppUrl(business.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconBrandWhatsapp className="mr-1.5 size-4" />
                    WhatsApp
                  </a>
                </Button>
              )}
            </>
          ) : (
            <p className="w-full text-center text-xs text-muted-foreground">
              Contacta directamente con el negocio para más información.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
