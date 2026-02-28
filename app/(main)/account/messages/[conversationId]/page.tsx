import { redirect } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import { getMessagesByConversation } from "@/lib/queries/messages";
import { MessageThread } from "@/components/account/MessageThread";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const metadata = {
  title: "Conversacion — Mercadito",
};

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get user profile for full name
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { data: messages, business } = await getMessagesByConversation(
    conversationId,
    user.id,
  );

  if (!business) redirect("/account/messages");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/account/messages"
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <IconArrowLeft className="size-4" />
        </Link>

        <Avatar className="size-8">
          {business.logo_url ? (
            <AvatarImage src={business.logo_url} alt={business.name ?? ""} />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {business.name?.charAt(0).toUpperCase() ?? "N"}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <Link
            href={`/businesses/${business.slug}`}
            className="text-sm font-semibold hover:underline"
          >
            {business.name}
          </Link>
        </div>
      </div>

      {/* Thread */}
      <MessageThread
        initialMessages={messages}
        conversationId={conversationId}
        businessId={business.id}
        currentUserId={user.id}
        currentUserName={profile?.full_name || "Usuario"}
      />
    </div>
  );
}
