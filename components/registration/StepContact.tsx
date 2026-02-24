"use client"

import { useState } from "react"
import { IconPhone, IconBrandWhatsapp, IconMail, IconMapPin } from "@tabler/icons-react"
import { businessContactSchema, type BusinessContactData } from "@/lib/validations/business"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface StepContactProps {
  data: Partial<BusinessContactData>
  onNext: (data: BusinessContactData) => void
  onBack: () => void
}

export function StepContact({ data, onNext, onBack }: StepContactProps) {
  const [phone, setPhone] = useState(data.phone ?? "")
  const [whatsapp, setWhatsapp] = useState(data.whatsapp ?? "")
  const [email, setEmail] = useState(data.email ?? "")
  const [address, setAddress] = useState(data.address ?? "")
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = businessContactSchema.safeParse({
      phone,
      whatsapp,
      email,
      address,
    })

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString()
        if (key) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    onNext(result.data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="phone">Telefono</Label>
        <div className="relative">
          <IconPhone className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground/60" />
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="55 1234 5678"
            className="h-12 pl-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="whatsapp">WhatsApp</Label>
        <div className="relative">
          <IconBrandWhatsapp className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground/60" />
          <Input
            id="whatsapp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="55 1234 5678"
            className="h-12 pl-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Correo electronico</Label>
        <div className="relative">
          <IconMail className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground/60" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="negocio@email.com"
            className="h-12 pl-11"
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Direccion</Label>
        <div className="relative">
          <IconMapPin className="pointer-events-none absolute left-3.5 top-3 size-[18px] text-muted-foreground/60" />
          <Textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Calle, numero, colonia, ciudad..."
            rows={2}
            className="pl-11"
          />
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="ghost" onClick={onBack} className="h-11">
          Atras
        </Button>
        <Button type="submit" className="h-11 px-8">
          Siguiente
        </Button>
      </div>
    </form>
  )
}
