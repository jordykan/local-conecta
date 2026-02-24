"use client"

import { useState, useEffect, useRef, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { IconSearch, IconLoader2, IconBuildingStore } from "@tabler/icons-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

interface SearchResult {
  id: string
  name: string
  slug: string
  short_description: string | null
  logo_url: string | null
  categories: { name: string } | null
}

export function HeroSearchBar() {
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
          .limit(5)

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
    <div ref={containerRef} className="relative mx-auto w-full max-w-2xl px-2 sm:px-0">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:bg-white/95 sm:p-2 sm:shadow-xl sm:shadow-black/10 sm:backdrop-blur-sm sm:dark:bg-gray-900/95">
          <div className="flex flex-1 items-center gap-3 rounded-full bg-white/95 px-4 py-3 shadow-xl shadow-black/10 backdrop-blur-sm dark:bg-gray-900/95 sm:rounded-none sm:bg-transparent sm:px-4 sm:py-0 sm:shadow-none sm:backdrop-blur-none sm:dark:bg-transparent">
            {loading ? (
              <IconLoader2 className="size-5 shrink-0 animate-spin text-gray-400" />
            ) : (
              <IconSearch className="size-5 shrink-0 text-gray-400" />
            )}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (results.length > 0) setOpen(true)
              }}
              placeholder="Busca negocios o servicios..."
              className="w-full bg-transparent py-1 text-[16px] text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500 sm:text-sm md:text-base"
            />
          </div>
          <Button
            type="submit"
            className="w-full shrink-0 rounded-full px-6 py-3 text-sm font-semibold sm:w-auto md:px-8 md:text-base"
            size="lg"
          >
            Buscar
          </Button>
        </div>
      </form>

      {/* Autocomplete dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border bg-popover shadow-xl">
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
              Ver todos los resultados
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
