"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

const AUTH_ERRORS: Record<string, string> = {
  "Invalid login credentials":
    "Correo o contrasena incorrectos. Verifica tus datos.",
  "Email not confirmed":
    "Tu correo aun no ha sido confirmado. Revisa tu bandeja de entrada.",
  "User already registered":
    "Ya existe una cuenta con este correo electronico.",
  "Password should be at least 6 characters":
    "La contrasena debe tener al menos 6 caracteres.",
  "Signup requires a valid password":
    "Debes ingresar una contrasena valida.",
  "User not found": "No se encontro una cuenta con este correo.",
  "Email rate limit exceeded":
    "Demasiados intentos. Espera unos minutos e intenta de nuevo.",
  "For security purposes, you can only request this after":
    "Por seguridad, debes esperar antes de intentarlo de nuevo.",
}

function translateError(message: string): string {
  for (const [key, translation] of Object.entries(AUTH_ERRORS)) {
    if (message.includes(key)) return translation
  }
  return "Ocurrio un error inesperado. Intenta de nuevo."
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: translateError(error.message) }
  }

  const next = formData.get("next") as string
  redirect(next || "/")
}

export async function register(formData: FormData) {
  const supabase = await createClient()

  const fullName = formData.get("fullName") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return { error: translateError(error.message) }
  }

  redirect("/")
}

export async function loginWithGoogle(_formData: FormData) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    redirect("/login?error=google")
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}
