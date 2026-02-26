import Link from "next/link"
import { HeroSection } from "@/components/landing/HeroSection"
import { CategoriesSection } from "@/components/landing/CategoriesSection"
import { FeaturedBusinessesSection } from "@/components/landing/FeaturedBusinessesSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { BusinessCTASection } from "@/components/landing/BusinessCTASection"
import { getBusinessesDirectory } from "@/lib/queries/business"
import { IconBell } from "@tabler/icons-react"

export default async function HomePage() {
  // Get all businesses (already sorted by is_featured first, then created_at)
  const { data: allBusinesses } = await getBusinessesDirectory({})

  // Take first 8 businesses (featured will appear first)
  const featured = (allBusinesses ?? []).slice(0, 8)

  return (
    <>
      {/* Banner temporal para pruebas de notificaciones */}
      <div className="bg-orange-100 dark:bg-orange-950 border-b border-orange-200 dark:border-orange-900">
        <div className="container mx-auto px-4 py-3">
          <Link
            href="/test-notifications"
            className="flex items-center gap-2 text-sm text-orange-900 dark:text-orange-100 hover:underline"
          >
            <IconBell className="h-4 w-4" />
            <span className="font-medium">Prueba notificaciones push →</span>
          </Link>
        </div>
      </div>

      <HeroSection />
      <CategoriesSection />
      <FeaturedBusinessesSection businesses={featured} />
      <HowItWorksSection />
      <BusinessCTASection />
    </>
  )
}
