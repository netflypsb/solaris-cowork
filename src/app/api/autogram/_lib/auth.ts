import { auth } from "@clerk/nextjs/server";

/**
 * Authenticate an Autogram API request using the existing Clerk auth.
 * Returns the Clerk userId (solaris_user_id) or throws/returns null.
 *
 * This uses the exact same pattern as other API routes in the project
 * (e.g., /api/openrouter-key, /api/user/subscription).
 */
export async function authenticateRequest(): Promise<string | null> {
  const { userId } = await auth();
  return userId || null;
}
