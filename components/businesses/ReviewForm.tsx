"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import type { Review } from "@/lib/types/database"
import {
  createReview,
  updateReview,
} from "@/app/(main)/businesses/[slug]/actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RatingSelector } from "@/components/shared/RatingSelector"

interface ReviewFormProps {
  businessId: string
  businessName: string
  review?: Review | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReviewForm({
  businessId,
  businessName,
  review,
  open,
  onOpenChange,
}: ReviewFormProps) {
  const isEdit = !!review
  const [rating, setRating] = useState(review?.rating ?? 0)
  const [comment, setComment] = useState(review?.comment ?? "")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    startTransition(async () => {
      const data = { rating, comment, businessId }

      const result = isEdit
        ? await updateReview(review.id, data)
        : await createReview(data)

      if (result?.error) {
        if (result.fieldErrors) {
          setErrors(result.fieldErrors)
        } else {
          toast.error(isEdit ? "Error al actualizar" : "Error al publicar", {
            description: result.error
          })
        }
      } else {
        toast.success(isEdit ? "Reseña actualizada" : "Reseña publicada", {
          description: isEdit
            ? "Tus cambios han sido guardados"
            : "Tu reseña es visible para todos los usuarios"
        })
        onOpenChange(false)
        if (!isEdit) {
          setRating(0)
          setComment("")
        }
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar reseña" : `Reseña para ${businessName}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating selector */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Calificación *
            </label>
            <RatingSelector
              value={rating}
              onChange={setRating}
              disabled={pending}
            />
            {errors.rating && (
              <p className="mt-1 text-xs text-destructive">{errors.rating}</p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Comentario *
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos sobre tu experiencia..."
              rows={5}
              disabled={pending}
              className="resize-none"
            />
            {errors.comment && (
              <p className="mt-1 text-xs text-destructive">{errors.comment}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending} className="flex-1">
              {pending ? "Guardando..." : isEdit ? "Actualizar" : "Publicar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
