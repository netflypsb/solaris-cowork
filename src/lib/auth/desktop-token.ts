import { supabaseAdmin } from "@/lib/supabase-server";
import crypto from "crypto";

const TOKEN_EXPIRY_MINUTES = 5;

export async function createDesktopToken(userId: string): Promise<string> {
  // Generate a cryptographically secure random token
  const token = crypto.randomBytes(32).toString("hex");

  // Calculate expiry (5 minutes from now)
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

  // Store in database
  const { error } = await supabaseAdmin.from("desktop_auth_tokens").insert({
    clerk_user_id: userId,
    token,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    console.error("[Desktop Token] Error creating token:", error);
    throw new Error("Failed to create desktop auth token");
  }

  return token;
}
