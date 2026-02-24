"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { businessRegistrationSchema } from "@/lib/validations/business"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export async function registerBusiness(data: unknown) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Debes iniciar sesion para registrar un negocio." }
  }

  // Check if user already has a business
  const { data: existingBusiness } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle()

  if (existingBusiness) {
    return { error: "Ya tienes un negocio registrado. Solo se permite un negocio por cuenta." }
  }

  // Safety net: ensure profile exists (handles users created before trigger migration)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) {
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        full_name: user.user_metadata?.full_name ?? "",
        avatar_url: user.user_metadata?.avatar_url ?? "",
        role: "user",
      })

    if (profileError) {
      console.error("Profile insert error:", profileError.message)
      return {
        error:
          "No se pudo crear tu perfil. Ejecuta esta SQL en Supabase: CREATE POLICY \"profiles_insert_own\" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);",
      }
    }
  }

  const parsed = businessRegistrationSchema.safeParse(data)
  if (!parsed.success) {
    console.error("Validation errors:", parsed.error.flatten())
    return {
      error:
        "Datos invalidos: " +
        parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", "),
    }
  }

  const { hours, ...businessData } = parsed.data

  // Generate unique slug
  let slug = slugify(businessData.name)
  const { data: existing } = await supabase
    .from("businesses")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle()

  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  // Insert business
  const { data: business, error: bizError } = await supabase
    .from("businesses")
    .insert({
      owner_id: user.id,
      community_id: businessData.communityId,
      category_id: businessData.categoryId,
      name: businessData.name,
      slug,
      description: businessData.description || null,
      short_description: businessData.shortDescription || null,
      logo_url: businessData.logoUrl || null,
      cover_url: businessData.coverUrl || null,
      phone: businessData.phone || null,
      whatsapp: businessData.whatsapp || null,
      email: businessData.email || null,
      address: businessData.address || null,
      status: "pending",
    })
    .select("id")
    .single()

  if (bizError) {
    console.error("Business insert error:", bizError.message)
    return { error: "No se pudo registrar el negocio: " + bizError.message }
  }

  // Insert 7 business_hours records
  const hoursRecords = hours.map((h) => ({
    business_id: business.id,
    day_of_week: h.dayOfWeek,
    open_time: h.isClosed ? null : h.openTime || "09:00",
    close_time: h.isClosed ? null : h.closeTime || "18:00",
    is_closed: h.isClosed,
  }))

  const { error: hoursError } = await supabase
    .from("business_hours")
    .insert(hoursRecords)

  if (hoursError) {
    console.error("Hours insert error:", hoursError.message)
    await supabase.from("businesses").delete().eq("id", business.id)
    return { error: "Error al guardar los horarios: " + hoursError.message }
  }

  // Update user role to business_owner
  await supabase
    .from("profiles")
    .update({ role: "business_owner" })
    .eq("id", user.id)

  revalidatePath("/")
  return { success: true }
}
