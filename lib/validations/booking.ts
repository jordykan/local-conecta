import { z } from "zod"

export const bookingSchema = z.object({
  productServiceId: z.string().uuid("Producto/servicio inválido"),
  businessId: z.string().uuid("Negocio inválido"),
  bookingDate: z.string().min(1, "Selecciona una fecha"),
  bookingTime: z.string().optional().nullable(),
  quantity: z.number().int().min(1, "Mínimo 1").max(50, "Máximo 50"),
  notes: z.string().max(500).optional().or(z.literal("")),
})

export type BookingData = z.infer<typeof bookingSchema>
