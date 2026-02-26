import { z } from "zod"

export const reviewSchema = z.object({
  rating: z
    .number()
    .int("El rating debe ser un número entero")
    .min(1, "El rating mínimo es 1 estrella")
    .max(5, "El rating máximo es 5 estrellas"),
  comment: z
    .string()
    .min(10, "El comentario debe tener al menos 10 caracteres")
    .max(1000, "El comentario no puede exceder 1000 caracteres"),
  businessId: z.string().uuid("ID de negocio inválido"),
  bookingId: z.string().uuid("ID de apartado inválido").optional().nullable(),
})

export const ownerReplySchema = z.object({
  reviewId: z.string().uuid("ID de reseña inválido"),
  ownerReply: z
    .string()
    .min(5, "La respuesta debe tener al menos 5 caracteres")
    .max(500, "La respuesta no puede exceder 500 caracteres"),
})

export type ReviewData = z.infer<typeof reviewSchema>
export type OwnerReplyData = z.infer<typeof ownerReplySchema>
