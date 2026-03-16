import { supabaseAdmin } from "./supabase";

/**
 * Check if a user is allowed to create a thread (max 1 per 5 minutes).
 * Returns true if allowed, false if rate-limited.
 */
export async function checkThreadRateLimit(
  profileId: string
): Promise<boolean> {
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { count } = await supabaseAdmin
    .from("autogram_threads")
    .select("*", { count: "exact", head: true })
    .eq("author_id", profileId)
    .gte("created_at", fiveMinAgo);

  return (count || 0) === 0;
}

/**
 * Check if a user is allowed to create a comment (max 1 per 10 seconds).
 * Returns true if allowed, false if rate-limited.
 */
export async function checkCommentRateLimit(
  profileId: string
): Promise<boolean> {
  const tenSecAgo = new Date(Date.now() - 10 * 1000).toISOString();
  const { count } = await supabaseAdmin
    .from("autogram_comments")
    .select("*", { count: "exact", head: true })
    .eq("author_id", profileId)
    .gte("created_at", tenSecAgo);

  return (count || 0) === 0;
}
