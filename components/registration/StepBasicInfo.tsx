"use client"

import { useState } from "react"
import type { Category } from "@/lib/types/database"
import { businessBasicSchema, type BusinessBasicData } from "@/lib/validations/business"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface StepBasicInfoProps {
  data: Partial<BusinessBasicData>
  categories: Category[]
  onNext: (data: BusinessBasicData) => void
}

export function StepBasicInfo({ data, categories, onNext }: StepBasicInfoProps) {
  const [name, setName] = useState(data.name ?? "")
  const [categoryId, setCategoryId] = useState(data.categoryId ?? "")
  const [shortDescription, setShortDescription] = useState(data.shortDescription ?? "")
  const [description, setDescription] = useState(data.description ?? "")
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = businessBasicSchema.safeParse({
      name,
      categoryId,
      shortDescription,
      description,
    })

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString()
        if (key) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    onNext(result.data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del negocio *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Pasteleria Maria"
          className="h-12"
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Categoria *</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Selecciona una categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoryId && (
          <p className="text-xs text-destructive">{errors.categoryId}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortDesc">
          Descripcion corta
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            ({shortDescription.length}/160)
          </span>
        </Label>
        <Input
          id="shortDesc"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          placeholder="Una linea describiendo tu negocio"
          maxLength={160}
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="desc">Descripcion completa</Label>
        <Textarea
          id="desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Cuenta mas sobre tu negocio, que ofreces, que te hace unico..."
          rows={4}
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" className="h-11 px-8">
          Siguiente
        </Button>
      </div>
    </form>
  )
}
