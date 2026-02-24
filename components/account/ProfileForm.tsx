"use client"

import { useState, useTransition } from "react"
import { IconUser } from "@tabler/icons-react"
import { sileo } from "sileo"
import { profileUpdateSchema } from "@/lib/validations/profile"
import { updateProfile } from "@/app/(main)/account/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

interface ProfileFormProps {
  initialData: {
    fullName: string
    phone: string
    avatarUrl: string | null
  }
  userEmail: string
  memberSince: string
}

export function ProfileForm({
  initialData,
  userEmail,
  memberSince,
}: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialData.fullName)
  const [phone, setPhone] = useState(initialData.phone)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, startTransition] = useTransition()

  const initials =
    fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || userEmail[0].toUpperCase()

  const hasChanges =
    fullName !== initialData.fullName || phone !== initialData.phone

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const parsed = profileUpdateSchema.safeParse({
      fullName: fullName.trim(),
      phone: phone.trim(),
    })

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString()
        if (key) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})

    startTransition(async () => {
      const result = await updateProfile(parsed.data)

      if (result?.error) {
        sileo.error({ title: "Error", description: result.error })
      } else {
        sileo.success({ title: "Perfil actualizado" })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar + info */}
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          {initialData.avatarUrl ? (
            <AvatarImage src={initialData.avatarUrl} alt={fullName} />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-medium">{userEmail}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Miembro desde {memberSince}
          </p>
        </div>
      </div>

      <Separator />

      {/* Fields */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="fullName"
            className="mb-1.5 block text-sm font-medium"
          >
            Nombre completo
          </label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tu nombre completo"
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
            Telefono
          </label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ej: +52 555 123 4567"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-destructive">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            Correo electronico
          </label>
          <Input value={userEmail} disabled className="bg-muted/30" />
          <p className="mt-1 text-xs text-muted-foreground">
            El correo no se puede cambiar desde aqui
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-2">
        <Button size="lg" type="submit" disabled={pending || !hasChanges}>
          {pending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  )
}
