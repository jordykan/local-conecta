import { notFound } from "next/navigation";
import { IconPackage } from "@tabler/icons-react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getBusinessBySlug } from "@/lib/queries/business";
import {
  getReviewsByBusiness,
  getAverageRating,
  countReviews,
  canUserReview,
} from "@/lib/queries/reviews";
import { isFavorited } from "@/lib/queries/favorites";
import { BusinessProfile } from "@/components/businesses/BusinessProfile";
import {
  BusinessHoursDisplay,
  isCurrentlyOpen,
} from "@/components/businesses/BusinessHoursDisplay";
import { BusinessContactCard } from "@/components/businesses/BusinessContactCard";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ContactBusinessButton } from "@/components/businesses/ContactBusinessButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { PromotionsSection } from "@/components/businesses/PromotionsSection";
import { ReviewsSection } from "@/components/businesses/ReviewsSection";
import { ProfileViewTracker } from "@/components/businesses/ProfileViewTracker";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: business } = await getBusinessBySlug(slug);

  if (!business) {
    return { title: "Negocio no encontrado — Mercadito" };
  }

  return {
    title: `${business.name} — Mercadito`,
    description:
      business.short_description ||
      business.description ||
      `Conoce ${business.name} en Mercadito`,
  };
}

export default async function BusinessPage({ params }: PageProps) {
  const { slug } = await params;

  // Start both fetches in parallel (async-parallel rule)
  const supabase = await createClient();
  const [
    { data: business },
    {
      data: { user },
    },
  ] = await Promise.all([getBusinessBySlug(slug), supabase.auth.getUser()]);

  if (!business) notFound();

  const hours = business.business_hours ?? [];
  const products = (business.products_services ?? []).filter(
    (p) => p.is_available,
  );
  const promotions = business.promotions ?? [];
  const isOpen = isCurrentlyOpen(hours);

  const businessInfo = {
    id: business.id,
    name: business.name,
    phone: business.phone,
    whatsapp: business.whatsapp,
  };

  const [
    { data: reviews },
    averageRating,
    totalReviews,
    userCanReview,
    userReviewData,
    userFavorited,
  ] = await Promise.all([
    getReviewsByBusiness(business.id),
    getAverageRating(business.id),
    countReviews(business.id),
    user
      ? canUserReview(user.id, business.id)
      : Promise.resolve({ canReview: false }),
    user
      ? supabase
          .from("reviews")
          .select("*")
          .eq("user_id", user.id)
          .eq("business_id", business.id)
          .single()
      : Promise.resolve({ data: null }),
    user ? isFavorited(user.id, business.id) : Promise.resolve(false),
  ]);

  return (
    <div className="pb-16">
      {/* Track profile view */}
      <ProfileViewTracker businessId={business.id} />

      {/* Hero with CTAs */}
      <BusinessProfile
        business={business}
        isOpen={isOpen}
        isFavorited={userFavorited}
      />

      {/* Content */}
      <div className="mx-auto mt-8 max-w-5xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main: Promotions + Products/Services */}
          <div>
            {/* Promotions */}
            {promotions.length > 0 && (
              <PromotionsSection
                promotions={promotions}
                businessInfo={businessInfo}
              />
            )}

            {/* Products/Services */}
            <section className="mb-8">
              <h2 className="mb-4 text-lg font-semibold tracking-tight">
                Productos y servicios
              </h2>
              {products.length > 0 ? (
                <ProductGrid
                  items={products}
                  businessId={business.id}
                  businessHours={hours}
                  businessInfo={businessInfo}
                />
              ) : (
                <EmptyState
                  icon={IconPackage}
                  title="Sin productos disponibles"
                  description="Este negocio aun no ha publicado productos o servicios."
                />
              )}
            </section>

            {/* Reviews */}
            <ReviewsSection
              reviews={reviews ?? []}
              business={{
                id: business.id,
                name: business.name,
                slug: business.slug,
              }}
              averageRating={averageRating}
              totalReviews={totalReviews}
              canUserReview={userCanReview.canReview}
              userReview={userReviewData.data}
            />
          </div>

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
  );
}
