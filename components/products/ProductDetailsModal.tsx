"use client"

import {
  IconPhone,
  IconBrandWhatsapp,
  IconPackage,
  IconClock,
} from "@tabler/icons-react"
import type { ProductService, Business } from "@/lib/types/database"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ProductDetailsModalProps {
  product: ProductService
  business: Pick<Business, "id" | "name" | "phone" | "whatsapp">
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatWhatsAppUrl(number: string): string {
  const cleaned = number.replace(/\D/g, "")
  return `https://wa.me/${cleaned}`
}

function formatPrice(product: ProductService): string {
  if (product.price_type === "quote") return "Cotizar"
  if (!product.price) return "Precio a consultar"

  const priceStr = `$${product.price.toLocaleString()}`

  switch (product.price_type) {
    case "starting_at":
      return `Desde ${priceStr}`
    case "per_hour":
      return `${priceStr}/hora`
    default:
      return priceStr
  }
}

export function ProductDetailsModal({
  product,
  business,
  open,
  onOpenChange,
}: ProductDetailsModalProps) {
  const price = formatPrice(product)
  const isQuote = product.price_type === "quote"
  const hasContact = business.phone || business.whatsapp

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription className="sr-only">
            Detalles del {product.type === "product" ? "producto" : "servicio"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Image */}
          <div className="mx-auto max-w-[240px]">
            {product.image_url ? (
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="size-full object-cover"
                />
              </div>
            ) : (
              <div className="relative aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-primary/5 via-muted to-muted/50">
                <div className="flex size-full items-center justify-center">
                  {product.type === "product" ? (
                    <IconPackage className="size-10 text-primary/15" strokeWidth={1} />
                  ) : (
                    <IconClock className="size-10 text-primary/15" strokeWidth={1} />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="rounded-lg bg-muted/40 px-3 py-2">
            <p className="text-xs text-muted-foreground">Precio</p>
            <p className={`text-lg font-bold ${
              isQuote ? "text-muted-foreground" : "text-primary"
            }`}>
              {price}
            </p>
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Descripcion
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>
          )}

          {/* Stock or Duration */}
          {((product.type === "product" && product.stock != null) ||
            (product.type === "service" && product.duration_minutes)) && (
            <div className="flex flex-wrap gap-2">
              {product.type === "product" && product.stock != null && (
                <div className="inline-flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-1.5">
                  <IconPackage className="size-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium">
                    {product.stock} disponibles
                  </span>
                </div>
              )}

              {product.type === "service" && product.duration_minutes && (
                <div className="inline-flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-1.5">
                  <IconClock className="size-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium">
                    {product.duration_minutes} min
                  </span>
                </div>
              )}
            </div>
          )}

          {/* How to acquire */}
          <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              ¿Como adquirirlo?
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              No disponible para reserva en línea. Contacta para más información.
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
