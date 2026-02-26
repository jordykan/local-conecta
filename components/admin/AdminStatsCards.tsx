import { IconBuilding, IconUsers, IconCalendar, IconStar, IconAlertCircle, IconCheck, IconTrendingUp } from "@tabler/icons-react"
import { Card, CardContent } from "@/components/ui/card"

type AdminStatsCardsProps = {
  stats: {
    totalBusinesses: number
    pendingBusinesses: number
    activeBusinesses: number
    totalUsers: number
    totalBookings: number
    totalReviews: number
  }
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  const cards = [
    {
      title: "Total Negocios",
      value: stats.totalBusinesses,
      icon: IconBuilding,
      color: "blue",
      description: "Registrados en total",
    },
    {
      title: "Pendientes",
      value: stats.pendingBusinesses,
      icon: IconAlertCircle,
      color: "orange",
      description: "Esperando aprobación",
      highlight: stats.pendingBusinesses > 0,
    },
    {
      title: "Activos",
      value: stats.activeBusinesses,
      icon: IconCheck,
      color: "green",
      description: "Negocios aprobados",
    },
    {
      title: "Usuarios",
      value: stats.totalUsers,
      icon: IconUsers,
      color: "purple",
      description: "Usuarios registrados",
    },
    {
      title: "Reservas",
      value: stats.totalBookings,
      icon: IconCalendar,
      color: "indigo",
      description: "Reservas realizadas",
    },
    {
      title: "Reseñas",
      value: stats.totalReviews,
      icon: IconStar,
      color: "amber",
      description: "Reseñas publicadas",
    },
  ]

  const colorMap = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-950/30",
      icon: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-950/30",
      icon: "text-orange-600 dark:text-orange-400",
      border: "border-orange-200 dark:border-orange-800",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-950/30",
      icon: "text-green-600 dark:text-green-400",
      border: "border-green-200 dark:border-green-800",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-950/30",
      icon: "text-purple-600 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-800",
    },
    indigo: {
      bg: "bg-indigo-50 dark:bg-indigo-950/30",
      icon: "text-indigo-600 dark:text-indigo-400",
      border: "border-indigo-200 dark:border-indigo-800",
    },
    amber: {
      bg: "bg-amber-50 dark:bg-amber-950/30",
      icon: "text-amber-600 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800",
    },
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        const colors = colorMap[card.color as keyof typeof colorMap]

        return (
          <Card
            key={card.title}
            className={`overflow-hidden transition-all hover:shadow-md ${
              card.highlight ? "ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-background" : ""
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold tracking-tight">{card.value}</h3>
                    {card.highlight && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400">
                        <IconTrendingUp className="h-3 w-3" />
                        Requiere atención
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
                </div>
                <div className={`rounded-xl ${colors.bg} p-3 border ${colors.border}`}>
                  <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
