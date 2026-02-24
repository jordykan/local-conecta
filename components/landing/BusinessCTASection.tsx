import Link from "next/link"
import { IconArrowRight } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

export function BusinessCTASection() {
  return (
    <section className="px-4 py-16 md:px-8 md:py-20">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl bg-primary px-6 py-16 text-center md:px-12 md:py-20">
        {/* Subtle radial glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-foreground/10 via-transparent to-transparent" />

        <h2 className="relative text-2xl font-bold tracking-tight text-primary-foreground md:text-3xl">
          ¿Tienes un negocio local?
        </h2>
        <p className="relative mx-auto mt-4 max-w-md text-base leading-relaxed text-primary-foreground/80 md:text-lg">
          Registra tu negocio gratis y conecta con tu comunidad
        </p>
        <div className="relative mt-8">
          <Button
            asChild
            size="lg"
            className="h-11 rounded-lg bg-primary-foreground px-6 text-sm font-semibold text-primary shadow-lg hover:bg-primary-foreground/90"
          >
            <Link href="/register-business">
              Registrar mi negocio
              <IconArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
