"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types/database"

type RealtimeContextType = {
  supabase: SupabaseClient<Database>
  isConnected: boolean
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(
  undefined
)

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient())
  const [isConnected, setIsConnected] = useState(true) // Assume connected by default

  useEffect(() => {
    // Log Realtime connection info
    console.log("[Realtime] Provider initialized")

    // Simple connection check
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id")
          .limit(1)

        if (!error) {
          console.log("[Realtime] Supabase client connected")
          setIsConnected(true)
        } else {
          console.error("[Realtime] Connection error:", error)
          setIsConnected(false)
        }
      } catch (err) {
        console.error("[Realtime] Connection check failed:", err)
        setIsConnected(false)
      }
    }

    checkConnection()
  }, [supabase])

  return (
    <RealtimeContext.Provider value={{ supabase, isConnected }}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtimeContext() {
  const context = useContext(RealtimeContext)
  if (context === undefined) {
    throw new Error("useRealtimeContext must be used within a RealtimeProvider")
  }
  return context
}
