"use client"

import { useState, useEffect, useTransition } from "react"
import { toast } from "sonner"
import { IconAlertCircle } from "@tabler/icons-react"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { HoursForm } from "@/components/hours/HoursForm"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { updateBusinessHours } from "./actions"
import type { BusinessHourEntry } from "@/lib/validations/business"
import type { BusinessHours } from "@/lib/types/database"

// This is a client page that receives data from the layout context.
// For MVP simplicity, we fetch directly in the client.
import { createClient } from "@/lib/supabase/client"

function buildDefaultHours(): BusinessHourEntry[] {
  return Array.from({ length: 7 }, (_, i) => ({
    dayOfWeek: i,
    openTime: "09:00",
    closeTime: "18:00",
    isClosed: i === 0,
  }))
}

function toFormHours(dbHours: BusinessHours[]): BusinessHourEntry[] {
  const defaults = buildDefaultHours()
  return defaults.map((d) => {
    const existing = dbHours.find((h) => h.day_of_week === d.dayOfWeek)
    if (existing) {
      return {
        dayOfWeek: existing.day_of_week,
        openTime: existing.open_time ?? "09:00",
        closeTime: existing.close_time ?? "18:00",
        isClosed: existing.is_closed,
      }
    }
    return d
  })
}

export default function HoursPage() {
  const [hours, setHours] = useState<BusinessHourEntry[]>(buildDefaultHours)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [businessStatus, setBusinessStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: businesses } = await supabase
        .from("businesses")
        .select("id, status")
        .eq("owner_id", user.id)
        .limit(1)

      const biz = businesses?.[0]
      if (!biz) return

      setBusinessId(biz.id)
      setBusinessStatus(biz.status)

      const { data: dbHours } = await supabase
        .from("business_hours")
        .select("*")
        .eq("business_id", biz.id)
        .order("day_of_week")

      if (dbHours && dbHours.length > 0) {
        setHours(toFormHours(dbHours))
      }
      setLoading(false)
    }

    loadData()
  }, [])

  function handleSave() {
    if (!businessId) return

    startTransition(async () => {
      const result = await updateBusinessHours(businessId, hours)
      if (result?.error) {
        toast.error("Error al guardar horarios", {
          description: result.error
        })
      } else {
        toast.success("Horarios guardados", {
          description: "Tus horarios han sido actualizados correctamente"
        })
      }
    })
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-16">
          <div className="size-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        </div>
      </DashboardShell>
    )
  }

  const isSuspended = businessStatus === "suspended"

  return (
    <DashboardShell
      description="Configura tus dias y horas de servicio"
      action={
        <Button
          size="lg"
          onClick={handleSave}
          disabled={pending || isSuspended}
          className="px-6"
        >
          {pending ? "Guardando..." : "Guardar horarios"}
        </Button>
      }
    >
      {isSuspended && (
        <Alert variant="destructive" className="mb-6">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>
            Tu negocio está suspendido. No puedes modificar los horarios.
          </AlertDescription>
        </Alert>
      )}
      <HoursForm hours={hours} onChange={setHours} disabled={isSuspended} />
    </DashboardShell>
  )
}
