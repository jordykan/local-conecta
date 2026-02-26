"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  IconBrandGoogle,
  IconMail,
  IconLock,
  IconUser,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { register, loginWithGoogle } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function GoogleSignInButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="outline"
      className="h-12 w-full text-[15px] font-medium shadow-sm transition-all hover:shadow-md"
      disabled={pending}
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
          Conectando...
        </span>
      ) : (
        <>
          <IconBrandGoogle className="mr-2.5 size-5" />
          Google
        </>
      )}
    </Button>
  );
}

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      const result = await register(formData);
      return result ?? null;
    },
    null,
  );

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Crea tu cuenta
        </h1>
        <p className="text-[15px] text-muted-foreground">
          Unete para descubrir los negocios de tu comunidad
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-foreground/80">
            Nombre completo
          </Label>
          <div className="relative">
            <IconUser className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground/60" />
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Tu nombre"
              required
              autoComplete="name"
              className="h-12 pl-11 text-[15px] shadow-sm transition-shadow focus:shadow-md"
            />
          </div>
        </div>

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
              placeholder="Minimo 8 caracteres"
              required
              autoComplete="new-password"
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
              Creando cuenta...
            </span>
          ) : (
            "Crear cuenta"
          )}
        </Button>
      </form>

      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-xs font-medium tracking-wide text-muted-foreground/60 uppercase">
          o continua con
        </span>
        <Separator className="flex-1" />
      </div>

      <form action={loginWithGoogle}>
        <GoogleSignInButton />
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Al registrarte aceptas nuestros{" "}
        <Link
          href="/terms"
          className="text-foreground/70 underline underline-offset-4 transition-colors hover:text-foreground"
        >
          terminos
        </Link>{" "}
        y{" "}
        <Link
          href="/privacy"
          className="text-foreground/70 underline underline-offset-4 transition-colors hover:text-foreground"
        >
          privacidad
        </Link>
      </p>

      <p className="text-center text-sm text-muted-foreground">
        Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary underline-offset-4 transition-colors hover:underline"
        >
          Inicia sesion
        </Link>
      </p>
    </div>
  );
}
