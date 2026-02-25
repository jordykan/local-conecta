"use client"

import { useEffect, useState, useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { IconChevronLeft, IconChevronRight, IconTag, IconCalendar, IconInfoCircle } from "@tabler/icons-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Promotion } from "@/lib/types/database"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface PromotionsCarouselProps {
  promotions: Promotion[]
  onPromotionClick: (promotion: Promotion) => void
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

export function PromotionsCarousel({ promotions, onPromotionClick }: PromotionsCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    slidesToScroll: 1,
  })

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index)
    },
    [emblaApi]
  )

  const onInit = useCallback(() => {
    if (!emblaApi) return
    setScrollSnaps(emblaApi.scrollSnapList())
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setPrevBtnDisabled(!emblaApi.canScrollPrev())
    setNextBtnDisabled(!emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    onInit()
    onSelect()
    emblaApi.on("reInit", onInit)
    emblaApi.on("reInit", onSelect)
    emblaApi.on("select", onSelect)

    return () => {
      emblaApi.off("reInit", onInit)
      emblaApi.off("reInit", onSelect)
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, onInit, onSelect])

  return (
    <div className="relative">
      {/* Carousel viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {promotions.map((promotion) => {
            const discount = formatDiscount(promotion)

            return (
              <div
                key={promotion.id}
                className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_calc(50%-0.5rem)]"
              >
                <Card
                  className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
                  onClick={() => onPromotionClick(promotion)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      onPromotionClick(promotion)
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
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation buttons */}
      {promotions.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-background/95 shadow-lg backdrop-blur-sm transition-all hover:scale-110 disabled:opacity-0 sm:flex"
            onClick={scrollPrev}
            disabled={prevBtnDisabled}
            aria-label="Promoción anterior"
          >
            <IconChevronLeft className="size-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-background/95 shadow-lg backdrop-blur-sm transition-all hover:scale-110 disabled:opacity-0 sm:flex"
            onClick={scrollNext}
            disabled={nextBtnDisabled}
            aria-label="Siguiente promoción"
          >
            <IconChevronRight className="size-5" />
          </Button>
        </>
      )}

      {/* Dots indicators */}
      {promotions.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              className={`size-2 rounded-full transition-all ${
                index === selectedIndex
                  ? "bg-primary w-6"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              onClick={() => scrollTo(index)}
              aria-label={`Ir a promoción ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
