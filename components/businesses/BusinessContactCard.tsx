import {
  IconPhone,
  IconBrandWhatsapp,
  IconMail,
  IconMapPin,
} from "@tabler/icons-react"
import type { Business } from "@/lib/types/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BusinessContactCardProps {
  business: Pick<Business, "phone" | "whatsapp" | "email" | "address">
}

function formatWhatsAppUrl(number: string): string {
  const cleaned = number.replace(/\D/g, "")
  return `https://wa.me/${cleaned}`
}

export function BusinessContactCard({ business }: BusinessContactCardProps) {
  const hasAny =
    business.phone || business.whatsapp || business.email || business.address

  if (!hasAny) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Contacto</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-1">
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-accent"
            >
              <IconPhone className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground">Telefono</p>
                <p className="truncate font-medium text-foreground">
                  {business.phone}
                </p>
              </div>
            </a>
          )}

          {business.whatsapp && (
            <a
              href={formatWhatsAppUrl(business.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-accent"
            >
              <IconBrandWhatsapp className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground">WhatsApp</p>
                <p className="truncate font-medium text-foreground">
                  {business.whatsapp}
                </p>
              </div>
            </a>
          )}

          {business.email && (
            <a
              href={`mailto:${business.email}`}
              className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-accent"
            >
              <IconMail className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground">Email</p>
                <p className="truncate font-medium text-foreground">
                  {business.email}
                </p>
              </div>
            </a>
          )}

          {business.address && (
            <div className="flex items-start gap-3 rounded-lg px-2.5 py-2 text-sm">
              <IconMapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground">Direccion</p>
                <p className="font-medium text-foreground">
                  {business.address}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
