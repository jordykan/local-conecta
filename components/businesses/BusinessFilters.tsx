"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { IconFilter, IconX } from "@tabler/icons-react"
import type { Category } from "@/lib/types/database"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface BusinessFiltersProps {
  categories: Category[]
}

export function BusinessFilters({ categories }: BusinessFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get("category") ?? ""
  const currentQuery = searchParams.get("q") ?? ""
  const hasFilters = currentCategory || currentQuery

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/businesses?${params.toString()}`)
  }

  function clearAll() {
    router.push("/businesses")
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <IconFilter className="size-4" />
        Filtrar
      </div>

      <Select
        value={currentCategory}
        onValueChange={(val) => updateParam("category", val === "all" ? "" : val)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las categorías</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.slug}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="h-8 text-xs text-muted-foreground hover:text-foreground"
        >
          <IconX className="mr-1 size-3.5" />
          Limpiar filtros
        </Button>
      )}

      {currentQuery && (
        <Badge variant="secondary" className="gap-1.5">
          Busqueda: &ldquo;{currentQuery}&rdquo;
          <button
            onClick={() => updateParam("q", "")}
            className="rounded-full hover:bg-muted"
          >
            <IconX className="size-3" />
          </button>
        </Badge>
      )}
    </div>
  )
}
