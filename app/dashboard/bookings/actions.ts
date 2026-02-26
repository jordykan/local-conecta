"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendNotificationIfEnabled, NOTIFICATION_TYPE } from "@/lib/services/push-notifications";

async function verifyBusinessOwnership(businessId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, error: "No autenticado." as const };

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("owner_id", user.id)
    .single();

  if (!business)
    return { supabase, error: "No tienes permiso para esta acción." as const };

  return { supabase, userId: user.id, businessId: business.id };
}

export async function confirmBooking(bookingId: string, businessId: string) {
  const auth = await verifyBusinessOwnership(businessId);
  if ("error" in auth) return { error: auth.error };

  // Get booking and business details for notification
  const { data: booking } = await auth.supabase
    .from("bookings")
    .select("user_id, product_service_id, products_services(name)")
    .eq("id", bookingId)
    .single();

  const { data: business } = await auth.supabase
    .from("businesses")
    .select("name")
    .eq("id", businessId)
    .single();

  const { error } = await auth.supabase
    .from("bookings")
    .update({
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .eq("business_id", businessId)
    .eq("status", "pending");

  if (error) return { error: "No se pudo confirmar el apartado." };

  // Send push notification to user
  if (booking && business) {
    const productName = (booking.products_services as any)?.name || "tu reserva";
    await sendNotificationIfEnabled(
      {
        userId: booking.user_id,
        title: "Reserva confirmada",
        body: `${business.name} ha confirmado tu reserva para ${productName}`,
        url: `/account/bookings`,
        tag: "booking",
        icon: "/icon.svg"
      },
      NOTIFICATION_TYPE.BOOKING_CONFIRMED
    );
  }

  revalidatePath("/dashboard/bookings");
  revalidatePath("/account/bookings");
  return { success: true };
}

export async function completeBooking(bookingId: string, businessId: string) {
  const auth = await verifyBusinessOwnership(businessId);
  if ("error" in auth) return { error: auth.error };

  const { error } = await auth.supabase
    .from("bookings")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .eq("business_id", businessId)
    .eq("status", "confirmed");

  if (error) return { error: "No se pudo completar el apartado." };

  revalidatePath("/dashboard/bookings");
  revalidatePath("/account/bookings");
  return { success: true };
}

export async function cancelBookingBusiness(
  bookingId: string,
  businessId: string,
  reason?: string,
) {
  const auth = await verifyBusinessOwnership(businessId);
  if ("error" in auth) return { error: auth.error };

  // Get booking and business details for notification
  const { data: booking } = await auth.supabase
    .from("bookings")
    .select("user_id, product_service_id, products_services(name)")
    .eq("id", bookingId)
    .single();

  const { data: business } = await auth.supabase
    .from("businesses")
    .select("name")
    .eq("id", businessId)
    .single();

  const cancellationReason = reason?.trim() || "Cancelada por el negocio";

  const { error } = await auth.supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancellation_reason: cancellationReason,
    })
    .eq("id", bookingId)
    .eq("business_id", businessId)
    .in("status", ["pending", "confirmed"]);

  if (error) return { error: "No se pudo cancelar el apartado." };

  // Send push notification to user
  if (booking && business) {
    const productName = (booking.products_services as any)?.name || "tu reserva";
    await sendNotificationIfEnabled(
      {
        userId: booking.user_id,
        title: "Reserva cancelada",
        body: `${business.name} ha cancelado tu reserva para ${productName}. Razón: ${cancellationReason}`,
        url: `/account/bookings`,
        tag: "booking",
        icon: "/icon.svg"
      },
      NOTIFICATION_TYPE.BOOKING_CANCELLED
    );
  }

  revalidatePath("/dashboard/bookings");
  revalidatePath("/account/bookings");
  return { success: true };
}
