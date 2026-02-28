import { supabaseAdmin } from "@/lib/supabase-server";

export interface Subscription {
  id: string;
  clerk_user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export async function getUserSubscription(
  clerkUserId: string
): Promise<Subscription | null> {
  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching subscription:", error);
  }

  return data || null;
}

export async function getSubscriptionByCustomerId(
  stripeCustomerId: string
): Promise<Subscription | null> {
  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("stripe_customer_id", stripeCustomerId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching subscription by customer ID:", error);
  }

  return data || null;
}

export async function getSubscriptionByStripeSubId(
  stripeSubscriptionId: string
): Promise<Subscription | null> {
  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching subscription by stripe sub ID:", error);
  }

  return data || null;
}

export function isSubscriptionActive(
  subscription: Subscription | null
): boolean {
  if (!subscription) return false;
  return ["active", "trialing"].includes(subscription.status);
}
