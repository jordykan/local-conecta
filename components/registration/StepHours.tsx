"use client"

import { Button } from "@/components/ui/button"
import { HoursForm } from "@/components/hours/HoursForm"
import type { BusinessHourEntry } from "@/lib/validations/business"

interface StepHoursProps {
  hours: BusinessHourEntry[]
  onNext: (hours: BusinessHourEntry[]) => void
  onBack: () => void
  onHoursChange: (hours: BusinessHourEntry[]) => void
}

export function StepHours({ hours, onNext, onBack, onHoursChange }: StepHoursProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onNext(hours)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Configura los dias y horas en que tu negocio atiende. Puedes
        modificarlos despues desde tu dashboard.
      </p>

      <HoursForm hours={hours} onChange={onHoursChange} />

      <div className="flex justify-between pt-2">
        <Button type="button" variant="ghost" onClick={onBack} className="h-11">
          Atras
        </Button>
        <Button type="submit" className="h-11 px-8">
          Siguiente
        </Button>
      </div>
    </form>
  )
}
