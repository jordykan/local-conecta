"use client"

import { useState } from "react"
import { IconStar, IconStarFilled } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

interface RatingSelectorProps {
  value: number
  onChange: (rating: number) => void
  disabled?: boolean
}

export function RatingSelector({
  value,
  onChange,
  disabled,
}: RatingSelectorProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const displayRating = hoverRating || value

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((rating) => {
        const isFilled = rating <= displayRating

        return (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            onMouseEnter={() => !disabled && setHoverRating(rating)}
            onMouseLeave={() => setHoverRating(0)}
            disabled={disabled}
            className={cn(
              "transition-transform hover:scale-110",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            {isFilled ? (
              <IconStarFilled className="size-8 fill-amber-400 text-amber-400" />
            ) : (
              <IconStar className="size-8 text-muted-foreground/30" />
            )}
          </button>
        )
      })}
      <span className="ml-2 text-sm font-medium text-muted-foreground">
        {displayRating > 0
          ? `${displayRating} estrella${displayRating !== 1 ? "s" : ""}`
          : "Sin calificar"}
      </span>
    </div>
  )
}
