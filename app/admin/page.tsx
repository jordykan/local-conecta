import { getAdminStats, getBusinessesByStatus } from "@/lib/queries/admin"
import { AdminStatsCards } from "@/components/admin/AdminStatsCards"
import { AdminRecentBusinesses } from "@/components/admin/AdminRecentBusinesses"
import { IconAlertCircle } from "@tabler/icons-react"
import Link from "next/link"

export const metadata = {
  title: "Panel de Administración | Local Conecta",
  description: "Panel de administración de la plataforma",
}

export default async function AdminPage() {
  const [stats, { data: pendingBusinesses }] = await Promise.all([
    getAdminStats(),
    getBusinessesByStatus("pending"),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <p className="mt-2 text-muted-foreground">Gestiona negocios, categorías y estadísticas de la plataforma</p>
      </div>

      <AdminStatsCards stats={stats} />

      {stats.pendingBusinesses > 0 && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <div className="flex items-center gap-3">
            <IconAlertCircle className="h-5 w-5 text-orange-600" />
            <div className="flex-1">
              <p className="font-medium text-orange-900">
                Hay {stats.pendingBusinesses} {stats.pendingBusinesses === 1 ? "negocio pendiente" : "negocios pendientes"} de aprobación
              </p>
              <p className="text-sm text-orange-700">Revisa y aprueba los negocios registrados</p>
            </div>
            <Link
              href="/admin/businesses?status=pending"
              className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
            >
              Ver negocios pendientes
            </Link>
          </div>
        </div>
      )}

      <AdminRecentBusinesses businesses={pendingBusinesses?.slice(0, 5) ?? []} />
    </div>
  )
}
