import { z } from "zod"

export const businessBasicSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  categoryId: z.string().min(1, "Selecciona una categoria"),
  shortDescription: z.string().max(160, "Maximo 160 caracteres").optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
})

export const businessContactSchema = z.object({
  phone: z.string().optional().or(z.literal("")),
  whatsapp: z.string().optional().or(z.literal("")),
  email: z.string().email("Correo invalido").optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
})

export const businessHourEntrySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  openTime: z.string().optional().or(z.literal("")),
  closeTime: z.string().optional().or(z.literal("")),
  isClosed: z.boolean(),
})

export const businessHoursSchema = z.array(businessHourEntrySchema).length(7)

export const businessRegistrationSchema = z.object({
  name: z.string().min(2).max(100),
  categoryId: z.string().min(1),
  shortDescription: z.string().max(160).optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  whatsapp: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  communityId: z.string().min(1),
  logoUrl: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  hours: businessHoursSchema,
})

export type BusinessBasicData = z.infer<typeof businessBasicSchema>
export type BusinessContactData = z.infer<typeof businessContactSchema>
export type BusinessHourEntry = z.infer<typeof businessHourEntrySchema>
export type BusinessRegistrationData = z.infer<typeof businessRegistrationSchema>
