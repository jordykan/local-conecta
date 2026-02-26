import { IconEye, IconCalendar, IconMessages } from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type StatsCardProps = {
  title: string
  value: number
  icon: "views" | "bookings" | "messages"
  description?: string
}

const iconMap = {
  views: IconEye,
  bookings: IconCalendar,
  messages: IconMessages,
}

export function StatsCard({
  title,
  value,
  icon,
  description,
}: StatsCardProps) {
  const Icon = iconMap[icon]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString("es-ES")}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
