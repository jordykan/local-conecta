"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { bookingSchema } from "@/lib/validations/booking"

export async function createBooking(data: unknown) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Debes iniciar sesión para reservar." }

  const parsed = bookingSchema.safeParse(data)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos."
    return { error: firstError }
  }

  const { productServiceId, businessId, bookingDate, bookingTime, quantity, notes } =
    parsed.data

  // Verify business is active
  const { data: business } = await supabase
    .from("businesses")
    .select("id, slug, status")
    .eq("id", businessId)
    .single()

  if (!business || business.status !== "active") {
    return { error: "Este negocio no está disponible." }
  }

  // Don't allow booking own business
  const { data: ownBusiness } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("owner_id", user.id)
    .single()

  if (ownBusiness) {
    return { error: "No puedes reservar en tu propio negocio." }
  }

  // Verify product is bookable and available
  const { data: product } = await supabase
    .from("products_services")
    .select("id, is_bookable, is_available, stock, name")
    .eq("id", productServiceId)
    .eq("business_id", businessId)
    .single()

  if (!product) return { error: "Producto o servicio no encontrado." }
  if (!product.is_bookable) return { error: "Este producto no es reservable." }
  if (!product.is_available)
    return { error: "Este producto no está disponible actualmente." }

  // Check stock if applicable
  if (product.stock !== null && product.stock < quantity) {
    return {
      error:
        product.stock === 0
          ? "Producto agotado."
          : `Solo quedan ${product.stock} unidades disponibles.`,
    }
  }

  // Insert booking
  const { error } = await supabase.from("bookings").insert({
    user_id: user.id,
    business_id: businessId,
    product_service_id: productServiceId,
    booking_date: bookingDate,
    booking_time: bookingTime || null,
    quantity,
    notes: notes?.trim() || null,
    status: "pending",
  })

  if (error) return { error: "No se pudo crear la reserva. Intenta de nuevo." }

  revalidatePath(`/businesses/${business.slug}`)
  revalidatePath("/account/bookings")
  revalidatePath("/dashboard/bookings")
  return { success: true }
}
