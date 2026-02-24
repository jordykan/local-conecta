import { createClient } from "@/lib/supabase/server"
import type { Booking, Business, ProductService, Profile } from "@/lib/types/database"

export type BookingWithRelations = Booking & {
  businesses: Pick<Business, "id" | "name" | "slug" | "logo_url"> | null
  products_services: Pick<ProductService, "id" | "name" | "type"> | null
}

export async function getBookingsByUser(userId: string) {
  const supabase = await createClient()
  return supabase
    .from("bookings")
    .select(
      `*,
      businesses ( id, name, slug, logo_url ),
      products_services ( id, name, type )`
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
}

export type BookingWithClient = Booking & {
  profiles: Pick<Profile, "id" | "full_name" | "phone" | "avatar_url"> | null
  products_services: Pick<ProductService, "id" | "name" | "type" | "price" | "price_type"> | null
}

export async function getBookingsByBusiness(businessId: string) {
  const supabase = await createClient()
  return supabase
    .from("bookings")
    .select(
      `*,
      profiles ( id, full_name, phone, avatar_url ),
      products_services ( id, name, type, price, price_type )`
    )
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
}
