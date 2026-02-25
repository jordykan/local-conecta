"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { productServiceSchema } from "@/lib/validations/product";

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

export async function createProduct(businessId: string, data: unknown) {
  const {
    supabase,
    error: authError,
    business,
  } = await verifyOwnership(businessId);
  if (authError || !business)
    return { error: authError ?? "Error de autorizacion." };

  const parsed = productServiceSchema.safeParse(data);
  if (!parsed.success) return { error: "Datos invalidos." };

  const { error } = await supabase.from("products_services").insert({
    business_id: businessId,
    type: parsed.data.type,
    name: parsed.data.name,
    description: parsed.data.description || null,
    price: parsed.data.price,
    price_type: parsed.data.priceType,
    image_url: parsed.data.imageUrl || null,
    is_available: parsed.data.isAvailable,
    is_bookable: parsed.data.isBookable,
    stock: parsed.data.stock,
    duration_minutes: parsed.data.durationMinutes,
  });

  if (error) return { error: "No se pudo crear. Intenta de nuevo." };

  revalidatePath("/dashboard/products");
  revalidatePath(`/businesses/${business.slug}`);
  return { success: true };
}

export async function updateProduct(productId: string, data: unknown) {
  const supabase = await createClient();

  // Parallelize auth + product fetch (async-parallel rule)
  const [
    {
      data: { user },
    },
    { data: product },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("products_services")
      .select("business_id")
      .eq("id", productId)
      .single(),
  ]);

  if (!user) return { error: "No autorizado." };
  if (!product) return { error: "Producto no encontrado." };

  const { data: business } = await supabase
    .from("businesses")
    .select("id, slug")
    .eq("id", product.business_id)
    .eq("owner_id", user.id)
    .single();

  if (!business) return { error: "No tienes permiso." };

  const parsed = productServiceSchema.safeParse(data);
  if (!parsed.success) return { error: "Datos invalidos." };

  const { error } = await supabase
    .from("products_services")
    .update({
      type: parsed.data.type,
      name: parsed.data.name,
      description: parsed.data.description || null,
      price: parsed.data.price,
      price_type: parsed.data.priceType,
      image_url: parsed.data.imageUrl || null,
      is_available: parsed.data.isAvailable,
      is_bookable: parsed.data.isBookable,
      stock: parsed.data.stock,
      duration_minutes: parsed.data.durationMinutes,
    })
    .eq("id", productId);

  if (error) return { error: "No se pudo actualizar. Intenta de nuevo." };

  revalidatePath("/dashboard/products");
  revalidatePath(`/businesses/${business.slug}`);
  return { success: true };
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();

  // Parallelize auth + product fetch (async-parallel rule)
  const [
    {
      data: { user },
    },
    { data: product },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("products_services")
      .select("business_id")
      .eq("id", productId)
      .single(),
  ]);

  if (!user) return { error: "No autorizado." };
  if (!product) return { error: "Producto no encontrado." };

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", product.business_id)
    .eq("owner_id", user.id)
    .single();

  if (!business) return { error: "No tienes permiso." };

  const { error } = await supabase
    .from("products_services")
    .delete()
    .eq("id", productId);

  if (error) return { error: "No se pudo eliminar." };

  revalidatePath("/dashboard/products");
  return { success: true };
}

export async function toggleProductAvailability(
  productId: string,
  isAvailable: boolean,
) {
  const supabase = await createClient();

  // Parallelize auth + product fetch (async-parallel rule)
  const [
    {
      data: { user },
    },
    { data: product },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("products_services")
      .select("business_id")
      .eq("id", productId)
      .single(),
  ]);

  if (!user) return { error: "No autorizado." };
  if (!product) return { error: "Producto no encontrado." };

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", product.business_id)
    .eq("owner_id", user.id)
    .single();

  if (!business) return { error: "No tienes permiso." };

  const { error } = await supabase
    .from("products_services")
    .update({ is_available: isAvailable })
    .eq("id", productId);

  if (error) return { error: "No se pudo actualizar." };

  revalidatePath("/dashboard/products");
  return { success: true };
}
