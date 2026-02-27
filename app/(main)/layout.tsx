import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { createClient } from "@/lib/supabase/server"

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
    </div>
  )
}
