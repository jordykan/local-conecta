import Link from "next/link"
import {
  IconToolsKitchen2,
  IconHeartbeat,
  IconSparkles,
  IconHome,
  IconSchool,
  IconPaw,
  IconDevices,
  IconShoppingBag,
} from "@tabler/icons-react"
import type { TablerIcon } from "@tabler/icons-react"
import { Card, CardContent } from "@/components/ui/card"

interface Category {
  name: string
  slug: string
  icon: TablerIcon
}

const categories: Category[] = [
  { name: "Comida y bebidas", slug: "comida-y-bebidas", icon: IconToolsKitchen2 },
  { name: "Salud y bienestar", slug: "salud-y-bienestar", icon: IconHeartbeat },
  { name: "Belleza", slug: "belleza", icon: IconSparkles },
  { name: "Servicios del hogar", slug: "servicios-del-hogar", icon: IconHome },
  { name: "Educacion", slug: "educacion", icon: IconSchool },
  { name: "Mascotas", slug: "mascotas", icon: IconPaw },
  { name: "Tecnologia", slug: "tecnologia", icon: IconDevices },
  { name: "Tiendas", slug: "tiendas", icon: IconShoppingBag },
]

export function CategoriesSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl">
          Explora por categoria
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center text-sm text-muted-foreground md:text-base">
          Encuentra exactamente lo que necesitas
        </p>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <Link key={cat.slug} href={`/categories/${cat.slug}`} className="group">
                <Card className="items-center border-transparent bg-muted/50 py-6 transition-all duration-200 group-hover:bg-muted group-hover:shadow-sm">
                  <CardContent className="flex flex-col items-center gap-3 px-4">
                    <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                      <Icon className="size-7 text-primary" stroke={1.5} />
                    </div>
                    <span className="text-center text-sm font-medium text-foreground">
                      {cat.name}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
