"use client"

import { useState, useTransition } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCategory, updateCategory } from "@/app/admin/categories/actions"
import { toast } from "sonner"
import type { Category } from "@/lib/types/database"
import type { CategoryFormData } from "@/lib/validations/category"

type AdminCategoryFormProps = {
  category?: Category
  children: React.ReactNode
}

export function AdminCategoryForm({ category, children }: AdminCategoryFormProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState<CategoryFormData>({
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    icon: category?.icon ?? null,
    sort_order: category?.sort_order ?? 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    console.log("Enviando datos:", formData, "Categoría ID:", category?.id)

    startTransition(async () => {
      const result = category
        ? await updateCategory(category.id, formData)
        : await createCategory(formData)

      console.log("Resultado:", result)

      if (result.success) {
        toast.success(category ? "Categoría actualizada" : "Categoría creada")
        setOpen(false)
        if (!category) {
          setFormData({ name: "", slug: "", icon: null, sort_order: 0 })
        }
      } else {
        toast.error(result.error ?? "Error al guardar la categoría")
      }
    })
  }

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: category ? prev.slug : value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{category ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
          <DialogDescription>
            {category ? "Modifica los datos de la categoría" : "Crea una nueva categoría de negocios"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Restaurantes"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="restaurantes"
              required
            />
            <p className="text-xs text-muted-foreground">Solo letras minúsculas, números y guiones</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Ícono (emoji)</Label>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  id="icon"
                  value={formData.icon ?? ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value || null }))}
                  placeholder="🍔"
                  maxLength={10}
                />
                <p className="mt-1 text-xs text-muted-foreground">Pega un emoji aquí</p>
              </div>
              {formData.icon && (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30">
                  <span className="text-2xl leading-none">{formData.icon}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort_order">Orden</Label>
            <Input
              id="sort_order"
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData((prev) => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
              min={0}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : category ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
