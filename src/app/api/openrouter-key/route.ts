import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getUserSubscription, isSubscriptionActive } from "@/lib/subscription";

export const dynamic = "force-dynamic";

const OPENROUTER_KEYS_URL = "https://openrouter.ai/api/v1/keys";

function getManagementKey(): string {
  const key = process.env.OPENROUTER_MANAGEMENT_API_KEY;
  if (!key) {
    throw new Error("OPENROUTER_MANAGEMENT_API_KEY is not configured");
  }
  return key;
}

// GET — Check if the current user already has an API key
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await getUserSubscription(userId);
    if (!isSubscriptionActive(subscription)) {
      return NextResponse.json(
        { error: "Active subscription required" },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("user_api_keys")
      .select("*")
      .eq("clerk_user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch key info" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ hasKey: false });
    }

    return NextResponse.json({
      hasKey: true,
      key: {
        id: data.id,
        label: data.openrouter_key_label,
        name: data.key_name,
        isActive: data.is_active,
        creditLimit: data.credit_limit,
        createdAt: data.created_at,
      },
    });
  } catch (err) {
    console.error("GET /api/openrouter-key error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST — Generate a new OpenRouter API key for the paid user
export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await getUserSubscription(userId);
    if (!isSubscriptionActive(subscription)) {
      return NextResponse.json(
        { error: "Active subscription required" },
        { status: 403 }
      );
    }

    // Check if user already has a key
    const { data: existing } = await supabaseAdmin
      .from("user_api_keys")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "You already have an API key. Delete it first to generate a new one." },
        { status: 409 }
      );
    }

    // Create key via OpenRouter Management API
    const managementKey = getManagementKey();
    const keyName = `solaris-user-${userId.slice(0, 8)}`;

    const orResponse = await fetch(OPENROUTER_KEYS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${managementKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: keyName,
        limit: 7, // $7 credit limit per key (your business margin)
      }),
    });

    if (!orResponse.ok) {
      const errBody = await orResponse.text();
      console.error("OpenRouter API error:", {
        status: orResponse.status,
        statusText: orResponse.statusText,
        body: errBody,
        url: OPENROUTER_KEYS_URL,
        managementKeyPresent: !!managementKey,
        managementKeyPrefix: managementKey.slice(0, 10) + "..."
      });
      return NextResponse.json(
        { error: "Failed to create API key with OpenRouter", details: errBody },
        { status: 502 }
      );
    }

    const orData = await orResponse.json();

    // The response contains the key string and hash
    // key string is only available at creation time
    const keyString = orData.data?.key || orData.key;
    const keyHash = orData.data?.hash || orData.hash;
    const keyLabel = orData.data?.label || orData.label;

    if (!keyHash) {
      console.error("Unexpected OpenRouter response:", orData);
      return NextResponse.json(
        { error: "Unexpected response from OpenRouter" },
        { status: 502 }
      );
    }

    // Store key metadata in Supabase
    const { error: insertError } = await supabaseAdmin
      .from("user_api_keys")
      .insert({
        clerk_user_id: userId,
        openrouter_key_hash: keyHash,
        openrouter_key_label: keyLabel || null,
        key_name: keyName,
        is_active: true,
        credit_limit: 7,
      });

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      // Try to clean up the OpenRouter key
      await fetch(`${OPENROUTER_KEYS_URL}/${keyHash}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${managementKey}`,
          "Content-Type": "application/json",
        },
      });
      return NextResponse.json(
        { error: "Failed to save key record" },
        { status: 500 }
      );
    }

    // Return the key string — this is the ONLY time the user will see it
    return NextResponse.json({
      success: true,
      apiKey: keyString,
      label: keyLabel,
      message:
        "Save this key now! It will not be shown again.",
    });
  } catch (err) {
    console.error("POST /api/openrouter-key error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE — Revoke and delete the user's API key
export async function DELETE() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await getUserSubscription(userId);
    if (!isSubscriptionActive(subscription)) {
      return NextResponse.json(
        { error: "Active subscription required" },
        { status: 403 }
      );
    }

    // Get the stored key hash
    const { data, error } = await supabaseAdmin
      .from("user_api_keys")
      .select("openrouter_key_hash")
      .eq("clerk_user_id", userId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "No API key found" },
        { status: 404 }
      );
    }

    // Delete from OpenRouter
    const managementKey = getManagementKey();
    await fetch(`${OPENROUTER_KEYS_URL}/${data.openrouter_key_hash}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${managementKey}`,
        "Content-Type": "application/json",
      },
    });

    // Delete from Supabase
    const { error: deleteError } = await supabaseAdmin
      .from("user_api_keys")
      .delete()
      .eq("clerk_user_id", userId);

    if (deleteError) {
      console.error("Supabase delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete key record" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "API key revoked and deleted" });
  } catch (err) {
    console.error("DELETE /api/openrouter-key error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
