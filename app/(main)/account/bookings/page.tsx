import { redirect } from "next/navigation";
import { IconCalendarEvent } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import { getBookingsByUser } from "@/lib/queries/bookings";
import type { BookingWithRelations } from "@/lib/queries/bookings";
import { BookingCard } from "@/components/account/BookingCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = {
  title: "Mis apartados — Mercadito",
};

export default async function BookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: bookings } = await getBookingsByUser(user.id);
  const allBookings = (bookings ?? []) as BookingWithRelations[];

  const activeBookings = allBookings.filter(
    (b) => b.status === "pending" || b.status === "confirmed",
  );
  const pastBookings = allBookings.filter(
    (b) =>
      b.status === "completed" ||
      b.status === "cancelled" ||
      b.status === "no_show",
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Mis apartados</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Administra tus apartados activos y revisa tu historial
        </p>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Activas ({activeBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Historial ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 space-y-3">
          {activeBookings.length > 0 ? (
            activeBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          ) : (
            <EmptyState
              icon={IconCalendarEvent}
              title="No tienes apartados activos"
              description="Cuando hagas un apartado en un negocio, aparecera aqui"
              actionLabel="Explorar negocios"
              actionHref="/businesses"
            />
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4 space-y-3">
          {pastBookings.length > 0 ? (
            pastBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          ) : (
            <EmptyState
              icon={IconCalendarEvent}
              title="Sin historial"
              description="Tu historial de apartados completados aparecera aqui"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
