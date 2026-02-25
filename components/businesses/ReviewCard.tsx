import { format } from "date-fns"
import { es } from "date-fns/locale"
import { IconUser } from "@tabler/icons-react"
import type { ReviewWithAuthor } from "@/lib/queries/reviews"
import { Card, CardContent } from "@/components/ui/card"
import { RatingStars } from "@/components/shared/RatingStars"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface ReviewCardProps {
  review: ReviewWithAuthor
  showActions?: boolean
  onEdit?: (review: ReviewWithAuthor) => void
  onDelete?: (reviewId: string) => void
}

export function ReviewCard({
  review,
  showActions,
  onEdit,
  onDelete,
}: ReviewCardProps) {
  const authorName = review.profiles?.full_name ?? "Usuario"
  const authorInitial = authorName.charAt(0).toUpperCase()

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar>
            {review.profiles?.avatar_url ? (
              <AvatarImage src={review.profiles.avatar_url} alt={authorName} />
            ) : null}
            <AvatarFallback>
              {review.profiles?.avatar_url ? null : (
                <IconUser className="size-4" />
              )}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{authorName}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(review.created_at), "d 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
              <RatingStars rating={review.rating} size="sm" />
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {review.comment}
            </p>

            {review.owner_reply && (
              <div className="mt-3 rounded-lg bg-muted/50 p-3">
                <p className="text-xs font-semibold text-muted-foreground">
                  Respuesta del negocio
                </p>
                <p className="mt-1 text-sm leading-relaxed">
                  {review.owner_reply}
                </p>
                {review.owner_replied_at && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {format(
                      new Date(review.owner_replied_at),
                      "d 'de' MMMM, yyyy",
                      { locale: es },
                    )}
                  </p>
                )}
              </div>
            )}

            {showActions && (
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit?.(review)}
                >
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete?.(review.id)}
                >
                  Eliminar
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
