import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="block">
              <Image
                src="/assets/logo_web.png"
                alt="Mercadito"
                width={150}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Conectando comunidades con sus negocios locales
            </p>
          </div>

          {/* Explorar */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Explorar</h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/businesses"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Negocios
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Categorias
                </Link>
              </li>
              <li>
                <Link
                  href="/promotions"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Promociones
                </Link>
              </li>
            </ul>

            <h3 className="pt-2 text-sm font-semibold text-foreground">
              Para negocios
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/register"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Registrar negocio
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Terminos de servicio
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="mt-12" />
        <div className="pt-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Mercadito. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
