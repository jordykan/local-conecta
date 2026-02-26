import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AccountNav } from "@/components/account/AccountNav"

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi cuenta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Administra tu perfil, reservas, mensajes y favoritos
        </p>
      </div>

      <div className="mt-6 lg:mt-8 lg:grid lg:grid-cols-[220px_1fr] lg:gap-10">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <AccountNav />
        </aside>

        <div className="mt-6 lg:mt-0">{children}</div>
      </div>
    </div>
  )
}
