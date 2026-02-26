"use server"

import { requireAdmin } from "@/lib/queries/admin"
import { createClient } from "@/lib/supabase/server"
import { categorySchema, type CategoryFormData } from "@/lib/validations/category"
import { revalidatePath } from "next/cache"

export async function createCategory(data: CategoryFormData) {
  try {
    await requireAdmin()

    const validated = categorySchema.parse(data)
    const supabase = await createClient()

    // Verificar si el slug ya existe
    const { data: existing } = await supabase.from("categories").select("id").eq("slug", validated.slug).single()

    if (existing) {
      return { success: false, error: "Ya existe una categoría con ese slug" }
    }

    // Obtener el último sort_order
    const { data: lastCategory } = await supabase
      .from("categories")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .single()

    const nextSortOrder = (lastCategory?.sort_order ?? 0) + 1

    const { error } = await supabase.from("categories").insert({
      name: validated.name,
      slug: validated.slug,
      icon: validated.icon ?? null,
      sort_order: validated.sort_order ?? nextSortOrder,
    })

    if (error) throw error

    revalidatePath("/admin/categories")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error al crear categoría:", error)
    return { success: false, error: "Error al crear la categoría" }
  }
}

export async function updateCategory(categoryId: string, formData: CategoryFormData) {
  try {
    await requireAdmin()

    const validated = categorySchema.parse(formData)
    const supabase = await createClient()

    console.log("Actualizando categoría:", categoryId, validated)

    // Verificar si el slug ya existe en otra categoría
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", validated.slug)
      .neq("id", categoryId)
      .maybeSingle()

    if (existing) {
      return { success: false, error: "Ya existe una categoría con ese slug" }
    }

    const { data, error } = await supabase
      .from("categories")
      .update({
        name: validated.name,
        slug: validated.slug,
        icon: validated.icon ?? null,
        sort_order: validated.sort_order,
      })
      .eq("id", categoryId)
      .select()

    console.log("Resultado actualización:", { error, data, rowsAffected: data?.length })

    if (error) {
      console.error("Error de Supabase:", error)
      throw error
    }

    if (!data || data.length === 0) {
      console.error("⚠️ No se actualizó ningún registro. Posible problema de RLS en Supabase")
      return { success: false, error: "No se pudo actualizar. Verifica los permisos RLS en Supabase." }
    }

    console.log("✅ Categoría actualizada correctamente:", data[0])

    revalidatePath("/admin/categories")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error al actualizar categoría:", error)
    return { success: false, error: "Error al actualizar la categoría" }
  }
}

export async function deleteCategory(categoryId: string) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    // Verificar si hay negocios con esta categoría
    const { count } = await supabase.from("businesses").select("*", { count: "exact", head: true }).eq("category_id", categoryId)

    if (count && count > 0) {
      return {
        success: false,
        error: `No se puede eliminar. Hay ${count} ${count === 1 ? "negocio" : "negocios"} con esta categoría`,
      }
    }

    const { error } = await supabase.from("categories").delete().eq("id", categoryId)

    if (error) throw error

    revalidatePath("/admin/categories")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error al eliminar categoría:", error)
    return { success: false, error: "Error al eliminar la categoría" }
  }
}

export async function reorderCategories(categoryIds: string[]) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    // Actualizar el sort_order de cada categoría
    const updates = categoryIds.map((id, index) =>
      supabase.from("categories").update({ sort_order: index }).eq("id", id)
    )

    await Promise.all(updates)

    revalidatePath("/admin/categories")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error al reordenar categorías:", error)
    return { success: false, error: "Error al reordenar las categorías" }
  }
}
