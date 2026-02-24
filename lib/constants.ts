// User roles
export const ROLES = {
  USER: "user",
  BUSINESS_OWNER: "business_owner",
  COMMUNITY_ADMIN: "community_admin",
  SUPER_ADMIN: "super_admin",
} as const

// Business statuses
export const BUSINESS_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  SUSPENDED: "suspended",
} as const

// Booking statuses
export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
} as const

// Price types
export const PRICE_TYPE = {
  FIXED: "fixed",
  STARTING_AT: "starting_at",
  PER_HOUR: "per_hour",
  QUOTE: "quote",
} as const

// Discount types
export const DISCOUNT_TYPE = {
  PERCENTAGE: "percentage",
  FIXED: "fixed",
  BOGO: "bogo",
  FREEFORM: "freeform",
} as const

// Booking status labels (Spanish)
export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
  no_show: "No asistio",
}

// Booking status badge variants
export const BOOKING_STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  confirmed: "default",
  completed: "secondary",
  cancelled: "destructive",
  no_show: "destructive",
}

// Days of week (0 = Sunday)
export const DAYS_OF_WEEK = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
] as const
