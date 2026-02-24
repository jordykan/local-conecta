import { IconBuildingStore, IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function BusinessNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-muted/50">
        <IconBuildingStore className="size-8 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">
        Negocio no encontrado
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Este negocio no existe o no está disponible en este momento. Prueba buscando en el directorio.
      </p>
      <Button asChild className="mt-6">
        <Link href="/businesses">
          <IconArrowLeft className="mr-1.5 size-4" />
          Ver todos los negocios
        </Link>
      </Button>
    </div>
  )
}
