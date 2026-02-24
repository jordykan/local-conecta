import { IconSearch, IconCalendarEvent, IconMapPin } from "@tabler/icons-react"
import type { TablerIcon } from "@tabler/icons-react"

interface Step {
  number: number
  icon: TablerIcon
  title: string
  description: string
}

const steps: Step[] = [
  {
    number: 1,
    icon: IconSearch,
    title: "Explora",
    description: "Navega el directorio de negocios de tu comunidad y encuentra lo que necesitas",
  },
  {
    number: 2,
    icon: IconCalendarEvent,
    title: "Aparta",
    description: "Reserva productos o servicios directamente desde la app en segundos",
  },
  {
    number: 3,
    icon: IconMapPin,
    title: "Disfruta",
    description: "Acude al negocio en el horario acordado y disfruta de lo local",
  },
]

export function HowItWorksSection() {
  return (
    <section className="bg-muted/30 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl">
          Como funciona
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center text-sm text-muted-foreground md:text-base">
          Tres pasos para conectar con lo local
        </p>

        <div className="relative mt-12 grid gap-8 md:grid-cols-3 md:gap-12">
          {/* Dashed connector line — desktop only */}
          <div className="pointer-events-none absolute top-10 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] hidden h-px border-t-2 border-dashed border-border md:block" />

          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="relative z-10 flex flex-col items-center text-center">
                <div className="relative flex size-20 items-center justify-center rounded-2xl border border-primary/20 bg-background shadow-sm">
                  <Icon className="size-8 text-primary" stroke={1.5} />
                  <span className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
