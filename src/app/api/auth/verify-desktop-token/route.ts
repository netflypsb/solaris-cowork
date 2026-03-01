import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getUserSubscription, isSubscriptionActive } from "@/lib/subscription";

// Verify a one-time desktop token and return user data + API key
// Called by the desktop app after receiving the token via deep link
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // 1. Look up the token in the database
    const { data: tokenRecord, error: tokenError } = await supabaseAdmin
      .from("desktop_auth_tokens")
      .select("*")
      .eq("token", token)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (tokenError || !tokenRecord) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // 2. Mark token as used (one-time use)
    await supabaseAdmin
      .from("desktop_auth_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", tokenRecord.id);

    const userId = tokenRecord.clerk_user_id;

    // 3. Get user info from Clerk
    let email = "";
    try {
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(userId);
      email = user.emailAddresses?.[0]?.emailAddress || "";
    } catch (err) {
      console.error("[Verify Token] Error fetching Clerk user:", err);
    }

    // 4. Get subscription status
    const subscription = await getUserSubscription(userId);
    const hasSubscription = isSubscriptionActive(subscription);

    // 5. Get OpenRouter API key if subscription is active
    let apiKey = null;
    if (hasSubscription) {
      const { data: keyData } = await supabaseAdmin
        .from("user_api_keys")
        .select(
          "openrouter_key_full, openrouter_key_label, key_name, credit_limit"
        )
        .eq("clerk_user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (keyData) {
        apiKey = {
          key: keyData.openrouter_key_full,
          label: keyData.openrouter_key_label || "Solaris Key",
          name: keyData.key_name || "OpenRouter",
          creditLimit: keyData.credit_limit || 0,
        };
      }
    }

    // 6. Return everything the desktop app needs in a single response
    return NextResponse.json({
      valid: true,
      userId,
      email,
      hasSubscription,
      subscription: subscription
        ? {
            status: subscription.status,
            tier: "pro",
            currentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          }
        : null,
      apiKey,
    });
  } catch (error) {
    console.error("[Verify Token] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
