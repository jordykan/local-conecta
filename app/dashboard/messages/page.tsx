import { redirect } from "next/navigation"
import { IconMessage } from "@tabler/icons-react"
import { createClient } from "@/lib/supabase/server"
import { getBusinessByOwner } from "@/lib/queries/business"
import { getConversationsByBusiness } from "@/lib/queries/messages"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { ConversationsList } from "@/components/dashboard/ConversationsList"
import { EmptyState } from "@/components/shared/EmptyState"

export default async function DashboardMessagesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: businesses } = await getBusinessByOwner(user.id)
  const business = businesses?.[0]
  if (!business) redirect("/register-business")

  const { data: conversations } = await getConversationsByBusiness(business.id)

  return (
    <DashboardShell description="Mensajes de tus clientes">
      {conversations.length > 0 ? (
        <ConversationsList conversations={conversations} />
      ) : (
        <EmptyState
          icon={IconMessage}
          title="Sin mensajes"
          description="Cuando un cliente te envíe un mensaje, aparecerá aquí."
        />
      )}
    </DashboardShell>
  )
}
