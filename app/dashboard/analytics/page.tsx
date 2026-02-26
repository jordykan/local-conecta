import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getBusinessByOwner } from "@/lib/queries/business"
import { getBusinessAnalytics, type AnalyticsPeriod } from "@/lib/queries/analytics"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart"
import { TrendChart } from "@/components/dashboard/TrendChart"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type SearchParams = Promise<{
  period?: string
}>

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Obtener el negocio del usuario
  const { data: businesses } = await getBusinessByOwner(user.id)
  const business = businesses?.[0]

  if (!business) {
    redirect("/register-business")
  }

  // Obtener el periodo seleccionado
  const params = await searchParams
  const period = (params.period ?? "week") as AnalyticsPeriod

  // Obtener analytics
  const analytics = await getBusinessAnalytics(business.id, period)

  if (!analytics) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Analíticas</h1>
        <p className="text-muted-foreground mt-2">
          Error al cargar las analíticas
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Analíticas</h1>
        <p className="text-muted-foreground mt-1">
          Estadísticas de rendimiento de tu negocio
        </p>
      </div>

      {/* Period Selector */}
      <Tabs defaultValue={period} className="w-full">
        <TabsList>
          <TabsTrigger value="week" asChild>
            <a href="?period=week">Última semana</a>
          </TabsTrigger>
          <TabsTrigger value="month" asChild>
            <a href="?period=month">Último mes</a>
          </TabsTrigger>
          <TabsTrigger value="all" asChild>
            <a href="?period=all">Todo</a>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={period} className="space-y-6 mt-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <StatsCard
              title="Visitas al perfil"
              value={analytics.totalViews}
              icon="views"
              description="Número de veces que visitaron tu perfil"
            />
            <StatsCard
              title="Reservas"
              value={analytics.totalBookings}
              icon="bookings"
              description="Total de reservas recibidas"
            />
            <StatsCard
              title="Mensajes"
              value={analytics.totalMessages}
              icon="messages"
              description="Mensajes de clientes recibidos"
            />
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Views Chart */}
            <AnalyticsChart
              data={analytics.viewsData}
              title="Visitas por día"
              description="Número de visitas a tu perfil público"
              color="oklch(0.65 0.19 35)"
              dataKey="visitas"
            />

            {/* Bookings Chart */}
            <AnalyticsChart
              data={analytics.bookingsData}
              title="Reservas por día"
              description="Reservas recibidas en este periodo"
              color="oklch(0.60 0.15 145)"
              dataKey="reservas"
            />

            {/* Messages Chart */}
            <AnalyticsChart
              data={analytics.messagesData}
              title="Mensajes por día"
              description="Mensajes de clientes recibidos"
              color="oklch(0.60 0.18 260)"
              dataKey="mensajes"
            />

            {/* Trend Chart */}
            <TrendChart
              viewsData={analytics.viewsData}
              bookingsData={analytics.bookingsData}
              messagesData={analytics.messagesData}
            />
          </div>

          {/* Summary Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen del periodo</CardTitle>
              <CardDescription>
                Estadísticas clave y métricas calculadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Total de interacciones
                  </p>
                  <p className="text-2xl font-bold">
                    {(
                      analytics.totalViews +
                      analytics.totalBookings +
                      analytics.totalMessages
                    ).toLocaleString("es-ES")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Tasa de conversión
                  </p>
                  <p className="text-2xl font-bold">
                    {analytics.totalViews > 0
                      ? (
                          (analytics.totalBookings / analytics.totalViews) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </p>
                  <p className="text-xs text-muted-foreground">
                    De visitas a reservas
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Engagement promedio
                  </p>
                  <p className="text-2xl font-bold">
                    {analytics.totalBookings > 0
                      ? (
                          analytics.totalMessages / analytics.totalBookings
                        ).toFixed(1)
                      : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mensajes por reserva
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
