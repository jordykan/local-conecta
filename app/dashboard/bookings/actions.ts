"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

  const { error } = await auth.supabase
    .from("bookings")
    .update({
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .eq("business_id", businessId)
    .eq("status", "pending");

  if (error) return { error: "No se pudo confirmar la reserva." };

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

  if (error) return { error: "No se pudo completar la reserva." };

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

  const { error } = await auth.supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason?.trim() || "Cancelada por el negocio",
    })
    .eq("id", bookingId)
    .eq("business_id", businessId)
    .in("status", ["pending", "confirmed"]);

  if (error) return { error: "No se pudo cancelar la reserva." };

  revalidatePath("/dashboard/bookings");
  revalidatePath("/account/bookings");
  return { success: true };
}
