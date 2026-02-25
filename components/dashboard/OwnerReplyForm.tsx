"use client"

import { useState, useTransition } from "react"
import { sileo } from "sileo"
import type { ReviewWithAuthor } from "@/lib/queries/reviews"
import {
  replyToReview,
  deleteOwnerReply,
} from "@/app/dashboard/reviews/actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface OwnerReplyFormProps {
  review: ReviewWithAuthor
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OwnerReplyForm({
  review,
  open,
  onOpenChange,
}: OwnerReplyFormProps) {
  const [ownerReply, setOwnerReply] = useState(review.owner_reply ?? "")
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    startTransition(async () => {
      const result = await replyToReview({
        reviewId: review.id,
        ownerReply,
      })

      if (result?.error) {
        sileo.error({ title: "Error", description: result.error })
      } else {
        sileo.success({ title: "Respuesta publicada" })
        onOpenChange(false)
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteOwnerReply(review.id)

      if (result?.error) {
        sileo.error({ title: "Error", description: result.error })
      } else {
        sileo.success({ title: "Respuesta eliminada" })
        setOwnerReply("")
        onOpenChange(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Responder a reseña</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-xs font-semibold text-muted-foreground">
              Reseña de {review.profiles?.full_name ?? "Usuario"}
            </p>
            <p className="mt-1 text-sm">{review.comment}</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Tu respuesta
            </label>
            <Textarea
              value={ownerReply}
              onChange={(e) => setOwnerReply(e.target.value)}
              placeholder="Escribe tu respuesta..."
              rows={4}
              disabled={pending}
              className="resize-none"
            />
          </div>

          <div className="flex gap-2">
            {review.owner_reply && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={pending}
              >
                Eliminar
              </Button>
            )}
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
              {pending ? "Guardando..." : "Publicar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
