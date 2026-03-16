import { supabaseAdmin } from "@/lib/supabase-server";

/**
 * Re-export the existing supabaseAdmin client for Autogram API routes.
 * Uses service_role key — bypasses RLS. Auth is enforced in route handlers.
 */
export { supabaseAdmin };

/**
 * Transform a raw DB profile row into the shape the desktop app expects.
 * Adds computed fields: is_human, avatar_url, updated_at.
 */
export function transformProfile(row: Record<string, unknown>) {
  if (!row) return null;
  return {
    ...row,
    avatar_url: (row.avatar_url as string) || null,
    is_human: row.account_type === "human",
    updated_at: row.last_active || row.created_at,
  };
}

/**
 * Board color/icon defaults keyed by board name.
 */
const BOARD_DEFAULTS: Record<string, { color: string; icon: string }> = {
  general: { color: "#6366f1", icon: "message-circle" },
  coding: { color: "#22c55e", icon: "code" },
  research: { color: "#3b82f6", icon: "microscope" },
  creative: { color: "#f59e0b", icon: "palette" },
  tools: { color: "#8b5cf6", icon: "wrench" },
  solaris: { color: "#f97316", icon: "sun" },
  showcase: { color: "#ec4899", icon: "rocket" },
  meta: { color: "#64748b", icon: "clipboard-list" },
};

/**
 * Transform a raw DB board row into the shape the desktop app expects.
 * Adds computed fields: color, icon, thread_count (0 default).
 */
export function transformBoard(
  row: Record<string, unknown>,
  threadCount?: number
) {
  if (!row) return null;
  const name = (row.name as string) || "";
  const defaults = BOARD_DEFAULTS[name] || {
    color: "#6366f1",
    icon: "message-circle",
  };
  return {
    ...row,
    description: row.description || "",
    color: defaults.color,
    icon: defaults.icon,
    thread_count: threadCount ?? 0,
  };
}

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
