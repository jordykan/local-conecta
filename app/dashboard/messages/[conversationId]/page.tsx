import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getBusinessByOwner } from "@/lib/queries/business"
import { getMessagesByConversationForBusiness } from "@/lib/queries/messages"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { DashboardMessageThread } from "@/components/dashboard/DashboardMessageThread"

interface PageProps {
  params: Promise<{ conversationId: string }>
}

export default async function DashboardConversationPage({ params }: PageProps) {
  const { conversationId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: businesses } = await getBusinessByOwner(user.id)
  const business = businesses?.[0]
  if (!business) redirect("/register-business")

  // Get business owner profile for full name
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()

  const { data: messages, user: conversationUser } =
    await getMessagesByConversationForBusiness(conversationId, business.id)

  if (messages.length === 0) notFound()

  return (
    <DashboardShell description={`Conversación con ${conversationUser?.full_name || "Cliente"}`}>
      <DashboardMessageThread
        initialMessages={messages}
        conversationId={conversationId}
        businessId={business.id}
        currentUserId={user.id}
        currentUserName={profile?.full_name || business.name || "Negocio"}
        userName={conversationUser?.full_name || "Cliente"}
      />
    </DashboardShell>
  )
}
