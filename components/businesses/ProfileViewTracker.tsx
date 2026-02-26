"use client"

import { useEffect } from "react"
import { registerProfileView } from "@/app/actions/analytics"

type ProfileViewTrackerProps = {
  businessId: string
}

/**
 * Componente que registra automáticamente una vista al perfil
 * cuando el usuario visita la página del negocio
 */
export function ProfileViewTracker({ businessId }: ProfileViewTrackerProps) {
  useEffect(() => {
    // Registrar vista al cargar el componente
    registerProfileView(businessId).catch((error) => {
      console.error("Error tracking profile view:", error)
    })
  }, [businessId])

  // Este componente no renderiza nada
  return null
}
