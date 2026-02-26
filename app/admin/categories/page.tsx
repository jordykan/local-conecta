import { getAllCategories } from "@/lib/queries/admin"
import { AdminCategoryList } from "@/components/admin/AdminCategoryList"
import { AdminCategoryForm } from "@/components/admin/AdminCategoryForm"
import { Button } from "@/components/ui/button"
import { IconPlus } from "@tabler/icons-react"

export const metadata = {
  title: "Gestión de Categorías | Admin",
  description: "Gestiona las categorías de negocios",
}

export default async function AdminCategoriesPage() {
  const { data: categories } = await getAllCategories()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Categorías</h1>
          <p className="mt-2 text-muted-foreground">Crea, edita y organiza las categorías de negocios</p>
        </div>
        <AdminCategoryForm>
          <Button>
            <IconPlus className="mr-2 h-4 w-4" />
            Nueva Categoría
          </Button>
        </AdminCategoryForm>
      </div>

      <AdminCategoryList categories={categories ?? []} />
    </div>
  )
}
