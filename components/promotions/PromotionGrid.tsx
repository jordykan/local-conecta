"use client"

import { useState } from "react"
import { IconPlus } from "@tabler/icons-react"
import type { Promotion } from "@/lib/types/database"
import { PromotionCard } from "./PromotionCard"
import { PromotionForm } from "./PromotionForm"
import { Button } from "@/components/ui/button"

interface PromotionGridProps {
  items: Promotion[]
  businessId: string
}

export function PromotionGrid({ items, businessId }: PromotionGridProps) {
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null,
  )
  const [showCreate, setShowCreate] = useState(false)

  const activePromotions = items.filter((p) => p.is_active && (!p.ends_at || new Date(p.ends_at) > new Date()))
  const inactivePromotions = items.filter((p) => !p.is_active || (p.ends_at && new Date(p.ends_at) <= new Date()))

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Promociones activas</h2>
          <p className="text-sm text-muted-foreground">
            {activePromotions.length} promoción(es) activa(s)
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} size="lg">
          <IconPlus className="mr-1.5 size-4" />
          Nueva promoción
        </Button>
      </div>

      {/* Active promotions */}
      {activePromotions.length > 0 ? (
        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activePromotions.map((promotion) => (
            <PromotionCard
              key={promotion.id}
              promotion={promotion}
              onEdit={setEditingPromotion}
            />
          ))}
        </div>
      ) : (
        <div className="mb-12 rounded-lg border border-dashed border-border/50 bg-muted/30 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No tienes promociones activas
          </p>
          <Button
            variant="link"
            onClick={() => setShowCreate(true)}
            className="mt-2"
          >
            Crear primera promoción
          </Button>
        </div>
      )}

      {/* Inactive/expired promotions */}
      {inactivePromotions.length > 0 && (
        <>
          <div className="mb-4">
            <h3 className="text-base font-medium text-muted-foreground">
              Promociones inactivas o expiradas
            </h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inactivePromotions.map((promotion) => (
              <PromotionCard
                key={promotion.id}
                promotion={promotion}
                onEdit={setEditingPromotion}
              />
            ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-border/50 bg-muted/30">
          <IconPlus className="mb-4 size-12 text-muted-foreground/30" />
          <h3 className="mb-2 text-lg font-semibold">
            Aún no tienes promociones
          </h3>
          <p className="mb-4 max-w-sm text-center text-sm text-muted-foreground">
            Crea tu primera promoción para atraer más clientes a tu negocio
          </p>
          <Button onClick={() => setShowCreate(true)} size="lg">
            <IconPlus className="mr-1.5 size-4" />
            Crear promoción
          </Button>
        </div>
      )}

      {/* Edit dialog */}
      <PromotionForm
        key={editingPromotion?.id}
        businessId={businessId}
        promotion={editingPromotion}
        open={!!editingPromotion}
        onOpenChange={(open) => {
          if (!open) setEditingPromotion(null)
        }}
      />

      {/* Create dialog */}
      <PromotionForm
        businessId={businessId}
        open={showCreate}
        onOpenChange={setShowCreate}
      />
    </>
  )
}
