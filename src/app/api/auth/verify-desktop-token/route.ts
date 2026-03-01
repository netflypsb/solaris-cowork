import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getUserSubscription, isSubscriptionActive } from "@/lib/subscription";
import { supabaseAdmin } from "@/lib/supabase-server";

// Verify a desktop token and return session info + OpenRouter key
// This is the primary endpoint the desktop app uses after authentication
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    // Parse token
    const parts = token.split(".");
    if (parts.length !== 2) {
      return NextResponse.json({ error: "Invalid token format" }, { status: 401 });
    }

    const [payloadStr, signature] = parts;

    // Verify signature
    const secret = process.env.DESKTOP_AUTH_SECRET || process.env.CLERK_SECRET_KEY!;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payloadStr)
      .digest("base64url");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Parse payload
    const payload = JSON.parse(
      Buffer.from(payloadStr, "base64url").toString("utf-8")
    );

    // Check expiry
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }

    // Get subscription status
    const subscription = await getUserSubscription(payload.sub);
    const active = isSubscriptionActive(subscription);

    // Get OpenRouter API key if subscription is active
    let apiKey = null;
    if (active) {
      const { data: keyData } = await supabaseAdmin
        .from("user_api_keys")
        .select("openrouter_key_full, openrouter_key_label, key_name, is_active, credit_limit")
        .eq("clerk_user_id", payload.sub)
        .eq("is_active", true)
        .single();

      if (keyData) {
        apiKey = {
          key: keyData.openrouter_key_full,
          label: keyData.openrouter_key_label,
          name: keyData.key_name,
          creditLimit: keyData.credit_limit,
        };
      }
    }

    return NextResponse.json({
      valid: true,
      userId: payload.sub,
      email: payload.email,
      hasSubscription: active,
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
  } catch (err) {
    console.error("Token verification error:", err);
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 401 }
    );
  }
}
