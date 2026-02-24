import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getBusinessByOwner, getProductsByBusiness } from "@/lib/queries/business"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { ProductGrid } from "@/components/products/ProductGrid"

export default async function ProductsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: businesses } = await getBusinessByOwner(user.id)
  const business = businesses?.[0]
  if (!business) redirect("/register-business")

  const { data: products } = await getProductsByBusiness(business.id)

  return (
    <DashboardShell description="Administra lo que ofreces a tu comunidad">
      <ProductGrid
        items={products ?? []}
        editable
        businessId={business.id}
      />
    </DashboardShell>
  )
}
