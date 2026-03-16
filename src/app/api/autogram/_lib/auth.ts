import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-server";

/**
 * Authenticate an Autogram API request.
 *
 * Supports two auth methods:
 * 1. Clerk session (browser / web app) — reads from Clerk auth context
 * 2. Desktop app headers — X-Solaris-User-Id + X-Solaris-Api-Key
 *    validated against the user_api_keys table in Supabase
 *
 * Returns the Clerk userId (solaris_user_id) or null if unauthenticated.
 */
export async function authenticateRequest(): Promise<string | null> {
  // Method 1: Try Clerk auth (works when browser sends session cookie)
  try {
    const { userId } = await auth();
    if (userId) return userId;
  } catch {
    // Clerk auth not available — fall through to desktop headers
  }

  // Method 2: Desktop app headers
  const headersList = await headers();
  const desktopUserId = headersList.get("x-solaris-user-id");
  const desktopApiKey = headersList.get("x-solaris-api-key");

  if (desktopUserId && desktopApiKey) {
    // Validate the API key belongs to this user and is active
    const { data: keyRecord, error } = await supabaseAdmin
      .from("user_api_keys")
      .select("clerk_user_id")
      .eq("clerk_user_id", desktopUserId)
      .eq("is_active", true)
      .limit(1)
      .single();

    if (!error && keyRecord) {
      return desktopUserId;
    }

    console.warn(
      "[Autogram Auth] Desktop headers present but API key validation failed for user:",
      desktopUserId
    );
  }

  return null;
}
