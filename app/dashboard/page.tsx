import Link from "next/link"
import { redirect } from "next/navigation"
import {
  IconPackage,
  IconClock,
  IconPlus,
  IconPhoto,
  IconArrowRight,
  IconExternalLink,
} from "@tabler/icons-react"
import { createClient } from "@/lib/supabase/server"
import { getBusinessByOwner, getProductsByBusiness } from "@/lib/queries/business"
import { DAYS_OF_WEEK } from "@/lib/constants"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: businesses } = await getBusinessByOwner(user.id)
  const business = businesses?.[0]
  if (!business) redirect("/register-business")

  const [{ data: products }, { data: hoursData }, { data: profile }] =
    await Promise.all([
      getProductsByBusiness(business.id),
      supabase
        .from("business_hours")
        .select("*")
        .eq("business_id", business.id)
        .order("day_of_week"),
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single(),
    ])

  const allProducts = products ?? []
  const productCount = allProducts.filter((p) => p.type === "product").length
  const serviceCount = allProducts.filter((p) => p.type === "service").length
  const recentProducts = allProducts.slice(0, 4)

  // Greeting
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? "Buenos dias" : hour < 19 ? "Buenas tardes" : "Buenas noches"
  const firstName = profile?.full_name?.split(" ")[0] ?? ""

  // Today's hours
  const today = new Date().getDay()
  const todayHours = hoursData?.find((h) => h.day_of_week === today)
  const todayLabel = DAYS_OF_WEEK[today] ?? "Hoy"
  const todaySchedule = todayHours
    ? todayHours.is_closed
      ? "Cerrado"
      : `${todayHours.open_time?.slice(0, 5) ?? "09:00"} – ${todayHours.close_time?.slice(0, 5) ?? "18:00"}`
    : "Sin configurar"

  // Price formatter
  function formatPrice(product: (typeof allProducts)[0]) {
    if (product.price_type === "quote" || product.price == null) return "A consultar"
    const formatted = `$${Number(product.price).toLocaleString("es-MX")}`
    if (product.price_type === "starting_at") return `Desde ${formatted}`
    if (product.price_type === "per_hour") return `${formatted}/hr`
    return formatted
  }

  return (
    <DashboardShell>
      {/* Greeting */}
      <div>
        <h2 className="text-lg font-medium">
          {greeting}
          {firstName ? `, ${firstName}` : ""}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Aqui tienes un resumen de tu negocio.
        </p>
      </div>

      {/* Status + Stats */}
      <div className={`grid gap-4 ${business.status === "pending" ? "lg:grid-cols-[1fr_auto] mt-4" : "mt-4"}`}>
        {business.status === "pending" && (
          <div className="flex items-center gap-4 rounded-lg border border-amber-200/60 bg-amber-50/50 p-4 dark:border-amber-500/20 dark:bg-amber-950/20">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <IconClock className="size-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Tu negocio esta en revision
              </p>
              <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300/80">
                Un administrador revisara tu registro. Mientras tanto, configura
                tus productos y horarios.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-lg border border-border/50 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold tabular-nums">{productCount}</span>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Productos</span>
              <Link
                href="/dashboard/products"
                className="text-xs text-primary hover:underline"
              >
                Agregar
              </Link>
            </div>
          </div>

          <Separator orientation="vertical" className="hidden h-8 sm:block" />

          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold tabular-nums">{serviceCount}</span>
            <span className="text-xs text-muted-foreground">Servicios</span>
          </div>

          <Separator orientation="vertical" className="hidden h-8 sm:block" />

          <div className="flex items-center gap-3">
            <IconClock className="size-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{todaySchedule}</span>
              <span className="text-xs text-muted-foreground">{todayLabel}</span>
            </div>
          </div>
        </div>
      </div>
     
      {/* Actions */}
      <section>
        <p className="mb-3 mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Acciones rapidas
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard/products">
              <IconPlus className="size-3.5" />
              Agregar producto
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard/hours">
              <IconClock className="size-3.5" />
              Configurar horarios
            </Link>
          </Button>
          {business.status === "active" && (
            <Button asChild variant="outline" size="lg">
              <Link href={`/businesses/${business.slug}`}>
                <IconExternalLink className="size-3.5" />
                Ver perfil publico
              </Link>
            </Button>
          )}
        </div>
      </section>

      {/* Recent products */}
      <section>
        <div className="mb-3 mt-4 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Productos recientes
          </p>
          {allProducts.length > 0 && (
            <Link
              href="/dashboard/products"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Ver todos
              <IconArrowRight className="size-3" />
            </Link>
          )}
        </div>

        {recentProducts.length > 0 ? (
          <div className="space-y-1">
            {recentProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/40"
              >
                <div className="flex size-15 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <IconPhoto className="size-8 text-muted-foreground/50" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="h-4 px-1.5 text-[9px]"
                    >
                      {product.type === "product" ? "Producto" : "Servicio"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatPrice(product)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/40 px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Aun no tienes productos.
            </p>
            <Button asChild size="lg" className="mt-3">
              <Link href="/dashboard/products">Agregar producto</Link>
            </Button>
          </div>
        )}
      </section>
    </DashboardShell>
  )
}
