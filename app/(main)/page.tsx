import { HeroSection } from "@/components/landing/HeroSection"
import { CategoriesSection } from "@/components/landing/CategoriesSection"
import { FeaturedBusinessesSection } from "@/components/landing/FeaturedBusinessesSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { BusinessCTASection } from "@/components/landing/BusinessCTASection"
import { getBusinessesDirectory } from "@/lib/queries/business"

export default async function HomePage() {
  // Get all businesses (already sorted by is_featured first, then created_at)
  const { data: allBusinesses } = await getBusinessesDirectory({})

  // Take first 8 businesses (featured will appear first)
  const featured = (allBusinesses ?? []).slice(0, 8)

  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturedBusinessesSection businesses={featured} />
      <HowItWorksSection />
      <BusinessCTASection />
    </>
  )
}
