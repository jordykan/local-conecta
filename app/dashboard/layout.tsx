import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getBusinessByOwner } from "@/lib/queries/business"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import type { DashboardUser, DashboardBusiness } from "@/components/dashboard/types"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const [{ data: businesses }, { data: profile }] = await Promise.all([
    getBusinessByOwner(user.id),
    supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .single(),
  ])

  const business = businesses?.[0]
  if (!business) redirect("/register-business")

  const dashboardUser: DashboardUser = {
    id: user.id,
    email: user.email ?? "",
    fullName: profile?.full_name ?? "",
    avatarUrl: profile?.avatar_url ?? null,
  }

  const dashboardBusiness: DashboardBusiness = {
    id: business.id,
    name: business.name,
    slug: business.slug,
    status: business.status as DashboardBusiness["status"],
    logo_url: business.logo_url,
    cover_url: business.cover_url,
    description: business.description,
    short_description: business.short_description,
    phone: business.phone,
    whatsapp: business.whatsapp,
    email: business.email,
    address: business.address,
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar business={dashboardBusiness} user={dashboardUser} />
      <div className="flex flex-1 flex-col lg:pl-64">
        <DashboardHeader business={dashboardBusiness} user={dashboardUser} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
