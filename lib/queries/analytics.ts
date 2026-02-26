import { createClient } from "@/lib/supabase/server"

export type AnalyticsPeriod = "week" | "month" | "all"

export type AnalyticsData = {
  totalViews: number
  totalBookings: number
  totalMessages: number
  viewsData: { date: string; count: number }[]
  bookingsData: { date: string; count: number }[]
  messagesData: { date: string; count: number }[]
}

/**
 * Obtiene las estadísticas analíticas de un negocio
 */
export async function getBusinessAnalytics(
  businessId: string,
  period: AnalyticsPeriod = "week"
): Promise<AnalyticsData | null> {
  const supabase = await createClient()
  const now = new Date()
  const startDate = getStartDate(period, now)

  // Obtener visitas totales y por día
  const { data: views } = await supabase
    .from("profile_views")
    .select("viewed_at")
    .eq("business_id", businessId)
    .gte("viewed_at", startDate.toISOString())
    .order("viewed_at", { ascending: true })

  // Obtener reservas totales y por día
  const { data: bookings } = await supabase
    .from("bookings")
    .select("created_at")
    .eq("business_id", businessId)
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: true })

  // Obtener mensajes totales y por día
  const { data: messages } = await supabase
    .from("messages")
    .select("created_at")
    .eq("business_id", businessId)
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: true })

  // Procesar datos para gráficas
  const viewsData = aggregateByDate(views ?? [], "viewed_at")
  const bookingsData = aggregateByDate(bookings ?? [], "created_at")
  const messagesData = aggregateByDate(messages ?? [], "created_at")

  return {
    totalViews: views?.length ?? 0,
    totalBookings: bookings?.length ?? 0,
    totalMessages: messages?.length ?? 0,
    viewsData,
    bookingsData,
    messagesData,
  }
}

/**
 * Registra una vista al perfil público de un negocio
 */
export async function trackProfileView(
  businessId: string,
  visitorId: string | null = null,
  ipAddress: string | null = null,
  userAgent: string | null = null
) {
  const supabase = await createClient()

  // Verificar si ya existe una vista reciente (último minuto)
  const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000).toISOString()

  const { data: recentView } = await supabase
    .from("profile_views")
    .select("id")
    .eq("business_id", businessId)
    .gte("viewed_at", oneMinuteAgo)
    .or(
      visitorId
        ? `visitor_id.eq.${visitorId}`
        : ipAddress
          ? `ip_address.eq.${ipAddress}`
          : "id.is.null"
    )
    .maybeSingle()

  // Si ya hay una vista reciente, no registrar duplicado
  if (recentView) {
    return { data: null, error: null }
  }

  // Registrar nueva vista
  return supabase.from("profile_views").insert({
    business_id: businessId,
    visitor_id: visitorId,
    ip_address: ipAddress,
    user_agent: userAgent,
  })
}

// Helpers

function getStartDate(period: AnalyticsPeriod, now: Date): Date {
  const date = new Date(now)
  switch (period) {
    case "week":
      date.setDate(date.getDate() - 7)
      break
    case "month":
      date.setMonth(date.getMonth() - 1)
      break
    case "all":
      date.setFullYear(2000) // Fecha muy antigua para incluir todo
      break
  }
  date.setHours(0, 0, 0, 0)
  return date
}

function aggregateByDate(
  items: Array<{ [key: string]: string }>,
  dateField: string
): Array<{ date: string; count: number }> {
  const countsByDate = new Map<string, number>()

  items.forEach((item) => {
    const dateStr = item[dateField]
    if (!dateStr) return

    const date = new Date(dateStr)
    const key = date.toISOString().split("T")[0] // YYYY-MM-DD

    countsByDate.set(key, (countsByDate.get(key) ?? 0) + 1)
  })

  return Array.from(countsByDate.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
