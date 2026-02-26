import { getBusinessesByStatus } from "@/lib/queries/admin"
import { AdminBusinessList } from "@/components/admin/AdminBusinessList"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export const metadata = {
  title: "Gestión de Negocios | Admin",
  description: "Gestiona los negocios de la plataforma",
}

type SearchParams = Promise<{ status?: "pending" | "active" | "suspended" }>

export default async function AdminBusinessesPage({ searchParams }: { searchParams: SearchParams }) {
  const { status } = await searchParams
  const activeTab = status ?? "pending"

  const [{ data: pendingBusinesses }, { data: activeBusinesses }, { data: suspendedBusinesses }] = await Promise.all([
    getBusinessesByStatus("pending"),
    getBusinessesByStatus("active"),
    getBusinessesByStatus("suspended"),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Negocios</h1>
        <p className="mt-2 text-muted-foreground">Aprueba, suspende o gestiona los negocios registrados</p>
      </div>

      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pendientes
            {pendingBusinesses && pendingBusinesses.length > 0 && (
              <span className="ml-2 rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">
                {pendingBusinesses.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">Activos ({activeBusinesses?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="suspended">Suspendidos ({suspendedBusinesses?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <AdminBusinessList businesses={pendingBusinesses ?? []} status="pending" />
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <AdminBusinessList businesses={activeBusinesses ?? []} status="active" />
        </TabsContent>

        <TabsContent value="suspended" className="mt-6">
          <AdminBusinessList businesses={suspendedBusinesses ?? []} status="suspended" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
