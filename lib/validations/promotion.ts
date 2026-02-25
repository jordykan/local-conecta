import { z } from "zod"

export const promotionSchema = z
  .object({
    title: z
      .string()
      .min(3, "El título debe tener al menos 3 caracteres")
      .max(100, "El título no puede exceder 100 caracteres"),
    description: z
      .string()
      .max(500, "La descripción no puede exceder 500 caracteres")
      .optional()
      .or(z.literal("")),
    imageUrl: z.string().optional().nullable(),
    discountType: z
      .enum(["percentage", "fixed", "bogo", "freeform"])
      .optional()
      .nullable(),
    discountValue: z.number().min(0).optional().nullable(),
    startsAt: z.string().optional().nullable(),
    endsAt: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // Si el tipo de descuento es percentage, fixed o bogo, debe tener un valor
      if (
        data.discountType &&
        ["percentage", "fixed", "bogo"].includes(data.discountType) &&
        !data.discountValue
      ) {
        return false
      }
      return true
    },
    {
      message:
        "Debes especificar un valor cuando el tipo de descuento es porcentaje, fijo o 2x1",
      path: ["discountValue"],
    },
  )
  .refine(
    (data) => {
      // Si el tipo es porcentaje, el valor debe estar entre 1 y 100
      if (
        data.discountType === "percentage" &&
        data.discountValue &&
        (data.discountValue < 1 || data.discountValue > 100)
      ) {
        return false
      }
      return true
    },
    {
      message: "El porcentaje debe estar entre 1 y 100",
      path: ["discountValue"],
    },
  )
  .refine(
    (data) => {
      // Si hay fecha de fin, debe ser posterior a la fecha de inicio
      if (data.startsAt && data.endsAt) {
        const start = new Date(data.startsAt)
        const end = new Date(data.endsAt)
        return end > start
      }
      return true
    },
    {
      message: "La fecha de fin debe ser posterior a la fecha de inicio",
      path: ["endsAt"],
    },
  )

export type PromotionData = z.infer<typeof promotionSchema>
