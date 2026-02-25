"use client"

import { useState } from "react"
import { IconStar, IconMessageCircle } from "@tabler/icons-react"
import type { ReviewWithAuthor } from "@/lib/queries/reviews"
import { ReviewCard } from "@/components/businesses/ReviewCard"
import { OwnerReplyForm } from "./OwnerReplyForm"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"

interface ReviewsListProps {
  reviews: ReviewWithAuthor[]
  businessId: string
}

export function ReviewsList({ reviews, businessId }: ReviewsListProps) {
  const [replyingTo, setReplyingTo] = useState<ReviewWithAuthor | null>(null)

  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={IconStar}
        title="Sin reseñas aún"
        description="Las reseñas de tus clientes aparecerán aquí. Anímalos a dejar una reseña después de su visita."
      />
    )
  }

  return (
    <>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-lg border bg-card p-4">
            <ReviewCard review={review} />

            {!review.owner_reply ? (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setReplyingTo(review)}
              >
                <IconMessageCircle className="mr-1.5 size-4" />
                Responder
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setReplyingTo(review)}
              >
                Editar respuesta
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Reply modal */}
      {replyingTo && (
        <OwnerReplyForm
          review={replyingTo}
          open={!!replyingTo}
          onOpenChange={(open) => !open && setReplyingTo(null)}
        />
      )}
    </>
  )
}
