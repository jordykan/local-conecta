import {
  IconStar,
  IconStarFilled,
  IconStarHalfFilled,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"

interface RatingStarsProps {
  rating: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  showNumber?: boolean
  className?: string
  interactive?: boolean
  onChange?: (rating: number) => void
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = "md",
  showNumber = false,
  className,
  interactive = false,
  onChange,
}: RatingStarsProps) {
  const sizeClasses = {
    sm: "size-3.5",
    md: "size-4",
    lg: "size-5",
  }

  const stars = Array.from({ length: maxRating }, (_, i) => {
    const starValue = i + 1
    const isFilled = rating >= starValue
    const isHalf = !isFilled && rating >= starValue - 0.5

    return (
      <button
        key={i}
        type={interactive ? "button" : undefined}
        onClick={interactive ? () => onChange?.(starValue) : undefined}
        disabled={!interactive}
        className={cn(
          interactive &&
            "cursor-pointer transition-transform hover:scale-110",
          !interactive && "cursor-default",
        )}
      >
        {isFilled ? (
          <IconStarFilled
            className={cn(sizeClasses[size], "fill-amber-400 text-amber-400")}
          />
        ) : isHalf ? (
          <IconStarHalfFilled
            className={cn(sizeClasses[size], "fill-amber-400 text-amber-400")}
          />
        ) : (
          <IconStar
            className={cn(sizeClasses[size], "text-muted-foreground/30")}
          />
        )}
      </button>
    )
  })

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {stars}
      {showNumber && (
        <span className="ml-1 text-sm font-medium text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
