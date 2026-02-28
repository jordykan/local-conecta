import { redirect } from "next/navigation";
import { IconMessageCircle } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import { getConversationsByUser } from "@/lib/queries/messages";
import { ConversationCard } from "@/components/account/ConversationCard";
import { EmptyState } from "@/components/shared/EmptyState";

export const metadata = {
  title: "Mis mensajes — Mercadito",
};

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: conversations } = await getConversationsByUser(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Mis mensajes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Conversaciones con negocios
        </p>
      </div>

      {conversations && conversations.length > 0 ? (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <ConversationCard key={conv.conversation_id} conversation={conv} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={IconMessageCircle}
          title="No tienes mensajes"
          description="Cuando contactes un negocio, tus conversaciones apareceran aqui"
          actionLabel="Explorar negocios"
          actionHref="/businesses"
        />
      )}
    </div>
  );
}
