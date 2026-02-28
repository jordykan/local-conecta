import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Check origin header for security
  const origin = request.headers.get("origin");

  // Sign out from Supabase
  await supabase.auth.signOut();

  // Revalidate the root layout to clear cached user data
  revalidatePath("/", "layout");

  // Redirect to home page
  return NextResponse.redirect(new URL("/", origin || request.url), {
    status: 303,
  });
}
