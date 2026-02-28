import Link from "next/link"
import Image from "next/image"
import { IconMapPin, IconStarFilled } from "@tabler/icons-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left panel — Brand */}
      <div className="relative hidden bg-[oklch(0.18_0.02_260)] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/" className="block">
          <Image
            src="/assets/logo_web.png"
            alt="Mercadito"
            width={200}
            height={60}
            className="h-10 w-auto lg:h-12"
            priority
          />
        </Link>

        <div className="max-w-md space-y-10">
          <h1 className="text-[2.75rem] leading-[1.15] font-bold tracking-tight text-white">
            Tu comunidad,{" "}
            <span className="text-[oklch(0.837_0.128_66.29)]">
              a un paso
            </span>
          </h1>

          <p className="text-base leading-relaxed text-white/50">
            Descubre negocios locales, agenda servicios y apoya a los
            emprendedores que hacen unica tu zona.
          </p>

          {/* Testimonial */}
          {/* <div className="space-y-5">
            <div className="h-px w-12 bg-white/15" />
            <blockquote className="text-[15px] leading-relaxed text-white/65 italic">
              &ldquo;Encontre los mejores servicios cerca de mi casa.
              Es increible lo facil que es descubrir negocios de calidad.&rdquo;
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white/80">
                MR
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">
                  Maria Rodriguez
                </p>
                <div className="mt-0.5 flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <IconStarFilled
                      key={i}
                      className="size-3 text-[oklch(0.837_0.128_66.29)]"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div> */}
        </div>

        <div className="flex items-center gap-2 text-xs text-white/25">
          <IconMapPin className="size-3.5" />
          <span>Conectando comunidades desde 2025</span>
        </div>
      </div>

      {/* Right panel — Form */}
      <div className="flex flex-col bg-background">
        <div className="flex items-center justify-center p-6 lg:hidden">
          <Link href="/" className="block">
            <Image
              src="/assets/logo_web.png"
              alt="Mercadito"
              width={180}
              height={50}
              className="h-10 w-auto"
            />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </div>
    </div>
  )
}
