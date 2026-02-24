export interface DashboardUser {
  id: string
  email: string
  fullName: string
  avatarUrl: string | null
}

export interface DashboardBusiness {
  id: string
  name: string
  slug: string
  status: "pending" | "active" | "suspended"
  logo_url: string | null
  cover_url: string | null
  description: string | null
  short_description: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  address: string | null
}
