import { HeroSection } from "@/components/landing/HeroSection"
import { CategoriesSection } from "@/components/landing/CategoriesSection"
import { FeaturedBusinessesSection } from "@/components/landing/FeaturedBusinessesSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { BusinessCTASection } from "@/components/landing/BusinessCTASection"
import { getBusinessesDirectory } from "@/lib/queries/business"

export default async function HomePage() {
  const { data: businesses } = await getBusinessesDirectory({})

  // Take first 8 for the featured section
  const featured = (businesses ?? []).slice(0, 8)

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
