"use client"

import { useTransition } from "react"
import {
  IconCheck,
  IconX,
  IconUser,
  IconCalendar,
  IconClock,
  IconPackage,
  IconCheckbox,
} from "@tabler/icons-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import type { BookingWithClient } from "@/lib/queries/bookings"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  confirmBooking,
  completeBooking,
  cancelBookingBusiness,
} from "@/app/dashboard/bookings/actions"

interface BookingsListProps {
  bookings: BookingWithClient[]
  businessId: string
}

const STATUS_MAP: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "Pendiente", variant: "secondary" },
  confirmed: { label: "Confirmada", variant: "default" },
  completed: { label: "Completada", variant: "outline" },
  cancelled: { label: "Cancelada", variant: "destructive" },
  no_show: { label: "No asistió", variant: "destructive" },
}

function BookingActionCard({
  booking,
  businessId,
}: {
  booking: BookingWithClient
  businessId: string
}) {
  const [pending, startTransition] = useTransition()

  function handleAction(action: "confirm" | "complete" | "cancel") {
    startTransition(async () => {
      let result
      switch (action) {
        case "confirm":
          result = await confirmBooking(booking.id, businessId)
          break
        case "complete":
          result = await completeBooking(booking.id, businessId)
          break
        case "cancel":
          result = await cancelBookingBusiness(booking.id, businessId)
          break
      }

      if (result?.error) {
        toast.error("Error al actualizar", {
          description: result.error
        })
      } else {
        toast.success(
          action === "confirm"
            ? "Apartado confirmado"
            : action === "complete"
              ? "Apartado completado"
              : "Apartado cancelado",
          {
            description: action === "confirm"
              ? "El cliente ha sido notificado"
              : action === "complete"
                ? "El apartado se ha marcado como completado"
                : "El apartado ha sido cancelado"
          }
        )
      }
    })
  }

  const status = STATUS_MAP[booking.status] ?? STATUS_MAP.pending
  const bookingDate = format(new Date(booking.booking_date + "T12:00:00"), "PPP", {
    locale: es,
  })

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            {/* Client */}
            <div className="flex items-center gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                {booking.profiles?.avatar_url ? (
                  <img
                    src={booking.profiles.avatar_url}
                    alt=""
                    className="size-8 rounded-full object-cover"
                  />
                ) : (
                  <IconUser className="size-4 text-primary" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {booking.profiles?.full_name || "Cliente"}
                </p>
                {booking.profiles?.phone && (
                  <p className="text-xs text-muted-foreground">
                    {booking.profiles.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Product */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <IconPackage className="size-3.5 shrink-0" />
              <span className="truncate">
                {booking.products_services?.name ?? "Producto eliminado"}
              </span>
              {booking.quantity > 1 && (
                <span className="text-xs">×{booking.quantity}</span>
              )}
            </div>

            {/* Date and time */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <IconCalendar className="size-3.5" />
                {bookingDate}
              </span>
              {booking.booking_time && (
                <span className="flex items-center gap-1">
                  <IconClock className="size-3.5" />
                  {booking.booking_time.slice(0, 5)}
                </span>
              )}
            </div>

            {booking.notes && (
              <p className="text-xs italic text-muted-foreground">
                &ldquo;{booking.notes}&rdquo;
              </p>
            )}
          </div>

          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        {/* Actions */}
        {(booking.status === "pending" || booking.status === "confirmed") && (
          <div className="mt-3 flex gap-2 border-t pt-3">
            {booking.status === "pending" && (
              <Button
                size="sm"
                onClick={() => handleAction("confirm")}
                disabled={pending}
                className="flex-1"
              >
                <IconCheck className="mr-1 size-3.5" />
                Confirmar
              </Button>
            )}
            {booking.status === "confirmed" && (
              <Button
                size="sm"
                onClick={() => handleAction("complete")}
                disabled={pending}
                className="flex-1"
              >
                <IconCheckbox className="mr-1 size-3.5" />
                Completar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction("cancel")}
              disabled={pending}
            >
              <IconX className="mr-1 size-3.5" />
              Cancelar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function BookingsList({ bookings, businessId }: BookingsListProps) {
  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <IconCalendar className="mb-3 size-12 text-muted-foreground/30" />
        <p className="text-sm font-medium text-muted-foreground">
          No hay reservas en esta categoría
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {bookings.map((booking) => (
        <BookingActionCard
          key={booking.id}
          booking={booking}
          businessId={businessId}
        />
      ))}
    </div>
  )
}
