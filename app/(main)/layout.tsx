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
      <main className="flex-1">{children}</main>
      <Footer />

      {/* Botón flotante temporal para pruebas de notificaciones */}
      <Link
        href="/test-notifications"
        className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 rounded-full bg-orange-600 px-6 py-3 text-sm font-medium text-white shadow-lg hover:bg-orange-700 transition-colors"
      >
        <IconBell className="h-5 w-5" />
        <span>Test Push</span>
      </Link>
    </div>
  )
}
