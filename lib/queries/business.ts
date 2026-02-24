import { createClient } from "@/lib/supabase/server"
import type {
  Business,
  Category,
  BusinessHours,
  ProductService,
} from "@/lib/types/database"

export type BusinessWithRelations = Business & {
  categories: Category | null
  business_hours: BusinessHours[]
  products_services: ProductService[]
}

export async function getBusinessBySlug(slug: string) {
  const supabase = await createClient()
  return supabase
    .from("businesses")
    .select(
      `*,
      categories ( id, name, slug, icon ),
      business_hours ( * ),
      products_services ( * )`
    )
    .eq("slug", slug)
    .eq("status", "active")
    .single<BusinessWithRelations>()
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
}

export async function getBusinessesDirectory(params: {
  q?: string
  categorySlug?: string
}) {
  const supabase = await createClient()

  let query = supabase
    .from("businesses")
    .select(
      `*,
      categories ( id, name, slug, icon ),
      business_hours ( day_of_week, open_time, close_time, is_closed )`
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

  return query.returns<BusinessDirectoryItem[]>()
}
