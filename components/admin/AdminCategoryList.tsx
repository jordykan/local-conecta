"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  IconPencil,
  IconTrash,
  IconCategory,
  IconGripVertical,
} from "@tabler/icons-react";
import { deleteCategory } from "@/app/admin/categories/actions";
import { toast } from "sonner";
import { AdminCategoryForm } from "./AdminCategoryForm";
import type { Category } from "@/lib/types/database";

type AdminCategoryListProps = {
  categories: Category[];
};

export function AdminCategoryList({ categories }: AdminCategoryListProps) {
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleDeleteClick = (categoryId: string, categoryName: string) => {
    setCategoryToDelete({ id: categoryId, name: categoryName });
  };

  const confirmDelete = () => {
    if (!categoryToDelete) return;

    setDeletingId(categoryToDelete.id);
    startTransition(async () => {
      const result = await deleteCategory(categoryToDelete.id);
      if (result.success) {
        toast.success("Categoría eliminada", {
          description: "La categoría ha sido removida del sistema"
        });
      } else {
        toast.error("Error al eliminar", {
          description: result.error ?? "No se pudo eliminar la categoría"
        });
      }
      setDeletingId(null);
      setCategoryToDelete(null);
    });
  };

  if (categories.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-4">
            <IconCategory className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="mt-4 text-lg font-semibold">No hay categorías</p>
          <p className="text-sm text-muted-foreground">
            Crea la primera categoría para comenzar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {categories.map((category) => (
        <Card
          key={category.id}
          className="group relative overflow-hidden transition-all hover:shadow-md"
        >
          <CardContent className="p-6">
            {/* Icon/Emoji Display */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-950/30 border-2 border-orange-200 dark:border-orange-800">
                {category.icon ? (
                  <span className="text-4xl leading-none select-none">
                    {category.icon}
                  </span>
                ) : (
                  <IconCategory className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                <IconGripVertical className="h-4 w-4" />
                <span>#{category.sort_order}</span>
              </div>
            </div>

            {/* Category Info */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold leading-tight">
                {category.name}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground font-mono">
                /{category.slug}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <AdminCategoryForm category={category}>
                <Button variant="outline" size="sm" className="flex-1">
                  <IconPencil className="mr-1.5 h-3.5 w-3.5" />
                  Editar
                </Button>
              </AdminCategoryForm>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteClick(category.id, category.name)}
                disabled={isPending && deletingId === category.id}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <IconTrash className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar la categoría{" "}
              <span className="font-semibold text-foreground">
                &quot;{categoryToDelete?.name}&quot;
              </span>
              ? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              onClick={confirmDelete}
              disabled={isPending}
              variant="destructive"
            >
              {isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
