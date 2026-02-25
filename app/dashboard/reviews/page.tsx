import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getBusinessByOwner } from "@/lib/queries/business"
import { getReviewsByBusiness } from "@/lib/queries/reviews"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { ReviewsList } from "@/components/dashboard/ReviewsList"

export default async function ReviewsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: businesses } = await getBusinessByOwner(user.id)
  const business = businesses?.[0]
  if (!business) redirect("/register-business")

  const { data: reviews } = await getReviewsByBusiness(business.id)

  return (
    <DashboardShell description="Gestiona las reseñas de tus clientes y responde a sus comentarios">
      <ReviewsList reviews={reviews ?? []} businessId={business.id} />
    </DashboardShell>
  )
}
