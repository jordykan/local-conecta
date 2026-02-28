import { notFound } from "next/navigation";
import { IconBuildingStore } from "@tabler/icons-react";
import type { Metadata } from "next";
import { getBusinessesDirectory, getCategories } from "@/lib/queries/business";
import type { BusinessDirectoryItem } from "@/lib/queries/business";
import { isCurrentlyOpen } from "@/components/businesses/BusinessHoursDisplay";
import { BusinessCard } from "@/components/businesses/BusinessCard";
import { EmptyState } from "@/components/shared/EmptyState";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: categories } = await getCategories();
  const category = categories?.find((c) => c.slug === slug);

  if (!category) return { title: "Categoría no encontrada — Mercadito" };

  return {
    title: `${category.name} — Mercadito`,
    description: `Descubre negocios de ${category.name} en tu comunidad`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const [{ data: categories }, { data: businesses }] = await Promise.all([
    getCategories(),
    getBusinessesDirectory({ categorySlug: slug }),
  ]);

  const category = categories?.find((c) => c.slug === slug);
  if (!category) notFound();

  const allBusinesses = (businesses ?? []) as BusinessDirectoryItem[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
        <p className="mt-2 text-muted-foreground">
          {allBusinesses.length}{" "}
          {allBusinesses.length === 1 ? "negocio" : "negocios"} en esta
          categoría
        </p>
      </div>

      {allBusinesses.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allBusinesses.map((biz) => {
            const hours = biz.business_hours ?? [];
            const isOpen = isCurrentlyOpen(hours as any);

            return (
              <BusinessCard
                key={biz.id}
                businessId={biz.id}
                slug={biz.slug}
                name={biz.name}
                category={biz.categories?.name ?? "Sin categoría"}
                description={biz.short_description || biz.description || ""}
                coverUrl={biz.cover_url ?? undefined}
                logoUrl={biz.logo_url ?? undefined}
                rating={4.5}
                isOpen={isOpen}
                isFavorited={false}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={IconBuildingStore}
          title="Sin negocios en esta categoría"
          description="Aún no hay negocios registrados en esta categoría."
          actionLabel="Ver todos los negocios"
          actionHref="/businesses"
        />
      )}
    </div>
  );
}
