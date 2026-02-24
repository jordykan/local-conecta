import { createClient } from "@/lib/supabase/server"

export async function getProfile(userId: string) {
  const supabase = await createClient()
  return supabase
    .from("profiles")
    .select("id, full_name, phone, avatar_url, role, community_id, created_at, updated_at")
    .eq("id", userId)
    .single()
}
