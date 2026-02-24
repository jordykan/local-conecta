import { z } from "zod"

export const productServiceSchema = z.object({
  type: z.enum(["product", "service"]),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  description: z.string().max(2000).optional().or(z.literal("")),
  price: z.number().min(0).optional().nullable(),
  priceType: z.enum(["fixed", "starting_at", "per_hour", "quote"]),
  imageUrl: z.string().optional().nullable(),
  isAvailable: z.boolean(),
  isBookable: z.boolean(),
  stock: z.number().int().min(0).optional().nullable(),
  durationMinutes: z.number().int().min(1).optional().nullable(),
})

export type ProductServiceData = z.infer<typeof productServiceSchema>
