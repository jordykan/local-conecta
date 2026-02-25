import { createClient } from "@/lib/supabase/server"
import type {
  Business,
  Category,
  BusinessHours,
  ProductService,
  Promotion,
} from "@/lib/types/database"

export type BusinessWithRelations = Business & {
  categories: Category | null
  business_hours: BusinessHours[]
  products_services: ProductService[]
  promotions: Promotion[]
}

export async function getBusinessBySlug(slug: string) {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const result = await supabase
    .from("businesses")
    .select(
      `*,
      categories ( id, name, slug, icon ),
      business_hours ( * ),
      products_services ( * ),
      promotions!promotions_business_id_fkey ( * )`
    )
    .eq("slug", slug)
    .eq("status", "active")
    .single<BusinessWithRelations>()

  // Filter promotions in code to avoid excluding businesses without active promotions
  if (result.data) {
    result.data.promotions = (result.data.promotions ?? []).filter(
      (p) =>
        p.is_active &&
        (!p.ends_at || new Date(p.ends_at) > new Date(now))
    )
  }

  return result
}

export async function getBusinessByOwner(ownerId: string) {
  const supabase = await createClient()
  return supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })
}

export async function getCategories() {
  const supabase = await createClient()
  return supabase.from("categories").select("*").order("sort_order")
}

export async function getCommunities() {
  const supabase = await createClient()
  return supabase.from("communities").select("*").eq("is_active", true)
}

export async function getProductsByBusiness(businessId: string) {
  const supabase = await createClient()
  return supabase
    .from("products_services")
    .select("*")
    .eq("business_id", businessId)
    .order("sort_order")
    .order("created_at", { ascending: false })
}

export async function getBusinessHours(businessId: string) {
  const supabase = await createClient()
  return supabase
    .from("business_hours")
    .select("*")
    .eq("business_id", businessId)
    .order("day_of_week")
}

export type BusinessDirectoryItem = Business & {
  categories: Pick<Category, "id" | "name" | "slug" | "icon"> | null
  business_hours: Pick<BusinessHours, "day_of_week" | "open_time" | "close_time" | "is_closed">[]
  promotions: Pick<Promotion, "id" | "is_active" | "ends_at">[]
}

export async function getBusinessesDirectory(params: {
  q?: string
  categorySlug?: string
  hasPromotions?: boolean
}) {
  const supabase = await createClient()
  const now = new Date().toISOString()

  let query = supabase
    .from("businesses")
    .select(
      `*,
      categories ( id, name, slug, icon ),
      business_hours ( day_of_week, open_time, close_time, is_closed ),
      promotions!promotions_business_id_fkey ( id, is_active, ends_at )`
    )
    .eq("status", "active")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })

  if (params.q) {
    query = query.or(
      `name.ilike.%${params.q}%,short_description.ilike.%${params.q}%,description.ilike.%${params.q}%`
    )
  }

  if (params.categorySlug) {
    // Need to get category id from slug first
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.categorySlug)
      .single()

    if (cat) {
      query = query.eq("category_id", cat.id)
    }
  }

  const result = await query.returns<BusinessDirectoryItem[]>()

  // Filter promotions in code and apply hasPromotions filter
  if (result.data) {
    result.data = result.data.map((business) => ({
      ...business,
      promotions: (business.promotions ?? []).filter(
        (p) =>
          p.is_active &&
          (!p.ends_at || new Date(p.ends_at) > new Date(now))
      ),
    }))

    // If filtering by promotions, only include businesses that have at least one active promotion
    if (params.hasPromotions) {
      result.data = result.data.filter((b) => (b.promotions?.length ?? 0) > 0)
    }
  }

  return result
}
