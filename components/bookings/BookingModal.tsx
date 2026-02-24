"use client"

import { useState, useTransition } from "react"
import {
  IconCalendar,
  IconClock,
  IconMinus,
  IconPlus,
} from "@tabler/icons-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { createBooking } from "@/app/(main)/businesses/[slug]/actions"
import type { ProductService, BusinessHours } from "@/lib/types/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BookingModalProps {
  product: ProductService
  businessId: string
  businessHours: Pick<BusinessHours, "day_of_week" | "open_time" | "close_time" | "is_closed">[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

function generateTimeSlots(
  openTime: string,
  closeTime: string,
  durationMinutes?: number | null
): string[] {
  const slots: string[] = []
  const [oh, om] = openTime.split(":").map(Number)
  const [ch, cm] = closeTime.split(":").map(Number)
  const startMin = oh * 60 + om
  const endMin = ch * 60 + cm
  const step = durationMinutes && durationMinutes > 0 ? durationMinutes : 30

  for (let m = startMin; m + step <= endMin; m += step) {
    const h = Math.floor(m / 60)
    const min = m % 60
    slots.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`)
  }

  return slots
}

export function BookingModal({
  product,
  businessId,
  businessHours,
  open,
  onOpenChange,
}: BookingModalProps) {
  const [date, setDate] = useState<Date | undefined>()
  const [time, setTime] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const isService = product.type === "service"
  const maxQty = product.stock ?? 10

  // Get available time slots for selected date
  const selectedDayOfWeek = date ? date.getDay() : null
  const dayHours =
    selectedDayOfWeek !== null
      ? businessHours.find((h) => h.day_of_week === selectedDayOfWeek)
      : null
  const isDayClosed = !dayHours || dayHours.is_closed
  const timeSlots =
    dayHours && !dayHours.is_closed && dayHours.open_time && dayHours.close_time
      ? generateTimeSlots(
          dayHours.open_time,
          dayHours.close_time,
          product.duration_minutes
        )
      : []

  // Disable past dates and closed days
  function isDateDisabled(d: Date): boolean {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (d < today) return true

    const dow = d.getDay()
    const hours = businessHours.find((h) => h.day_of_week === dow)
    return !hours || hours.is_closed
  }

  function handleSubmit() {
    if (!date) {
      setError("Selecciona una fecha")
      return
    }
    if (isService && !time) {
      setError("Selecciona una hora")
      return
    }

    setError("")
    startTransition(async () => {
      const result = await createBooking({
        productServiceId: product.id,
        businessId,
        bookingDate: format(date, "yyyy-MM-dd"),
        bookingTime: time || null,
        quantity,
        notes: notes.trim() || "",
      })

      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
      }
    })
  }

  function handleClose(open: boolean) {
    if (!open) {
      setDate(undefined)
      setTime("")
      setQuantity(1)
      setNotes("")
      setError("")
      setSuccess(false)
    }
    onOpenChange(open)
  }

  const formattedPrice =
    product.price != null
      ? `$${Number(product.price).toLocaleString("es-MX")}`
      : "A consultar"

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {success ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">¡Reserva creada!</DialogTitle>
              <DialogDescription className="text-center">
                Tu reserva de <strong>{product.name}</strong> ha sido enviada.
                El negocio la confirmará pronto.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => handleClose(false)} className="w-full">
                Cerrar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Apartar {product.name}</DialogTitle>
              <DialogDescription>
                {isService ? "Reserva un horario" : "Aparta este producto"} —{" "}
                {formattedPrice}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Date picker */}
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <IconCalendar className="mr-2 size-4 text-muted-foreground" />
                      {date
                        ? format(date, "PPP", { locale: es })
                        : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => {
                        setDate(d)
                        setTime("")
                      }}
                      disabled={isDateDisabled}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time select (for services, or products if user wants) */}
              {date && !isDayClosed && timeSlots.length > 0 && (
                <div className="space-y-2">
                  <Label>
                    Hora {isService ? "" : "(opcional)"}
                  </Label>
                  <Select value={time} onValueChange={setTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar hora">
                        {time ? (
                          <span className="flex items-center gap-2">
                            <IconClock className="size-4 text-muted-foreground" />
                            {time}
                          </span>
                        ) : (
                          "Seleccionar hora"
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Quantity (for products) */}
              {!isService && (
                <div className="space-y-2">
                  <Label>Cantidad</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      <IconMinus className="size-3.5" />
                    </Button>
                    <Input
                      type="number"
                      min={1}
                      max={maxQty}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          Math.max(1, Math.min(maxQty, parseInt(e.target.value) || 1))
                        )
                      }
                      className="w-16 text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      disabled={quantity >= maxQty}
                      onClick={() =>
                        setQuantity((q) => Math.min(maxQty, q + 1))
                      }
                    >
                      <IconPlus className="size-3.5" />
                    </Button>
                    {product.stock !== null && (
                      <span className="text-xs text-muted-foreground">
                        {product.stock} disponibles
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notas (opcional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="¿Algún detalle adicional?"
                  rows={2}
                  className="resize-none"
                  maxLength={500}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                onClick={handleSubmit}
                disabled={pending || !date}
                className="w-full"
              >
                {pending ? "Creando reserva..." : "Confirmar reserva"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
