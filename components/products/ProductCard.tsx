"use client"

import { useState, useTransition } from "react"
import { IconEdit, IconTrash, IconPhoto, IconCalendarEvent, IconClock, IconPackage } from "@tabler/icons-react"
import { sileo } from "sileo"
import type { ProductService } from "@/lib/types/database"
import { PRICE_TYPE } from "@/lib/constants"
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
  toggleProductAvailability,
  deleteProduct,
} from "@/app/dashboard/products/actions"

interface ProductCardProps {
  product: ProductService
  editable?: boolean
  onEdit?: (product: ProductService) => void
  onBook?: (product: ProductService) => void
}

function formatPrice(product: ProductService): string {
  if (product.price_type === "quote") return "A consultar"
  if (product.price == null) return "—"
  const formatted = `$${product.price.toLocaleString("es-MX")}`
  if (product.price_type === "starting_at") return `Desde ${formatted}`
  if (product.price_type === "per_hour") return `${formatted}/hr`
  return formatted
}

export function ProductCard({ product, editable, onEdit, onBook }: ProductCardProps) {
  const [available, setAvailable] = useState(product.is_available)
  const [toggling, startToggle] = useTransition()
  const [deleting, startDelete] = useTransition()

  function handleToggle(checked: boolean) {
    setAvailable(checked)
    startToggle(async () => {
      const result = await toggleProductAvailability(product.id, checked)
      if (result?.error) {
        setAvailable(!checked)
        sileo.error({ title: "Error", description: result.error })
      }
    })
  }

  function handleDelete() {
    startDelete(async () => {
      const result = await deleteProduct(product.id)
      if (result?.error) {
        sileo.error({ title: "Error", description: result.error })
      } else {
        sileo.success({ title: "Producto eliminado" })
      }
    })
  }

  // ── Editable (dashboard) card ──
  if (editable) {
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
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center">
              <IconPhoto className="size-8 text-muted-foreground/30" />
            </div>
          )}
          <Badge
            variant={product.type === "product" ? "default" : "secondary"}
            className="absolute left-3 top-3 text-[11px]"
          >
            {product.type === "product" ? "Producto" : "Servicio"}
          </Badge>
        </div>

        <CardContent className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold leading-tight">{product.name}</h3>
            <span className="shrink-0 text-sm font-bold text-primary">
              {formatPrice(product)}
            </span>
          </div>

          {product.description && (
            <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between border-t border-border/50 pt-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={available}
                onCheckedChange={handleToggle}
                disabled={toggling}
                className="scale-90"
              />
              <span className="text-xs text-muted-foreground">
                {available ? "Disponible" : "No disponible"}
              </span>
            </div>

            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="size-8" onClick={() => onEdit?.(product)}>
                <IconEdit className="size-4" />
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" disabled={deleting}>
                    <IconTrash className="size-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Eliminar {product.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta accion no se puede deshacer. El producto sera
                      eliminado permanentemente.
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

  // ── Public (customer-facing) card ──
  const price = formatPrice(product)
  const isQuote = product.price_type === "quote"

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-lg">
      {/* Image */}
      <div className="relative aspect-[3/2] overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/5 via-muted to-muted/50">
            {product.type === "product" ? (
              <IconPackage className="size-12 text-primary/15" strokeWidth={1} />
            ) : (
              <IconClock className="size-12 text-primary/15" strokeWidth={1} />
            )}
          </div>
        )}

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Type badge */}
        <Badge
          className={`absolute left-3 top-3 border-0 text-[11px] font-medium shadow-sm backdrop-blur-sm ${
            product.type === "product"
              ? "bg-primary/90 text-primary-foreground"
              : "bg-white/90 text-gray-900 dark:bg-gray-800/90 dark:text-gray-100"
          }`}
        >
          {product.type === "product" ? "Producto" : "Servicio"}
        </Badge>

        {/* Price tag */}
        <div className="absolute bottom-3 right-3">
          <span className={`rounded-lg px-2.5 py-1 text-sm font-bold shadow-sm backdrop-blur-sm ${
            isQuote
              ? "bg-white/90 text-gray-700 dark:bg-gray-800/90 dark:text-gray-200"
              : "bg-primary text-primary-foreground"
          }`}>
            {price}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-[15px] font-semibold leading-snug text-foreground group-hover:text-primary transition-colors duration-200">
          {product.name}
        </h3>

        {product.description && (
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        )}

        {/* Meta chips */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {product.type === "service" && product.duration_minutes && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              <IconClock className="size-3" />
              {product.duration_minutes} min
            </span>
          )}
          {product.type === "product" && product.stock != null && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              <IconPackage className="size-3" />
              {product.stock} disponibles
            </span>
          )}
        </div>

        {/* Book button */}
        {product.is_bookable && onBook && (
          <Button
            size="sm"
            className="mt-4 w-full rounded-lg font-medium transition-all duration-200 hover:shadow-md hover:shadow-primary/20"
            onClick={() => onBook(product)}
          >
            <IconCalendarEvent className="mr-1.5 size-4" />
            Apartar
          </Button>
        )}
      </div>
    </div>
  )
}
