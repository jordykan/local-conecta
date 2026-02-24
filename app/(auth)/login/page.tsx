"use client"

import { Suspense, useActionState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { IconBrandGoogle, IconMail, IconLock } from "@tabler/icons-react"
import { sileo } from "sileo"
import { login, loginWithGoogle } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/"
  const authError = searchParams.get("error")
  const shownAuthError = useRef(false)

  const [state, formAction, pending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      formData.set("next", next)
      const result = await login(formData)
      return result ?? null
    },
    null,
  )

  useEffect(() => {
    if (authError && !shownAuthError.current) {
      shownAuthError.current = true
      sileo.error({
        title: "Error de autenticacion",
        description:
          authError === "google"
            ? "No se pudo conectar con Google. Intenta de nuevo."
            : "Error al iniciar sesion. Intenta de nuevo.",
      })
    }
  }, [authError])

  useEffect(() => {
    if (state?.error) {
      sileo.error({
        title: "No se pudo iniciar sesion",
        description: state.error,
      })
    }
  }, [state])

  return (
    <>
      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground/80">
            Correo electronico
          </Label>
          <div className="relative">
            <IconMail className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground/60" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              required
              autoComplete="email"
              className="h-12 pl-11 text-[15px] shadow-sm transition-shadow focus:shadow-md"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground/80">
            Contrasena
          </Label>
          <div className="relative">
            <IconLock className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground/60" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              minLength={8}
              className="h-12 pl-11 text-[15px] shadow-sm transition-shadow focus:shadow-md"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="h-12 w-full text-[15px] font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/25"
          disabled={pending}
        >
          {pending ? (
            <span className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              Ingresando...
            </span>
          ) : (
            "Iniciar sesion"
          )}
        </Button>
      </form>

      <div className="my-7 flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-xs font-medium tracking-wide text-muted-foreground/60 uppercase">
          o continua con
        </span>
        <Separator className="flex-1" />
      </div>

      <form action={loginWithGoogle}>
        <Button
          type="submit"
          variant="outline"
          className="h-12 w-full text-[15px] font-medium shadow-sm transition-all hover:shadow-md"
        >
          <IconBrandGoogle className="mr-2.5 size-5" />
          Google
        </Button>
      </form>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        No tienes cuenta?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary underline-offset-4 transition-colors hover:underline"
        >
          Crea una aqui
        </Link>
      </p>
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Bienvenido de vuelta
        </h1>
        <p className="text-[15px] text-muted-foreground">
          Ingresa tus datos para acceder a tu cuenta
        </p>
      </div>

      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}
