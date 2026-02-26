"use client"

import { useRef, useState, useTransition } from "react"
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react"
import { toast } from "sonner"
import type { ProductService } from "@/lib/types/database"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createProduct, updateProduct } from "@/app/dashboard/products/actions"

interface ProductFormProps {
  businessId: string
  product?: ProductService | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductForm({
  businessId,
  product,
  open,
  onOpenChange,
}: ProductFormProps) {
  const isEdit = !!product
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [type, setType] = useState<"product" | "service">(
    product?.type ?? "product"
  )
  const [name, setName] = useState(product?.name ?? "")
  const [description, setDescription] = useState(product?.description ?? "")
  const [price, setPrice] = useState(product?.price?.toString() ?? "")
  const [priceType, setPriceType] = useState(
    product?.price_type ?? "fixed"
  )
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "")
  const [imagePreview, setImagePreview] = useState(product?.image_url ?? "")
  const [uploading, setUploading] = useState(false)
  const [isAvailable, setIsAvailable] = useState(product?.is_available ?? true)
  const [isBookable, setIsBookable] = useState(product?.is_bookable ?? false)
  const [stock, setStock] = useState(product?.stock?.toString() ?? "")
  const [durationMinutes, setDurationMinutes] = useState(
    product?.duration_minutes?.toString() ?? ""
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, startTransition] = useTransition()

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Solo se permiten imagenes" }))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "La imagen no debe superar 5 MB" }))
      return
    }

    setErrors((prev) => {
      const { image: _, ...rest } = prev
      return rest
    })
    setUploading(true)

    // Preview
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    try {
      const supabase = createClient()
      const ext = file.name.split(".").pop()
      const fileName = `products/${businessId}/${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("public")
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from("public")
        .getPublicUrl(fileName)

      setImageUrl(urlData.publicUrl)
    } catch {
      toast.error("Error al subir imagen")
      setImagePreview(product?.image_url ?? "")
      setImageUrl(product?.image_url ?? "")
    } finally {
      setUploading(false)
    }
  }

  function removeImage() {
    setImageUrl("")
    setImagePreview("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fieldErrors: Record<string, string> = {}

    if (name.trim().length < 2) {
      fieldErrors.name = "El nombre debe tener al menos 2 caracteres"
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    const data = {
      type,
      name: name.trim(),
      description: description.trim() || undefined,
      price: price ? Number(price) : null,
      priceType,
      imageUrl: imageUrl || null,
      isAvailable,
      isBookable,
      stock: type === "product" && stock ? Number(stock) : null,
      durationMinutes:
        type === "service" && durationMinutes ? Number(durationMinutes) : null,
    }

    startTransition(async () => {
      const result = isEdit
        ? await updateProduct(product.id, data)
        : await createProduct(businessId, data)

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(isEdit ? "Producto actualizado" : "Producto creado")
        onOpenChange(false)
        if (!isEdit) {
          setName("")
          setDescription("")
          setPrice("")
          setStock("")
          setDurationMinutes("")
          setImageUrl("")
          setImagePreview("")
        }
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar" : "Nuevo"}{" "}
            {type === "product" ? "producto" : "servicio"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ── Identity: Image + Name + Type ── */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="group relative flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-muted/30 transition-colors hover:border-primary/30"
            >
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt=""
                    className="size-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                    <IconUpload className="size-4 text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-0.5">
                  <IconPhoto className="size-5 text-muted-foreground/40" />
                  <span className="text-[9px] text-muted-foreground/50">
                    Foto
                  </span>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                  <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}
            </button>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre del producto *"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setType("product")}
                  className={cn(
                    "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    type === "product"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  Producto
                </button>
                <button
                  type="button"
                  onClick={() => setType("service")}
                  className={cn(
                    "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    type === "service"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  Servicio
                </button>
              </div>
            </div>
          </div>

          {/* Remove image link */}
          {imagePreview && (
            <button
              type="button"
              onClick={removeImage}
              disabled={uploading}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
            >
              <IconX className="size-3" />
              Quitar imagen
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          {errors.image && (
            <p className="text-xs text-destructive">{errors.image}</p>
          )}

          {/* ── Description ── */}
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripcion (opcional)"
            rows={2}
            className="resize-none"
          />

          {/* ── Pricing ── */}
          <fieldset className="space-y-2">
            <legend className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Precio
            </legend>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                min={0}
                step={0.01}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                disabled={priceType === "quote"}
              />
              <Select
                value={priceType}
                onValueChange={(v) => setPriceType(v as typeof priceType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fijo</SelectItem>
                  <SelectItem value="starting_at">Desde</SelectItem>
                  <SelectItem value="per_hour">Por hora</SelectItem>
                  <SelectItem value="quote">A consultar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === "product" && (
              <Input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Stock disponible (opcional)"
              />
            )}

            {type === "service" && (
              <Input
                type="number"
                min={1}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="Duracion en minutos (opcional)"
              />
            )}
          </fieldset>

          {/* ── Options ── */}
          <div className="flex items-center gap-6 rounded-lg bg-muted/30 px-4 py-3">
            <label className="flex cursor-pointer items-center gap-2">
              <Switch
                checked={isAvailable}
                onCheckedChange={setIsAvailable}
                className="scale-90"
              />
              <span className="text-xs font-medium">Disponible</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <Switch
                checked={isBookable}
                onCheckedChange={setIsBookable}
                className="scale-90"
              />
              <span className="text-xs font-medium">Reservable</span>
            </label>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={pending || uploading}
              className="flex-1"
            >
              {pending
                ? "Guardando..."
                : isEdit
                  ? "Guardar"
                  : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
