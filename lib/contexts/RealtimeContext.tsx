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
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Monitor connection status
    const channel = supabase.channel("system")

    channel
      .on("system", { event: "*" }, () => {
        setIsConnected(true)
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true)
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          setIsConnected(false)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
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
