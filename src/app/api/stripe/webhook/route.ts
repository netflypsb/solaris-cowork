import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-server";
import Stripe from "stripe";

const OPENROUTER_KEYS_URL = "https://openrouter.ai/api/v1/keys";

function getManagementKey(): string {
  const key = process.env.OPENROUTER_MANAGEMENT_API_KEY;
  if (!key) {
    throw new Error("OPENROUTER_MANAGEMENT_API_KEY is not configured");
  }
  return key;
}

// Auto-create OpenRouter API key for a user
async function provisionOpenRouterKey(clerkUserId: string): Promise<void> {
  // Check if user already has a key
  const { data: existing } = await supabaseAdmin
    .from("user_api_keys")
    .select("id")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (existing) {
    // Re-enable if disabled
    await supabaseAdmin
      .from("user_api_keys")
      .update({ is_active: true })
      .eq("clerk_user_id", clerkUserId);
    return;
  }

  // Create key via OpenRouter Management API
  const managementKey = getManagementKey();
  const keyName = `solaris-user-${clerkUserId.slice(0, 8)}`;

  const orResponse = await fetch(OPENROUTER_KEYS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${managementKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: keyName,
      limit: 7, // $7 credit limit per key
    }),
  });

  if (!orResponse.ok) {
    const errBody = await orResponse.text();
    console.error("OpenRouter API error in webhook:", {
      status: orResponse.status,
      body: errBody,
    });
    throw new Error(`Failed to create OpenRouter key: ${errBody}`);
  }

  const orData = await orResponse.json();
  const keyHash = orData.data?.hash || orData.hash;
  const keyLabel = orData.data?.label || orData.label;

  if (!keyHash) {
    console.error("Unexpected OpenRouter response:", orData);
    throw new Error("Unexpected response from OpenRouter");
  }

  // Store key metadata in Supabase
  const { error: insertError } = await supabaseAdmin
    .from("user_api_keys")
    .insert({
      clerk_user_id: clerkUserId,
      openrouter_key_hash: keyHash,
      openrouter_key_label: keyLabel || null,
      key_name: keyName,
      is_active: true,
      credit_limit: 7,
    });

  if (insertError) {
    console.error("Supabase insert error in webhook:", insertError);
    // Clean up the OpenRouter key
    await fetch(`${OPENROUTER_KEYS_URL}/${keyHash}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${managementKey}`,
        "Content-Type": "application/json",
      },
    });
    throw new Error("Failed to save key record");
  }

  console.log(`OpenRouter key provisioned for user ${clerkUserId}`);
}

// Disable OpenRouter API key for a user
async function disableOpenRouterKey(clerkUserId: string): Promise<void> {
  const { data } = await supabaseAdmin
    .from("user_api_keys")
    .select("openrouter_key_hash")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (!data) return;

  // Disable on OpenRouter
  const managementKey = getManagementKey();
  await fetch(`${OPENROUTER_KEYS_URL}/${data.openrouter_key_hash}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${managementKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ disabled: true }),
  });

  // Mark as inactive in Supabase
  await supabaseAdmin
    .from("user_api_keys")
    .update({ is_active: false })
    .eq("clerk_user_id", clerkUserId);

  console.log(`OpenRouter key disabled for user ${clerkUserId}`);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkUserId = session.metadata?.clerk_user_id;

        if (!clerkUserId) {
          console.error("No clerk_user_id in checkout session metadata");
          break;
        }

        // Get the subscription details
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        // Extract period from subscription items (newer API) or subscription level (older API)
        const subItem = subscription.items.data[0] as unknown as Record<string, unknown>;
        const subAny = subscription as unknown as Record<string, unknown>;
        const periodStart =
          (subItem?.current_period_start as number) ||
          (subAny.current_period_start as number) ||
          Math.floor(Date.now() / 1000);
        const periodEnd =
          (subItem?.current_period_end as number) ||
          (subAny.current_period_end as number) ||
          Math.floor(Date.now() / 1000);

        // Upsert subscription in Supabase
        await supabaseAdmin.from("subscriptions").upsert(
          {
            clerk_user_id: clerkUserId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0]?.price.id || null,
            status: subscription.status,
            current_period_start: new Date(
              periodStart * 1000
            ).toISOString(),
            current_period_end: new Date(
              periodEnd * 1000
            ).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          },
          { onConflict: "clerk_user_id" }
        );

        // Auto-provision OpenRouter key
        await provisionOpenRouterKey(clerkUserId);

        console.log(
          `Checkout completed for user ${clerkUserId}, subscription ${subscription.id}`
        );
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const clerkUserId = subscription.metadata?.clerk_user_id;

        if (!clerkUserId) {
          console.error("No clerk_user_id in subscription metadata");
          break;
        }

        const updSubItem = subscription.items.data[0] as unknown as Record<string, unknown>;
        const updSubAny = subscription as unknown as Record<string, unknown>;
        const updPeriodStart =
          (updSubItem?.current_period_start as number) ||
          (updSubAny.current_period_start as number) ||
          Math.floor(Date.now() / 1000);
        const updPeriodEnd =
          (updSubItem?.current_period_end as number) ||
          (updSubAny.current_period_end as number) ||
          Math.floor(Date.now() / 1000);

        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: subscription.status,
            current_period_start: new Date(
              updPeriodStart * 1000
            ).toISOString(),
            current_period_end: new Date(
              updPeriodEnd * 1000
            ).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            stripe_price_id: subscription.items.data[0]?.price.id || null,
          })
          .eq("stripe_subscription_id", subscription.id);

        // If subscription is no longer active, disable the key
        if (!["active", "trialing"].includes(subscription.status)) {
          await disableOpenRouterKey(clerkUserId);
        } else {
          // Re-enable if it was disabled
          await supabaseAdmin
            .from("user_api_keys")
            .update({ is_active: true })
            .eq("clerk_user_id", clerkUserId);
        }

        console.log(
          `Subscription updated for user ${clerkUserId}: ${subscription.status}`
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const clerkUserId = subscription.metadata?.clerk_user_id;

        if (!clerkUserId) {
          console.error("No clerk_user_id in subscription metadata");
          break;
        }

        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", subscription.id);

        await disableOpenRouterKey(clerkUserId);

        console.log(`Subscription canceled for user ${clerkUserId}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Look up user by customer ID
        const { data: sub } = await supabaseAdmin
          .from("subscriptions")
          .select("clerk_user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (sub) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_customer_id", customerId);

          console.log(`Payment failed for user ${sub.clerk_user_id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`Error handling webhook event ${event.type}:`, err);
    // Return 200 anyway to prevent Stripe from retrying on our logic errors
    // Stripe will retry on 5xx responses
  }

  return NextResponse.json({ received: true });
}
