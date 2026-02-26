import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { IconBell } from "@tabler/icons-react"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let navUser = null
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, role")
      .eq("id", user.id)
      .single<{ full_name: string; avatar_url: string | null; role: string }>()

    navUser = {
      id: user.id,
      email: user.email!,
      fullName: profile?.full_name ?? "",
      avatarUrl: profile?.avatar_url,
      role: profile?.role,
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />

      {/* Banner temporal para pruebas de notificaciones */}
      <div className="bg-orange-100 dark:bg-orange-950 border-b border-orange-200 dark:border-orange-900">
        <div className="container mx-auto px-4 py-3">
          <Link
            href="/test-notifications"
            className="flex items-center gap-2 text-sm text-orange-900 dark:text-orange-100 hover:underline"
          >
            <IconBell className="h-4 w-4" />
            <span className="font-medium">Prueba notificaciones push →</span>
          </Link>
        </div>
      </div>

      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
