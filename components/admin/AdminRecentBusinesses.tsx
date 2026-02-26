import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconBuilding, IconArrowRight, IconClock } from "@tabler/icons-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"

type Business = {
  id: string
  name: string
  status: string
  created_at: string
  category: {
    name: string
  } | null
  owner: {
    full_name: string
  } | null
}

type AdminRecentBusinessesProps = {
  businesses: Business[]
}

export function AdminRecentBusinesses({ businesses }: AdminRecentBusinessesProps) {
  if (businesses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <IconBuilding className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            Negocios Pendientes
          </CardTitle>
          <CardDescription>No hay negocios pendientes de aprobación</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <IconBuilding className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            Negocios Pendientes Recientes
          </CardTitle>
          <CardDescription className="mt-1.5">
            Últimos {businesses.length} negocios esperando aprobación
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
          <Link href="/admin/businesses?status=pending">
            Ver todos
            <IconArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {businesses.map((business, index) => (
            <div
              key={business.id}
              className="group flex items-center justify-between rounded-xl border bg-card p-4 transition-all hover:bg-accent/50 hover:shadow-sm"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                  <IconBuilding className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">{business.name}</p>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {business.category?.name}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="truncate">{business.owner?.full_name}</span>
                    <span className="hidden sm:flex items-center gap-1 shrink-0">
                      <IconClock className="h-3 w-3" />
                      {format(new Date(business.created_at), "d MMM", { locale: es })}
                    </span>
                  </div>
                </div>
              </div>
              <Button size="sm" asChild className="shrink-0">
                <Link href="/admin/businesses?status=pending">Revisar</Link>
              </Button>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" asChild className="mt-4 w-full sm:hidden">
          <Link href="/admin/businesses?status=pending">
            Ver todos los pendientes
            <IconArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
