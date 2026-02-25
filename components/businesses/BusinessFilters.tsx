"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { IconFilter, IconX, IconTag } from "@tabler/icons-react"
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
import { Switch } from "@/components/ui/switch"

interface BusinessFiltersProps {
  categories: Category[]
}

export function BusinessFilters({ categories }: BusinessFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get("category") ?? ""
  const currentQuery = searchParams.get("q") ?? ""
  const hasPromotions = searchParams.get("promotions") === "true"
  const hasFilters = currentCategory || currentQuery || hasPromotions

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

      <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5">
        <IconTag className="size-4 text-primary" />
        <span className="text-sm">Con promociones</span>
        <Switch
          checked={hasPromotions}
          onCheckedChange={(checked) => updateParam("promotions", checked ? "true" : "")}
          className="scale-75"
        />
      </div>

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
