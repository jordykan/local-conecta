"use client"

import { useState, useRef } from "react"
import { IconUpload, IconX, IconPhoto } from "@tabler/icons-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  bucket: string
  path: string
  currentUrl?: string | null
  onChange: (url: string | null) => void
  label: string
  className?: string
  aspect?: "square" | "video"
}

const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export function ImageUpload({
  bucket,
  path,
  currentUrl,
  onChange,
  label,
  className,
  aspect = "square",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    if (file.size > MAX_SIZE) {
      setError("La imagen no puede superar 5MB")
      return
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Solo se permiten imagenes JPG, PNG o WebP")
      return
    }

    // Show local preview
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    setUploading(true)

    try {
      const supabase = createClient()
      const ext = file.name.split(".").pop() ?? "jpg"
      const filePath = `${path}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
      onChange(data.publicUrl)
    } catch {
      setError("Error al subir la imagen. Intenta de nuevo.")
      setPreview(currentUrl ?? null)
      onChange(null)
    } finally {
      setUploading(false)
    }
  }

  function handleRemove() {
    setPreview(null)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium text-foreground/80">{label}</p>

      {preview ? (
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border border-border/60",
            aspect === "video" ? "aspect-video" : "aspect-square w-32"
          )}
        >
          <img
            src={preview}
            alt={label}
            className="size-full object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="size-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
          )}
          {!uploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
            >
              <IconX className="size-4" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/30 transition-colors hover:bg-muted/50",
            aspect === "video"
              ? "aspect-video w-full"
              : "aspect-square w-32"
          )}
        >
          <IconPhoto className="size-6 text-muted-foreground/60" />
          <span className="text-xs text-muted-foreground">Subir imagen</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        className="hidden"
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
