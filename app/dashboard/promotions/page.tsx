import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getBusinessByOwner } from "@/lib/queries/business"
import { getPromotionsByBusiness } from "@/lib/queries/promotions"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { PromotionGrid } from "@/components/promotions/PromotionGrid"

export default async function PromotionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: businesses } = await getBusinessByOwner(user.id)
  const business = businesses?.[0]
  if (!business) redirect("/register-business")

  const { data: promotions } = await getPromotionsByBusiness(business.id)

  return (
    <DashboardShell description="Crea y administra promociones especiales para atraer clientes">
      <PromotionGrid items={promotions ?? []} businessId={business.id} />
    </DashboardShell>
  )
}
