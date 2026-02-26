import { requireAdmin } from "@/lib/queries/admin"
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireAdmin()

  return (
    <AdminLayoutClient user={{ id: user.id, email: user.email ?? "", role: profile.role }}>
      {children}
    </AdminLayoutClient>
  )
}
