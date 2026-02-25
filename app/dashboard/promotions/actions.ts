"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { promotionSchema } from "@/lib/validations/promotion";

async function verifyOwnership(businessId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, error: "No autorizado." };

  const { data: business } = await supabase
    .from("businesses")
    .select("id, slug")
    .eq("id", businessId)
    .eq("owner_id", user.id)
    .single();

  if (!business)
    return { supabase, user, error: "No tienes permiso para este negocio." };

  return { supabase, user, business, error: null };
}

export async function createPromotion(formData: FormData) {
  const businessId = formData.get("businessId") as string;
  const {
    supabase,
    error: authError,
    business,
  } = await verifyOwnership(businessId);
  if (authError || !business)
    return { error: authError ?? "Error de autorización." };

  const data = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    imageUrl: (formData.get("imageUrl") as string) || null,
    discountType: (formData.get("discountType") as string) || null,
    discountValue: formData.get("discountValue")
      ? parseFloat(formData.get("discountValue") as string)
      : null,
    startsAt: (formData.get("startsAt") as string) || null,
    endsAt: (formData.get("endsAt") as string) || null,
    isActive: formData.get("isActive") === "true",
  };

  const parsed = promotionSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((err) => {
      if (err.path[0]) {
        fieldErrors[err.path[0] as string] = err.message;
      }
    });
    return { error: "Datos inválidos.", fieldErrors };
  }

  const { error } = await supabase.from("promotions").insert({
    business_id: businessId,
    title: parsed.data.title,
    description: parsed.data.description || null,
    image_url: parsed.data.imageUrl || null,
    discount_type: parsed.data.discountType || null,
    discount_value: parsed.data.discountValue,
    starts_at: parsed.data.startsAt || null,
    ends_at: parsed.data.endsAt || null,
    is_active: parsed.data.isActive,
  });

  if (error) return { error: "No se pudo crear. Intenta de nuevo." };

  revalidatePath("/dashboard/promotions");
  revalidatePath(`/businesses/${business.slug}`);
  return { success: true };
}

export async function updatePromotion(formData: FormData) {
  const promotionId = formData.get("promotionId") as string;
  const supabase = await createClient();

  // Parallelize auth + promotion fetch (async-parallel rule)
  const [
    {
      data: { user },
    },
    { data: promotion },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("promotions")
      .select("business_id")
      .eq("id", promotionId)
      .single(),
  ]);

  if (!user) return { error: "No autorizado." };
  if (!promotion) return { error: "Promoción no encontrada." };

  const { data: business } = await supabase
    .from("businesses")
    .select("id, slug")
    .eq("id", promotion.business_id)
    .eq("owner_id", user.id)
    .single();

  if (!business) return { error: "No tienes permiso." };

  const data = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    imageUrl: (formData.get("imageUrl") as string) || null,
    discountType: (formData.get("discountType") as string) || null,
    discountValue: formData.get("discountValue")
      ? parseFloat(formData.get("discountValue") as string)
      : null,
    startsAt: (formData.get("startsAt") as string) || null,
    endsAt: (formData.get("endsAt") as string) || null,
    isActive: formData.get("isActive") === "true",
  };

  const parsed = promotionSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((err) => {
      if (err.path[0]) {
        fieldErrors[err.path[0] as string] = err.message;
      }
    });
    return { error: "Datos inválidos.", fieldErrors };
  }

  const { error } = await supabase
    .from("promotions")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
      image_url: parsed.data.imageUrl || null,
      discount_type: parsed.data.discountType || null,
      discount_value: parsed.data.discountValue,
      starts_at: parsed.data.startsAt || null,
      ends_at: parsed.data.endsAt || null,
      is_active: parsed.data.isActive,
    })
    .eq("id", promotionId);

  if (error) return { error: "No se pudo actualizar. Intenta de nuevo." };

  revalidatePath("/dashboard/promotions");
  revalidatePath(`/businesses/${business.slug}`);
  return { success: true };
}

export async function togglePromotionStatus(
  promotionId: string,
  isActive: boolean,
) {
  const supabase = await createClient();

  // Parallelize auth + promotion fetch (async-parallel rule)
  const [
    {
      data: { user },
    },
    { data: promotion },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("promotions")
      .select("business_id")
      .eq("id", promotionId)
      .single(),
  ]);

  if (!user) return { error: "No autorizado." };
  if (!promotion) return { error: "Promoción no encontrada." };

  const { data: business } = await supabase
    .from("businesses")
    .select("id, slug")
    .eq("id", promotion.business_id)
    .eq("owner_id", user.id)
    .single();

  if (!business) return { error: "No tienes permiso." };

  const { error } = await supabase
    .from("promotions")
    .update({ is_active: isActive })
    .eq("id", promotionId);

  if (error) return { error: "No se pudo actualizar." };

  revalidatePath("/dashboard/promotions");
  revalidatePath(`/businesses/${business.slug}`);
  return { success: true };
}

export async function deletePromotion(promotionId: string) {
  const supabase = await createClient();

  // Parallelize auth + promotion fetch (async-parallel rule)
  const [
    {
      data: { user },
    },
    { data: promotion },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("promotions")
      .select("business_id")
      .eq("id", promotionId)
      .single(),
  ]);

  if (!user) return { error: "No autorizado." };
  if (!promotion) return { error: "Promoción no encontrada." };

  const { data: business } = await supabase
    .from("businesses")
    .select("id, slug")
    .eq("id", promotion.business_id)
    .eq("owner_id", user.id)
    .single();

  if (!business) return { error: "No tienes permiso." };

  const { error } = await supabase
    .from("promotions")
    .delete()
    .eq("id", promotionId);

  if (error) return { error: "No se pudo eliminar." };

  revalidatePath("/dashboard/promotions");
  revalidatePath(`/businesses/${business.slug}`);
  return { success: true };
}
