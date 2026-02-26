"use client"

import { DAYS_OF_WEEK } from "@/lib/constants"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { BusinessHourEntry } from "@/lib/validations/business"

interface HoursFormProps {
  hours: BusinessHourEntry[]
  onChange: (hours: BusinessHourEntry[]) => void
  disabled?: boolean
}

const DEFAULT_OPEN = "09:00"
const DEFAULT_CLOSE = "18:00"

export function HoursForm({ hours, onChange, disabled = false }: HoursFormProps) {
  function updateDay(dayOfWeek: number, update: Partial<BusinessHourEntry>) {
    onChange(
      hours.map((h) =>
        h.dayOfWeek === dayOfWeek ? { ...h, ...update } : h
      )
    )
  }

  return (
    <div className="space-y-3">
      {hours.map((h) => {
        const dayName = DAYS_OF_WEEK[h.dayOfWeek] ?? `Dia ${h.dayOfWeek}`

        return (
          <div
            key={h.dayOfWeek}
            className={`flex flex-col gap-3 rounded-lg border border-border/50 p-4 sm:flex-row sm:items-center sm:gap-4 ${h.isClosed ? "bg-muted/30" : ""}`}
          >
            <div className="flex items-center justify-between sm:w-36">
              <div className="flex items-center gap-2.5">
                <div className={`size-2 rounded-full ${h.isClosed ? "bg-muted-foreground/30" : "bg-emerald-500"}`} />
                <span className="text-sm font-medium">{dayName}</span>
              </div>
              <div className="flex items-center gap-2 sm:hidden">
                <Label htmlFor={`closed-${h.dayOfWeek}`} className="text-xs text-muted-foreground">
                  Cerrado
                </Label>
                <Switch
                  id={`closed-${h.dayOfWeek}`}
                  checked={h.isClosed}
                  onCheckedChange={(checked) =>
                    updateDay(h.dayOfWeek, { isClosed: checked })
                  }
                  disabled={disabled}
                />
              </div>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <Switch
                id={`closed-desk-${h.dayOfWeek}`}
                checked={h.isClosed}
                onCheckedChange={(checked) =>
                  updateDay(h.dayOfWeek, { isClosed: checked })
                }
                disabled={disabled}
              />
              <Label
                htmlFor={`closed-desk-${h.dayOfWeek}`}
                className="text-xs text-muted-foreground"
              >
                Cerrado
              </Label>
            </div>

            {!h.isClosed && (
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={h.openTime || DEFAULT_OPEN}
                  onChange={(e) =>
                    updateDay(h.dayOfWeek, { openTime: e.target.value })
                  }
                  className="h-10 w-[130px] text-sm"
                  disabled={disabled}
                />
                <span className="text-sm text-muted-foreground">a</span>
                <Input
                  type="time"
                  value={h.closeTime || DEFAULT_CLOSE}
                  onChange={(e) =>
                    updateDay(h.dayOfWeek, { closeTime: e.target.value })
                  }
                  disabled={disabled}
                  className="h-10 w-[130px] text-sm"
                />
              </div>
            )}

            {h.isClosed && (
              <span className="text-sm text-muted-foreground italic">
                No abre este dia
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
