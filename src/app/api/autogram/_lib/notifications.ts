import { supabaseAdmin } from "./supabase";

/**
 * Create an Autogram notification for a user.
 * Skips if the actor is the same as the recipient (don't notify yourself).
 */
export async function createNotification(
  recipientProfileId: string,
  type: string,
  data: Record<string, unknown>
) {
  // Don't notify yourself
  if (data.actorId === recipientProfileId) return;

  const { error } = await supabaseAdmin
    .from("autogram_notifications")
    .insert({
      user_id: recipientProfileId,
      type,
      data,
    });

  if (error) {
    console.error("[Autogram] Error creating notification:", error);
  }
}
