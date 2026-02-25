"use client"

import { useState } from "react"
import { IconTag, IconCalendar, IconInfoCircle } from "@tabler/icons-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Promotion, Business } from "@/lib/types/database"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PromotionsCarousel } from "./PromotionsCarousel"
import { PromotionDetailsModal } from "./PromotionDetailsModal"

interface PromotionsSectionProps {
  promotions: Promotion[]
  businessInfo: Pick<Business, "id" | "name" | "phone" | "whatsapp">
}

function formatDiscount(promotion: Promotion): string | null {
  if (!promotion.discount_type || promotion.discount_type === "freeform") {
    return null
  }
  if (promotion.discount_type === "percentage") {
    return `${promotion.discount_value}% de descuento`
  }
  if (promotion.discount_type === "fixed") {
    return `$${promotion.discount_value} de descuento`
  }
  if (promotion.discount_type === "bogo") {
    return "2x1"
  }
  return null
}

function PromotionCard({
  promotion,
  onClick,
}: {
  promotion: Promotion
  onClick: (promotion: Promotion) => void
}) {
  const discount = formatDiscount(promotion)

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
      onClick={() => onClick(promotion)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick(promotion)
        }
      }}
    >
      {promotion.image_url ? (
        <div className="relative aspect-[16/9] bg-muted">
          <img
            src={promotion.image_url}
            alt={promotion.title}
            className="size-full object-cover transition-transform group-hover:scale-105"
          />
          {discount && (
            <Badge className="absolute right-3 top-3 border-0 bg-primary text-primary-foreground shadow-md">
              {discount}
            </Badge>
          )}
        </div>
      ) : (
        <div className="relative flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-background">
          <IconTag className="size-12 text-primary/30 transition-transform group-hover:scale-110" />
          {discount && (
            <Badge className="absolute right-3 top-3 bg-primary text-primary-foreground">
              {discount}
            </Badge>
          )}
        </div>
      )}

      <CardContent className="p-4">
        <h3 className="mb-1 font-semibold">{promotion.title}</h3>

        {promotion.description && (
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
            {promotion.description}
          </p>
        )}

        {promotion.ends_at && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <IconCalendar className="size-3.5" />
            <span>
              Válida hasta el{" "}
              {format(new Date(promotion.ends_at), "d 'de' MMMM, yyyy", {
                locale: es,
              })}
            </span>
          </div>
        )}

        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <IconInfoCircle className="size-3.5" />
          <span>Click para más detalles</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function PromotionsSection({ promotions, businessInfo }: PromotionsSectionProps) {
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)

  if (promotions.length === 0) return null

  return (
    <>
      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <IconTag className="size-5 text-primary" />
          <h2 className="text-lg font-semibold tracking-tight">
            Promociones activas
          </h2>
        </div>

        {promotions.length === 1 ? (
          <div className="max-w-2xl">
            <PromotionCard promotion={promotions[0]} onClick={setSelectedPromotion} />
          </div>
        ) : (
          <PromotionsCarousel
            promotions={promotions}
            onPromotionClick={setSelectedPromotion}
          />
        )}
      </section>

      {/* Promotion details modal */}
      {selectedPromotion && (
        <PromotionDetailsModal
          promotion={selectedPromotion}
          business={businessInfo}
          open={!!selectedPromotion}
          onOpenChange={(open) => {
            if (!open) setSelectedPromotion(null)
          }}
        />
      )}
    </>
  )
}
