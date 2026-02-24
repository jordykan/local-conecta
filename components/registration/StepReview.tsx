"use client"

import { IconEdit } from "@tabler/icons-react"
import { DAYS_OF_WEEK } from "@/lib/constants"
import type { Category } from "@/lib/types/database"
import type { BusinessRegistrationData } from "@/lib/validations/business"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface StepReviewProps {
  data: BusinessRegistrationData
  categories: Category[]
  communityName: string
  onSubmit: () => void
  onEdit: (step: number) => void
  pending: boolean
}

function Section({
  title,
  step,
  onEdit,
  children,
}: {
  title: string
  step: number
  onEdit: (step: number) => void
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <IconEdit className="size-3.5" />
          Editar
        </button>
      </div>
      <div className="space-y-1 text-sm text-muted-foreground">{children}</div>
    </div>
  )
}

export function StepReview({
  data,
  categories,
  communityName,
  onSubmit,
  onEdit,
  pending,
}: StepReviewProps) {
  const category = categories.find((c) => c.id === data.categoryId)

  return (
    <div className="space-y-6">
      <Section title="Informacion del negocio" step={0} onEdit={onEdit}>
        <p className="font-medium text-foreground">{data.name}</p>
        <p>Categoria: {category?.name ?? "—"}</p>
        <p>Comunidad: {communityName}</p>
        {data.shortDescription && <p>{data.shortDescription}</p>}
      </Section>

      <Separator />

      <Section title="Contacto" step={1} onEdit={onEdit}>
        {data.phone && <p>Tel: {data.phone}</p>}
        {data.whatsapp && <p>WhatsApp: {data.whatsapp}</p>}
        {data.email && <p>Email: {data.email}</p>}
        {data.address && <p>Direccion: {data.address}</p>}
        {!data.phone && !data.whatsapp && !data.email && !data.address && (
          <p className="italic">Sin datos de contacto</p>
        )}
      </Section>

      <Separator />

      <Section title="Imagenes" step={2} onEdit={onEdit}>
        <div className="flex gap-4">
          {data.logoUrl ? (
            <img
              src={data.logoUrl}
              alt="Logo"
              className="size-16 rounded-lg object-cover"
            />
          ) : (
            <span className="italic">Sin logo</span>
          )}
          {data.coverUrl ? (
            <img
              src={data.coverUrl}
              alt="Portada"
              className="h-16 w-28 rounded-lg object-cover"
            />
          ) : (
            <span className="italic">Sin portada</span>
          )}
        </div>
      </Section>

      <Separator />

      <Section title="Horarios" step={3} onEdit={onEdit}>
        {data.hours.map((h) => {
          const day = DAYS_OF_WEEK[h.dayOfWeek] ?? `Dia ${h.dayOfWeek}`
          return (
            <p key={h.dayOfWeek}>
              {day}:{" "}
              {h.isClosed ? (
                <span className="italic">Cerrado</span>
              ) : (
                `${h.openTime || "09:00"} - ${h.closeTime || "18:00"}`
              )}
            </p>
          )
        })}
      </Section>

      <Separator />

      <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
        Tu negocio sera enviado a revision. Una vez aprobado, aparecera en el
        directorio de tu comunidad.
      </div>

      <div className="flex justify-between pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => onEdit(3)}
          className="h-11"
        >
          Atras
        </Button>
        <Button
          onClick={onSubmit}
          disabled={pending}
          className="h-11 px-8 font-semibold shadow-lg shadow-primary/20"
        >
          {pending ? (
            <span className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              Registrando...
            </span>
          ) : (
            "Registrar negocio"
          )}
        </Button>
      </div>
    </div>
  )
}
