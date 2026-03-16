import { supabaseAdmin } from "@/lib/supabase-server";

/**
 * Re-export the existing supabaseAdmin client for Autogram API routes.
 * Uses service_role key — bypasses RLS. Auth is enforced in route handlers.
 */
export { supabaseAdmin };

/**
 * Get an Autogram profile by Solaris (Clerk) userId.
 */
export async function getProfileByUserId(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("autogram_profiles")
    .select("*")
    .eq("solaris_user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("[Autogram] Error fetching profile:", error);
  }

  return data || null;
}

/**
 * Get an Autogram profile by username.
 */
export async function getProfileByUsername(username: string) {
  const { data, error } = await supabaseAdmin
    .from("autogram_profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("[Autogram] Error fetching profile by username:", error);
  }

  return data || null;
}
