import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCategories, getCommunities } from "@/lib/queries/business";
import { BusinessRegistrationWizard } from "@/components/registration/BusinessRegistrationWizard";

export const metadata = {
  title: "Registrar negocio — Mercadito",
};

export default async function RegisterBusinessPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/register-business");

  // Redirect if user already has a business
  const { data: existingBusiness } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();

  if (existingBusiness) redirect("/dashboard");

  const [{ data: categories }, { data: communities }] = await Promise.all([
    getCategories(),
    getCommunities(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Registra tu negocio
        </h1>
        <p className="text-muted-foreground">
          Completa los datos para aparecer en el directorio de tu comunidad
        </p>
      </div>

      <BusinessRegistrationWizard
        categories={categories ?? []}
        communities={communities ?? []}
        userId={user.id}
      />
    </div>
  );
}
