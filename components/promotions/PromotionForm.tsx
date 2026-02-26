"use client"

import { useRef, useState, useTransition } from "react"
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react"
import { toast } from "sonner"
import type { Promotion } from "@/lib/types/database"
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
import { createPromotion, updatePromotion } from "@/app/dashboard/promotions/actions"

interface PromotionFormProps {
  businessId: string
  promotion?: Promotion | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PromotionForm({
  businessId,
  promotion,
  open,
  onOpenChange,
}: PromotionFormProps) {
  const isEdit = !!promotion
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(promotion?.title ?? "")
  const [description, setDescription] = useState(promotion?.description ?? "")
  const [imageUrl, setImageUrl] = useState(promotion?.image_url ?? "")
  const [imagePreview, setImagePreview] = useState(promotion?.image_url ?? "")
  const [uploading, setUploading] = useState(false)
  const [discountType, setDiscountType] = useState<string>(
    promotion?.discount_type ?? "freeform"
  )
  const [discountValue, setDiscountValue] = useState(
    promotion?.discount_value?.toString() ?? ""
  )
  const [startsAt, setStartsAt] = useState(
    promotion?.starts_at
      ? new Date(promotion.starts_at).toISOString().slice(0, 16)
      : ""
  )
  const [endsAt, setEndsAt] = useState(
    promotion?.ends_at
      ? new Date(promotion.ends_at).toISOString().slice(0, 16)
      : ""
  )
  const [isActive, setIsActive] = useState(promotion?.is_active ?? true)
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
      const fileName = `promotions/${businessId}/${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("public")
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from("public")
        .getPublicUrl(fileName)

      setImageUrl(urlData.publicUrl)
    } catch {
      toast.error("Error al subir imagen", {
        description: "No se pudo cargar la imagen. Intenta de nuevo"
      })
      setImagePreview(promotion?.image_url ?? "")
      setImageUrl(promotion?.image_url ?? "")
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
    setErrors({})

    startTransition(async () => {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("imageUrl", imageUrl)
      formData.append("discountType", discountType)
      formData.append("discountValue", discountValue)
      formData.append("startsAt", startsAt)
      formData.append("endsAt", endsAt)
      formData.append("isActive", isActive.toString())

      if (isEdit && promotion) {
        formData.append("promotionId", promotion.id)
      } else {
        formData.append("businessId", businessId)
      }

      const result = isEdit
        ? await updatePromotion(formData)
        : await createPromotion(formData)

      if (result?.error) {
        if (result.fieldErrors) {
          setErrors(result.fieldErrors)
        } else {
          toast.error(isEdit ? "Error al actualizar" : "Error al crear", {
            description: result.error
          })
        }
      } else {
        toast.success(isEdit ? "Promoción actualizada" : "Promoción creada", {
          description: isEdit ? "Los cambios han sido guardados" : "La promoción está visible para tus clientes"
        })
        onOpenChange(false)
        if (!isEdit) {
          setTitle("")
          setDescription("")
          setImageUrl("")
          setImagePreview("")
          setDiscountValue("")
          setStartsAt("")
          setEndsAt("")
        }
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar" : "Nueva"} promocion
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ── Image + Title + Description ── */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="group relative flex size-[100px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-muted/30 transition-colors hover:border-primary/30"
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
                  <IconPhoto className="size-6 text-muted-foreground/40" />
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
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titulo de la promocion *"
                  disabled={pending}
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.title}
                  </p>
                )}
              </div>

              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripcion (opcional)"
                rows={2}
                className="resize-none"
                disabled={pending}
              />
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

          {/* ── Discount ── */}
          <fieldset className="space-y-2">
            <legend className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Descuento
            </legend>
            <div className={
              discountType !== "freeform"
                ? "grid grid-cols-[1fr_1fr] gap-2"
                : ""
            }>
              <Select
                value={discountType}
                onValueChange={setDiscountType}
                disabled={pending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="freeform">Texto libre</SelectItem>
                  <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                  <SelectItem value="fixed">Monto fijo ($)</SelectItem>
                  <SelectItem value="bogo">2x1</SelectItem>
                </SelectContent>
              </Select>

              {discountType !== "freeform" && (
                <Input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={
                    discountType === "percentage"
                      ? "20"
                      : discountType === "fixed"
                        ? "100"
                        : "Precio"
                  }
                  disabled={pending}
                  min={discountType === "percentage" ? "1" : "0"}
                  max={discountType === "percentage" ? "100" : undefined}
                />
              )}
            </div>
            {errors.discountValue && (
              <p className="text-xs text-destructive">
                {errors.discountValue}
              </p>
            )}
          </fieldset>

          {/* ── Dates ── */}
          <fieldset className="space-y-2">
            <legend className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Vigencia
            </legend>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  disabled={pending}
                  className="text-xs"
                />
                {errors.startsAt && (
                  <p className="mt-1 text-xs text-destructive">{errors.startsAt}</p>
                )}
              </div>
              <div>
                <Input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  disabled={pending}
                  className="text-xs"
                />
                {errors.endsAt && (
                  <p className="mt-1 text-xs text-destructive">{errors.endsAt}</p>
                )}
              </div>
            </div>
          </fieldset>

          {/* ── Options ── */}
          <div className="flex items-center gap-6 rounded-lg bg-muted/30 px-4 py-3">
            <label className="flex cursor-pointer items-center gap-2">
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={pending}
                className="scale-90"
              />
              <span className="text-xs font-medium">Activa</span>
            </label>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
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
