import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getUserSubscription, isSubscriptionActive } from "@/lib/subscription";

export const dynamic = "force-dynamic";

// GET — Returns subscription status + API key info
// Used by both the website dashboard and the desktop app
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get subscription
    const subscription = await getUserSubscription(userId);
    const active = isSubscriptionActive(subscription);

    // Get API key info
    const { data: keyData } = await supabaseAdmin
      .from("user_api_keys")
      .select("*")
      .eq("clerk_user_id", userId)
      .single();

    return NextResponse.json({
      hasSubscription: active,
      subscription: subscription
        ? {
            status: subscription.status,
            tier: "pro",
            currentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          }
        : null,
      apiKey: keyData
        ? {
            hasKey: true,
            label: keyData.openrouter_key_label,
            name: keyData.key_name,
            isActive: keyData.is_active,
            creditLimit: keyData.credit_limit,
            createdAt: keyData.created_at,
          }
        : { hasKey: false },
    });
  } catch (err) {
    console.error("GET /api/user/subscription error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
