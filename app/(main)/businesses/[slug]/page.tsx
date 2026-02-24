import { notFound } from "next/navigation"
import { IconPackage } from "@tabler/icons-react"
import type { Metadata } from "next"
import { getBusinessBySlug } from "@/lib/queries/business"
import { BusinessProfile } from "@/components/businesses/BusinessProfile"
import {
  BusinessHoursDisplay,
  isCurrentlyOpen,
} from "@/components/businesses/BusinessHoursDisplay"
import { BusinessContactCard } from "@/components/businesses/BusinessContactCard"
import { ProductGrid } from "@/components/products/ProductGrid"
import { ContactBusinessButton } from "@/components/businesses/ContactBusinessButton"
import { EmptyState } from "@/components/shared/EmptyState"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const { data: business } = await getBusinessBySlug(slug)

  if (!business) {
    return { title: "Negocio no encontrado — Local Conecta" }
  }

  return {
    title: `${business.name} — Local Conecta`,
    description:
      business.short_description ||
      business.description ||
      `Conoce ${business.name} en Local Conecta`,
  }
}

export default async function BusinessPage({ params }: PageProps) {
  const { slug } = await params
  const { data: business } = await getBusinessBySlug(slug)

  if (!business) notFound()

  const hours = business.business_hours ?? []
  const products = (business.products_services ?? []).filter(
    (p) => p.is_available
  )
  const isOpen = isCurrentlyOpen(hours)

  return (
    <div className="pb-16">
      {/* Hero with CTAs */}
      <BusinessProfile business={business} isOpen={isOpen} />

      {/* Content */}
      <div className="mx-auto mt-8 max-w-5xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main: Products/Services */}
          <section>
            <h2 className="mb-4 text-lg font-semibold tracking-tight">
              Productos y servicios
            </h2>
            {products.length > 0 ? (
              <ProductGrid
                items={products}
                businessId={business.id}
                businessHours={hours}
              />
            ) : (
              <EmptyState
                icon={IconPackage}
                title="Sin productos disponibles"
                description="Este negocio aun no ha publicado productos o servicios."
              />
            )}
          </section>

          {/* Sidebar: Contact + Hours */}
          <aside className="space-y-5">
            <ContactBusinessButton
              businessId={business.id}
              businessName={business.name}
            />
            <BusinessContactCard business={business} />
            {hours.length > 0 && <BusinessHoursDisplay hours={hours} />}
          </aside>
        </div>
      </div>
    </div>
  )
}
