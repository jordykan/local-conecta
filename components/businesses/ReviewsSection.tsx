"use client"

import { useState } from "react"
import { IconStar, IconMessageCircle } from "@tabler/icons-react"
import type { Review, Business } from "@/lib/types/database"
import { ReviewCard } from "./ReviewCard"
import { ReviewForm } from "./ReviewForm"
import { Button } from "@/components/ui/button"
import type { ReviewWithAuthor } from "@/lib/queries/reviews"

interface ReviewsSectionProps {
  reviews: ReviewWithAuthor[]
  business: Pick<Business, "id" | "name" | "slug">
  averageRating: number
  totalReviews: number
  canUserReview: boolean
  userReview?: Review | null
}

export function ReviewsSection({
  reviews,
  business,
  averageRating,
  totalReviews,
  canUserReview,
  userReview,
}: ReviewsSectionProps) {
  const [showForm, setShowForm] = useState(false)

  if (reviews.length === 0 && !canUserReview) return null

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconStar className="size-5 fill-amber-400 text-amber-400" />
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Reseñas</h2>
            {totalReviews > 0 && (
              <p className="text-xs text-muted-foreground">
                {averageRating.toFixed(1)} de 5 estrellas • {totalReviews}{" "}
                {totalReviews === 1 ? "reseña" : "reseñas"}
              </p>
            )}
          </div>
        </div>

        {canUserReview && !userReview && (
          <Button onClick={() => setShowForm(true)} size="sm">
            <IconMessageCircle className="mr-1.5 size-4" />
            Dejar reseña
          </Button>
        )}
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
          <IconStar className="mx-auto size-10 text-muted-foreground/30" />
          <p className="mt-2 text-sm text-muted-foreground">
            Sé el primero en dejar una reseña
          </p>
        </div>
      )}

      {/* Form modal */}
      {canUserReview && (
        <ReviewForm
          businessId={business.id}
          businessName={business.name}
          review={userReview}
          open={showForm || !!userReview}
          onOpenChange={setShowForm}
        />
      )}
    </section>
  )
}
