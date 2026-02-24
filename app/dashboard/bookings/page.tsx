import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getBusinessByOwner } from "@/lib/queries/business"
import { getBookingsByBusiness } from "@/lib/queries/bookings"
import type { BookingWithClient } from "@/lib/queries/bookings"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { BookingsList } from "@/components/dashboard/BookingsList"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function DashboardBookingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: businesses } = await getBusinessByOwner(user.id)
  const business = businesses?.[0]
  if (!business) redirect("/register-business")

  const { data: rawBookings } = await getBookingsByBusiness(business.id)
  const bookings = (rawBookings ?? []) as BookingWithClient[]

  const pending = bookings.filter((b) => b.status === "pending")
  const confirmed = bookings.filter((b) => b.status === "confirmed")
  const history = bookings.filter((b) =>
    ["completed", "cancelled", "no_show"].includes(b.status)
  )

  return (
    <DashboardShell description="Gestiona las reservas de tus clientes">
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pendientes ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Confirmadas ({confirmed.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            Historial ({history.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <BookingsList bookings={pending} businessId={business.id} />
        </TabsContent>
        <TabsContent value="confirmed" className="mt-6">
          <BookingsList bookings={confirmed} businessId={business.id} />
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <BookingsList bookings={history} businessId={business.id} />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
