"use client"

import { useState, useEffect, useRef, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { IconSearch, IconLoader2, IconBuildingStore } from "@tabler/icons-react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: string
  name: string
  slug: string
  short_description: string | null
  logo_url: string | null
  categories: { name: string } | null
}

export function SearchBar({
  autoFocus = false,
  className,
}: {
  autoFocus?: boolean
  className?: string
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from("businesses")
          .select("id, name, slug, short_description, logo_url, categories ( name )")
          .eq("status", "active")
          .ilike("name", `%${trimmed}%`)
          .limit(6)

        setResults((data as SearchResult[]) ?? [])
        setOpen(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(debounceRef.current)
  }, [query])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      setOpen(false)
      router.push(`/businesses?q=${encodeURIComponent(trimmed)}`)
    }
  }

  function handleSelect(slug: string) {
    setOpen(false)
    setQuery("")
    router.push(`/businesses/${slug}`)
  }

  return (
    <div ref={containerRef} className={cn("relative mx-auto w-full max-w-lg", className)}>
      <form onSubmit={handleSubmit}>
        <div className="group relative">
          {loading ? (
            <IconLoader2 className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : (
            <IconSearch className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          )}
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setOpen(true)
            }}
            placeholder="Busca negocios, productos o servicios..."
            autoFocus={autoFocus}
            className="h-12 rounded-xl border-border bg-background pl-12 pr-4 text-sm text-foreground shadow-sm transition-all placeholder:text-muted-foreground focus-visible:border-primary focus-visible:shadow-md focus-visible:shadow-primary/5 focus-visible:ring-primary/20 md:h-14 md:text-base"
          />
        </div>
      </form>

      {/* Autocomplete dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border bg-popover shadow-lg">
          {results.length > 0 ? (
            <ul className="divide-y divide-border/50">
              {results.map((biz) => (
                <li key={biz.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(biz.slug)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                      {biz.logo_url ? (
                        <img
                          src={biz.logo_url}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <IconBuildingStore className="size-4 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-popover-foreground">
                        {biz.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {biz.categories?.name ?? "Negocio"}
                        {biz.short_description ? ` · ${biz.short_description}` : ""}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-muted-foreground">
                No se encontraron negocios para "{query}"
              </p>
            </div>
          )}

          {query.trim().length >= 2 && (
            <Link
              href={`/businesses?q=${encodeURIComponent(query.trim())}`}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 border-t bg-muted/30 px-4 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <IconSearch className="size-3.5" />
              Ver todos los resultados para "{query.trim()}"
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
