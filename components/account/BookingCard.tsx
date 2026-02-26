"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import {
  IconCalendar,
  IconClock,
  IconPackage,
  IconX,
} from "@tabler/icons-react"
import { toast } from "sonner"
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_VARIANT,
} from "@/lib/constants"
import { cancelBooking } from "@/app/(main)/account/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
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
import type { BookingWithRelations } from "@/lib/queries/bookings"

interface BookingCardProps {
  booking: BookingWithRelations
}

export function BookingCard({ booking }: BookingCardProps) {
  const [reason, setReason] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const canCancel =
    booking.status === "pending" || booking.status === "confirmed"

  const formattedDate = new Date(
    booking.booking_date + "T00:00:00"
  ).toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })

  const formattedTime = booking.booking_time
    ? booking.booking_time.slice(0, 5)
    : null

  function handleCancel() {
    if (!reason.trim()) {
      toast.error("Indica el motivo de la cancelación")
      return
    }

    startTransition(async () => {
      const result = await cancelBooking(booking.id, reason.trim())

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Apartado cancelado")
        setDialogOpen(false)
        setReason("")
      }
    })
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-border">
      <div className="flex items-start gap-3">
        {/* Business avatar */}
        <Avatar className="size-10 shrink-0">
          {booking.businesses?.logo_url ? (
            <AvatarImage
              src={booking.businesses.logo_url}
              alt={booking.businesses.name ?? ""}
            />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {booking.businesses?.name?.charAt(0).toUpperCase() ?? "N"}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {booking.businesses?.slug ? (
                <Link
                  href={`/businesses/${booking.businesses.slug}`}
                  className="text-sm font-semibold hover:underline"
                >
                  {booking.businesses?.name ?? "Negocio"}
                </Link>
              ) : (
                <p className="text-sm font-semibold">
                  {booking.businesses?.name ?? "Negocio"}
                </p>
              )}
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <IconPackage className="size-3.5" />
                <span className="truncate">
                  {booking.products_services?.name ?? "Producto/servicio"}
                </span>
              </div>
            </div>
            <Badge
              variant={BOOKING_STATUS_VARIANT[booking.status] ?? "outline"}
              className="shrink-0 text-[11px]"
            >
              {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
            </Badge>
          </div>

          {/* Date & time */}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <IconCalendar className="size-3.5" />
              {formattedDate}
            </span>
            {formattedTime && (
              <span className="flex items-center gap-1">
                <IconClock className="size-3.5" />
                {formattedTime}
              </span>
            )}
            {booking.quantity > 1 && (
              <span>Cantidad: {booking.quantity}</span>
            )}
          </div>

          {/* Notes */}
          {booking.notes && (
            <p className="mt-2 text-xs text-muted-foreground/80 italic">
              &ldquo;{booking.notes}&rdquo;
            </p>
          )}

          {/* Cancellation reason */}
          {booking.cancellation_reason && (
            <p className="mt-2 text-xs text-destructive/80">
              Motivo: {booking.cancellation_reason}
            </p>
          )}

          {/* Cancel action */}
          {canCancel && (
            <div className="mt-3">
              <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-destructive">
                    <IconX className="mr-1 size-3.5" />
                    Cancelar apartado
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancelar apartado</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta accion no se puede deshacer. Indica el motivo de la
                      cancelacion.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Motivo de cancelacion..."
                    rows={3}
                    className="resize-none"
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel>Volver</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancel}
                      disabled={pending || !reason.trim()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {pending ? "Cancelando..." : "Confirmar cancelacion"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
