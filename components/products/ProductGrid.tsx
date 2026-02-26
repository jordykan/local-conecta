"use client"

import { useState } from "react"
import { IconPlus, IconAlertCircle } from "@tabler/icons-react"
import type { ProductService, BusinessHours, Business } from "@/lib/types/database"
import { ProductCard } from "./ProductCard"
import { ProductForm } from "./ProductForm"
import { ProductDetailsModal } from "./ProductDetailsModal"
import { BookingModal } from "@/components/bookings/BookingModal"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ProductGridProps {
  items: ProductService[]
  editable?: boolean
  businessId?: string
  businessHours?: Pick<BusinessHours, "day_of_week" | "open_time" | "close_time" | "is_closed">[]
  businessInfo?: Pick<Business, "id" | "name" | "phone" | "whatsapp">
  businessStatus?: "pending" | "active" | "suspended"
}

export function ProductGrid({ items, editable, businessId, businessHours, businessInfo, businessStatus }: ProductGridProps) {
  const [editingProduct, setEditingProduct] = useState<ProductService | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [bookingProduct, setBookingProduct] = useState<ProductService | null>(null)
  const [detailsProduct, setDetailsProduct] = useState<ProductService | null>(null)

  const products = items.filter((i) => i.type === "product")
  const services = items.filter((i) => i.type === "service")
  const isSuspended = businessStatus === "suspended"

  // Only show booking functionality when not in editable mode and businessId + hours are available
  const canBook = !editable && !!businessId && !!businessHours

  function renderGrid(list: ProductService[]) {
    if (list.length === 0) {
      return (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No hay elementos para mostrar
        </p>
      )
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((item) => (
          <ProductCard
            key={item.id}
            product={item}
            editable={editable && !isSuspended}
            onEdit={setEditingProduct}
            onBook={canBook ? setBookingProduct : undefined}
            businessInfo={businessInfo}
            onDetailsClick={setDetailsProduct}
          />
        ))}
      </div>
    )
  }

  return (
    <>
      {isSuspended && editable && (
        <Alert variant="destructive" className="mb-6">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>
            Tu negocio está suspendido. No puedes crear o editar productos y servicios.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all">
        <div className="flex items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">Todos ({items.length})</TabsTrigger>
            <TabsTrigger value="products">
              Productos ({products.length})
            </TabsTrigger>
            <TabsTrigger value="services">
              Servicios ({services.length})
            </TabsTrigger>
          </TabsList>

          {editable && businessId && (
            <Button
              onClick={() => setShowCreate(true)}
              size="lg"
              disabled={isSuspended}
            >
              <IconPlus className="mr-1.5 size-4" />
              Agregar
            </Button>
          )}
        </div>

        <TabsContent value="all" className="mt-6">
          {renderGrid(items)}
        </TabsContent>
        <TabsContent value="products" className="mt-6">
          {renderGrid(products)}
        </TabsContent>
        <TabsContent value="services" className="mt-6">
          {renderGrid(services)}
        </TabsContent>
      </Tabs>

      {/* Edit dialog */}
      {editable && businessId && (
        <>
          <ProductForm
            key={editingProduct?.id}
            businessId={businessId}
            product={editingProduct}
            open={!!editingProduct}
            onOpenChange={(open) => {
              if (!open) setEditingProduct(null)
            }}
          />

          <ProductForm
            businessId={businessId}
            open={showCreate}
            onOpenChange={setShowCreate}
          />
        </>
      )}

      {/* Booking modal */}
      {canBook && bookingProduct && (
        <BookingModal
          product={bookingProduct}
          businessId={businessId!}
          businessHours={businessHours!}
          open={!!bookingProduct}
          onOpenChange={(open) => {
            if (!open) setBookingProduct(null)
          }}
        />
      )}

      {/* Product details modal for non-bookable items */}
      {!editable && detailsProduct && businessInfo && (
        <ProductDetailsModal
          product={detailsProduct}
          business={businessInfo}
          open={!!detailsProduct}
          onOpenChange={(open) => {
            if (!open) setDetailsProduct(null)
          }}
        />
      )}
    </>
  )
}
