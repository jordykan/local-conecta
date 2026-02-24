import { IconMapPinOff, IconHome, IconSearch } from "@tabler/icons-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-muted/50">
        <IconMapPinOff className="size-10 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Página no encontrada</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        La página que buscas no existe o fue movida. Explora el directorio de negocios o regresa al inicio.
      </p>
      <div className="mt-8 flex gap-3">
        <Button variant="outline" asChild>
          <Link href="/businesses">
            <IconSearch className="mr-1.5 size-4" />
            Explorar negocios
          </Link>
        </Button>
        <Button asChild>
          <Link href="/">
            <IconHome className="mr-1.5 size-4" />
            Ir al inicio
          </Link>
        </Button>
      </div>
    </div>
  )
}
