"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { bookingSchema } from "@/lib/validations/booking"
import { reviewSchema } from "@/lib/validations/review"
import { canUserReview } from "@/lib/queries/reviews"
import { sendNotificationIfEnabled, NOTIFICATION_TYPE } from "@/lib/services/push-notifications"

export async function createBooking(data: unknown) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Debes iniciar sesión para apartar." }

  const parsed = bookingSchema.safeParse(data)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos."
    return { error: firstError }
  }

  const { productServiceId, businessId, bookingDate, bookingTime, quantity, notes } =
    parsed.data

  // Verify business is active and get owner info
  const { data: business } = await supabase
    .from("businesses")
    .select("id, slug, status, name, owner_id")
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
    return { error: "No puedes apartar en tu propio negocio." }
  }

  // Verify product is bookable and available
  const { data: product } = await supabase
    .from("products_services")
    .select("id, is_bookable, is_available, stock, name")
    .eq("id", productServiceId)
    .eq("business_id", businessId)
    .single()

  if (!product) return { error: "Producto o servicio no encontrado." }
  if (!product.is_bookable) return { error: "Este producto no se puede apartar." }
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

  // Get user profile for notification
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()

  // Insert booking
  const { data: newBooking, error } = await supabase
    .from("bookings")
    .insert({
      user_id: user.id,
      business_id: businessId,
      product_service_id: productServiceId,
      booking_date: bookingDate,
      booking_time: bookingTime || null,
      quantity,
      notes: notes?.trim() || null,
      status: "pending",
    })
    .select("id")
    .single()

  if (error) return { error: "No se pudo crear el apartado. Intenta de nuevo." }

  // Send push notification to business owner
  if (newBooking && userProfile) {
    await sendNotificationIfEnabled(
      {
        userId: business.owner_id,
        title: "Nueva reserva",
        body: `${userProfile.full_name} ha solicitado una reserva para ${product.name}`,
        url: `/dashboard/bookings`,
        tag: "booking",
        icon: "/icon.svg"
      },
      NOTIFICATION_TYPE.NEW_BOOKING
    )
  }

  revalidatePath(`/businesses/${business.slug}`)
  revalidatePath("/account/bookings")
  revalidatePath("/dashboard/bookings")
  return { success: true }
}

export async function createReview(data: unknown) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Debes iniciar sesión para dejar una reseña" }
  }

  const parsed = reviewSchema.safeParse(data)
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [
        k,
        v?.[0] ?? "",
      ]),
    )
    return { error: "Datos inválidos", fieldErrors }
  }

  const { rating, comment, businessId, bookingId } = parsed.data

  // Verificar si puede dejar review
  const { canReview, reason } = await canUserReview(user.id, businessId)
  if (!canReview) {
    return { error: reason ?? "No puedes dejar una reseña en este negocio" }
  }

  // Get user profile and business info for notification
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()

  const { data: business } = await supabase
    .from("businesses")
    .select("slug, name, owner_id")
    .eq("id", businessId)
    .single()

  const { data: newReview, error } = await supabase.from("reviews").insert({
    user_id: user.id,
    business_id: businessId,
    booking_id: bookingId,
    rating,
    comment,
  })
  .select("id")
  .single()

  if (error) {
    console.error("Error creating review:", error)
    return { error: "No se pudo crear la reseña. Intenta de nuevo." }
  }

  // Send push notification to business owner
  if (newReview && business && userProfile) {
    const stars = '⭐'.repeat(rating)
    await sendNotificationIfEnabled(
      {
        userId: business.owner_id,
        title: "Nueva reseña recibida",
        body: `${userProfile.full_name} dejó una reseña ${stars} en ${business.name}`,
        url: `/dashboard/reviews`,
        tag: "review",
        icon: "/icon.svg"
      },
      NOTIFICATION_TYPE.NEW_REVIEW
    )
  }

  // Revalidar perfil del negocio
  if (business) {
    revalidatePath(`/businesses/${business.slug}`)
  }
  revalidatePath("/account/reviews")

  return { success: true }
}

export async function updateReview(reviewId: string, data: unknown) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autorizado" }
  }

  const parsed = reviewSchema.safeParse(data)
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [
        k,
        v?.[0] ?? "",
      ]),
    )
    return { error: "Datos inválidos", fieldErrors }
  }

  const { rating, comment } = parsed.data

  // Verificar ownership
  const { data: review } = await supabase
    .from("reviews")
    .select("business_id, user_id")
    .eq("id", reviewId)
    .single()

  if (!review || review.user_id !== user.id) {
    return { error: "No tienes permiso para editar esta reseña" }
  }

  const { error } = await supabase
    .from("reviews")
    .update({
      rating,
      comment,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewId)

  if (error) {
    return { error: "No se pudo actualizar la reseña" }
  }

  // Revalidar
  const { data: business } = await supabase
    .from("businesses")
    .select("slug")
    .eq("id", review.business_id)
    .single()

  if (business) {
    revalidatePath(`/businesses/${business.slug}`)
  }
  revalidatePath("/account/reviews")

  return { success: true }
}

export async function deleteReview(reviewId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autorizado" }
  }

  // Verificar ownership
  const { data: review } = await supabase
    .from("reviews")
    .select("business_id, user_id")
    .eq("id", reviewId)
    .single()

  if (!review || review.user_id !== user.id) {
    return { error: "No tienes permiso para eliminar esta reseña" }
  }

  const { error } = await supabase.from("reviews").delete().eq("id", reviewId)

  if (error) {
    return { error: "No se pudo eliminar la reseña" }
  }

  // Revalidar
  const { data: business } = await supabase
    .from("businesses")
    .select("slug")
    .eq("id", review.business_id)
    .single()

  if (business) {
    revalidatePath(`/businesses/${business.slug}`)
  }
  revalidatePath("/account/reviews")

  return { success: true }
}
