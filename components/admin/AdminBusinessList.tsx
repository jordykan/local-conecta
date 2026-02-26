"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  IconCheck,
  IconX,
  IconEye,
  IconStar,
  IconStarFilled,
  IconBuilding,
  IconPhone,
  IconMail,
  IconMapPin,
} from "@tabler/icons-react"
import { approveBusiness, suspendBusiness, rejectBusiness, toggleFeaturedBusiness } from "@/app/admin/businesses/actions"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { toast } from "sonner"
import Image from "next/image"

type Business = {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  logo_url: string | null
  phone: string | null
  email: string | null
  address: string | null
  status: string
  is_featured: boolean
  created_at: string
  category: {
    name: string
    slug: string
  } | null
  owner: {
    id: string
    full_name: string
    phone: string | null
  } | null
}

type AdminBusinessListProps = {
  businesses: Business[]
  status: "pending" | "active" | "suspended"
}

export function AdminBusinessList({ businesses, status }: AdminBusinessListProps) {
  const [isPending, startTransition] = useTransition()
  const [actioningId, setActioningId] = useState<string | null>(null)

  const handleApprove = (businessId: string) => {
    setActioningId(businessId)
    startTransition(async () => {
      const result = await approveBusiness(businessId)
      if (result.success) {
        toast.success("Negocio aprobado exitosamente")
      } else {
        toast.error(result.error ?? "Error al aprobar el negocio")
      }
      setActioningId(null)
    })
  }

  const handleReject = (businessId: string) => {
    setActioningId(businessId)
    startTransition(async () => {
      const result = await rejectBusiness(businessId)
      if (result.success) {
        toast.success("Negocio rechazado")
      } else {
        toast.error(result.error ?? "Error al rechazar el negocio")
      }
      setActioningId(null)
    })
  }

  const handleSuspend = (businessId: string) => {
    setActioningId(businessId)
    startTransition(async () => {
      const result = await suspendBusiness(businessId)
      if (result.success) {
        toast.success("Negocio suspendido")
      } else {
        toast.error(result.error ?? "Error al suspender el negocio")
      }
      setActioningId(null)
    })
  }

  const handleToggleFeatured = (businessId: string, currentFeatured: boolean) => {
    setActioningId(businessId)
    startTransition(async () => {
      const result = await toggleFeaturedBusiness(businessId, !currentFeatured)
      if (result.success) {
        toast.success(currentFeatured ? "Negocio removido de destacados" : "Negocio marcado como destacado")
      } else {
        toast.error(result.error ?? "Error al actualizar el negocio")
      }
      setActioningId(null)
    })
  }

  if (businesses.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-4">
            <IconBuilding className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="mt-4 text-lg font-semibold">No hay negocios en esta categoría</p>
          <p className="text-sm text-muted-foreground">Los negocios aparecerán aquí cuando cambien de estado</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {businesses.map((business) => (
        <Card key={business.id} className="overflow-hidden transition-all hover:shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              {business.logo_url ? (
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 border-muted">
                  <Image src={business.logo_url} alt={business.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-muted bg-muted/50">
                  <IconBuilding className="h-9 w-9 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-xl">{business.name}</CardTitle>
                      {business.is_featured && (
                        <Badge className="gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                          <IconStarFilled className="h-3 w-3" />
                          Destacado
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      <span>{business.category?.name}</span>
                      <span className="text-muted-foreground/50">•</span>
                      <span className="text-xs">
                        {format(new Date(business.created_at), "d MMM yyyy", { locale: es })}
                      </span>
                    </CardDescription>
                  </div>
                </div>
                {business.short_description && (
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{business.short_description}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                  {business.phone && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <IconPhone className="h-4 w-4" />
                      <span>{business.phone}</span>
                    </div>
                  )}
                  {business.email && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <IconMail className="h-4 w-4" />
                      <span className="truncate">{business.email}</span>
                    </div>
                  )}
                  {business.address && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <IconMapPin className="h-4 w-4" />
                      <span className="truncate">{business.address}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Propietario:</span>{" "}
                  <span className="font-medium">{business.owner?.full_name}</span>
                  {business.owner?.phone && (
                    <span className="text-muted-foreground"> • {business.owner.phone}</span>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/businesses/${business.slug}`} target="_blank">
                  <IconEye className="mr-2 h-4 w-4" />
                  Ver perfil
                </Link>
              </Button>

              {status === "pending" && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(business.id)}
                    disabled={isPending && actioningId === business.id}
                  >
                    <IconCheck className="mr-2 h-4 w-4" />
                    Aprobar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleReject(business.id)}
                    disabled={isPending && actioningId === business.id}
                  >
                    <IconX className="mr-2 h-4 w-4" />
                    Rechazar
                  </Button>
                </>
              )}

              {status === "active" && (
                <>
                  <Button
                    variant={business.is_featured ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => handleToggleFeatured(business.id, business.is_featured)}
                    disabled={isPending && actioningId === business.id}
                  >
                    {business.is_featured ? (
                      <>
                        <IconStarFilled className="mr-2 h-4 w-4" />
                        Quitar destacado
                      </>
                    ) : (
                      <>
                        <IconStar className="mr-2 h-4 w-4" />
                        Destacar
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleSuspend(business.id)}
                    disabled={isPending && actioningId === business.id}
                  >
                    <IconX className="mr-2 h-4 w-4" />
                    Suspender
                  </Button>
                </>
              )}

              {status === "suspended" && (
                <Button
                  size="sm"
                  onClick={() => handleApprove(business.id)}
                  disabled={isPending && actioningId === business.id}
                >
                  <IconCheck className="mr-2 h-4 w-4" />
                  Activar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
