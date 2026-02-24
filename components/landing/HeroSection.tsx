import Image from "next/image"
import Link from "next/link"
import { IconChevronDown } from "@tabler/icons-react"
import { HeroSearchBar } from "@/components/shared/HeroSearchBar"
import { Badge } from "@/components/ui/badge"
import heroBg from "@/assets/hero-bg.jpg"

const quickCategories = [
  { label: "Comida", slug: "comida-y-bebidas" },
  { label: "Servicios", slug: "servicios-del-hogar" },
  { label: "Salud", slug: "salud-y-bienestar" },
  { label: "Belleza", slug: "belleza" },
]

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Background image */}
      <Image
        src={heroBg}
        alt=""
        fill
        priority
        placeholder="blur"
        className="object-cover"
        sizes="100vw"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl lg:leading-[1.1]">
          Descubre los negocios{" "}
          <span className="italic text-primary">de tu comunidad</span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/70 md:text-xl">
          Encuentra, aparta y conecta con negocios locales cerca de ti
        </p>

        <div className="mt-8 md:mt-10">
          <HeroSearchBar />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-sm text-white">Popular:</span>
          {quickCategories.map((cat) => (
            <Badge
              key={cat.slug}
              variant="outline"
              asChild
              className="cursor-pointer border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
            >
              <Link href={`/categories/${cat.slug}`}>{cat.label}</Link>
            </Badge>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1">
        <span className="text-xs font-medium uppercase tracking-widest text-white/40">
          Explorar más
        </span>
        <IconChevronDown className="size-5 animate-bounce text-white/40" />
      </div>
    </section>
  )
}
