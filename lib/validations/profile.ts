import { z } from "zod"

export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "Maximo 100 caracteres"),
  phone: z.string().max(20).optional().or(z.literal("")),
})

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>
