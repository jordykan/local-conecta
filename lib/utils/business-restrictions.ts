import type { Business } from "@/lib/types/database"

/**
 * Verifica si un negocio está suspendido
 */
export function isBusinessSuspended(business: Business | null | undefined): boolean {
  return business?.status === "suspended"
}

/**
 * Verifica si un negocio puede editar contenido (productos, promociones, horarios)
 */
export function canEditContent(business: Business | null | undefined): boolean {
  return !isBusinessSuspended(business)
}

/**
 * Verifica si un negocio puede recibir nuevos apartados
 */
export function canReceiveBookings(business: Business | null | undefined): boolean {
  return business?.status === "active"
}

/**
 * Mensaje de error para negocios suspendidos
 */
export const SUSPENDED_MESSAGE = "Tu negocio está suspendido. No puedes realizar esta acción."

/**
 * Mensaje de error para negocios pendientes
 */
export const PENDING_MESSAGE = "Tu negocio está en revisión. Esta funcionalidad estará disponible cuando sea aprobado."
