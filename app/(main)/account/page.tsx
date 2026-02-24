import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/lib/queries/profile"
import { ProfileForm } from "@/components/account/ProfileForm"

export const metadata = {
  title: "Mi cuenta — Local Conecta",
}

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await getProfile(user.id)

  const memberSince = new Date(
    profile?.created_at ?? user.created_at ?? Date.now()
  ).toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Informacion personal</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Actualiza tu nombre y telefono de contacto
        </p>
      </div>

      <ProfileForm
        initialData={{
          fullName: profile?.full_name ?? "",
          phone: profile?.phone ?? "",
          avatarUrl: profile?.avatar_url ?? null,
        }}
        userEmail={user.email!}
        memberSince={memberSince}
      />
    </div>
  )
}
