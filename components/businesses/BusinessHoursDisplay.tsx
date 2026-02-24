import { IconClock, IconCircleFilled } from "@tabler/icons-react"
import type { BusinessHours } from "@/lib/types/database"
import { DAYS_OF_WEEK } from "@/lib/constants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BusinessHoursDisplayProps {
  hours: BusinessHours[]
}

function getCurrentDayIndex(): number {
  return new Date().getDay()
}

function formatTime(time: string): string {
  const [h, m] = time.split(":")
  const hour = parseInt(h, 10)
  const suffix = hour >= 12 ? "PM" : "AM"
  const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${display}:${m} ${suffix}`
}

export function isCurrentlyOpen(hours: BusinessHours[]): boolean {
  const now = new Date()
  const todayEntry = hours.find((h) => h.day_of_week === now.getDay())
  if (!todayEntry || todayEntry.is_closed || !todayEntry.open_time || !todayEntry.close_time) {
    return false
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const [openH, openM] = todayEntry.open_time.split(":").map(Number)
  const [closeH, closeM] = todayEntry.close_time.split(":").map(Number)

  return currentMinutes >= openH * 60 + openM && currentMinutes < closeH * 60 + closeM
}

export function BusinessHoursDisplay({ hours }: BusinessHoursDisplayProps) {
  const currentDay = getCurrentDayIndex()
  const open = isCurrentlyOpen(hours)

  // Build a full 7-day array, filling in missing days
  const allDays = Array.from({ length: 7 }, (_, i) => {
    const entry = hours.find((h) => h.day_of_week === i)
    return {
      dayOfWeek: i,
      isClosed: entry?.is_closed ?? true,
      openTime: entry?.open_time ?? null,
      closeTime: entry?.close_time ?? null,
    }
  })

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <IconClock className="size-4" />
            Horarios
          </CardTitle>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
              open ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
            }`}
          >
            <IconCircleFilled className="size-2" />
            {open ? "Abierto ahora" : "Cerrado"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-0">
          {allDays.map((day) => {
            const isToday = day.dayOfWeek === currentDay

            return (
              <div
                key={day.dayOfWeek}
                className={`flex items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors ${
                  isToday
                    ? "bg-primary/8 font-medium text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <span className={isToday ? "font-semibold" : ""}>
                  {DAYS_OF_WEEK[day.dayOfWeek]}
                  {isToday && (
                    <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                      Hoy
                    </span>
                  )}
                </span>
                <span className={day.isClosed ? "italic" : ""}>
                  {day.isClosed
                    ? "Cerrado"
                    : `${formatTime(day.openTime!)} – ${formatTime(day.closeTime!)}`}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
