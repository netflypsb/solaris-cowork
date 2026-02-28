# Website Development Plan: Stripe + OpenRouter Integration

## Context
Clerk Billing is blocked (country restriction / Stripe account issue with Clerk).
Replace Clerk's `<PricingTable>` and `has({ feature: "api_access" })` with **direct Stripe Checkout** + Supabase `subscriptions` table.

**Keep:** Clerk for auth, Supabase for data, OpenRouter Management API for key provisioning.
**Replace:** Clerk Billing → Direct Stripe Checkout + Webhooks.
**Improve:** Auto-generate OpenRouter key on subscription (no manual button).

---

## Current Architecture (What Exists)
- `src/app/(marketing)/pricing/page.tsx` — Uses Clerk `<PricingTable />` (BROKEN)
- `src/app/(protected)/dashboard/api-key/page.tsx` — Manual key generation UI
- `src/app/api/openrouter-key/route.ts` — Key CRUD using `has({ feature: "api_access" })`
- `src/lib/supabase-server.ts` — Supabase admin client
- `src/middleware.ts` — Clerk route protection
- `supabase-schema.sql` — Has `user_api_keys` table
- `.env.local` — Has all keys (Clerk production, Supabase, OpenRouter management)

## Target Architecture
```
User signs up (Clerk) → User subscribes (Stripe Checkout) → Webhook fires →
  1. Supabase `subscriptions` row created (status: active)
  2. OpenRouter API key auto-generated via Management API
  3. Key hash stored in Supabase `user_api_keys`
→ User goes to /dashboard/api-key → sees their key info
→ Desktop app authenticates via Clerk → calls /api/user/subscription → gets key
```

---

## Development Steps (Ordered)

### STEP 1: Install stripe package
```bash
npm install stripe
```

### STEP 2: Create Supabase `subscriptions` table
File: `supabase-schema.sql` (append)

```sql
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_price_id VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'inactive',
  -- status: active, past_due, canceled, unpaid, incomplete, trialing
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_clerk_user_id ON subscriptions(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Service role full access (server-side only)
CREATE POLICY "Service role full access on subscriptions" ON subscriptions
  FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

Run this on Supabase dashboard SQL editor.

### STEP 3: Create Stripe helper library
File: `src/lib/stripe.ts`

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});

export const PRICE_ID = process.env.STRIPE_PRICE_ID!;
```

### STEP 4: Create Stripe Checkout API route
File: `src/app/api/stripe/checkout/route.ts`

Handles creating a Stripe Checkout Session for the logged-in Clerk user.
- Gets `userId` and `emailAddress` from Clerk auth
- Checks if user already has an active subscription in Supabase
- Creates or retrieves Stripe Customer (stores `stripe_customer_id` in subscriptions table)
- Creates Checkout Session with `mode: "subscription"`
- Returns checkout URL

### STEP 5: Create Stripe Webhook handler
File: `src/app/api/stripe/webhook/route.ts`

Handles these Stripe events:
- `checkout.session.completed` — Create/update subscription row, auto-generate OpenRouter key
- `customer.subscription.updated` — Update subscription status
- `customer.subscription.deleted` — Mark subscription canceled, disable OpenRouter key
- `invoice.payment_failed` — Mark subscription past_due

**Critical:** On `checkout.session.completed`:
1. Upsert `subscriptions` row with `status: 'active'`
2. Check if user already has an OpenRouter key in `user_api_keys`
3. If not, auto-create one via OpenRouter Management API ($7 limit)
4. Store key hash in `user_api_keys`

### STEP 6: Create Stripe Customer Portal API route
File: `src/app/api/stripe/portal/route.ts`

Allows users to manage their subscription (cancel, update payment method).
- Gets Clerk userId
- Looks up `stripe_customer_id` from subscriptions table
- Creates Stripe Billing Portal session
- Returns portal URL

### STEP 7: Create subscription check helper
File: `src/lib/subscription.ts`

```typescript
export async function getUserSubscription(clerkUserId: string) {
  const { data } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .single();
  return data;
}

export function isSubscriptionActive(subscription: any): boolean {
  if (!subscription) return false;
  return ["active", "trialing"].includes(subscription.status);
}
```

### STEP 8: Replace pricing page
File: `src/app/(marketing)/pricing/page.tsx`

Replace Clerk `<PricingTable />` with custom pricing UI:
- Shows Pro plan ($10/month)
- "Subscribe" button calls `/api/stripe/checkout` and redirects to Stripe Checkout
- For signed-in users with active subscription: show "Manage Subscription" button
- For signed-out users: redirect to sign-up first

### STEP 9: Update API key route
File: `src/app/api/openrouter-key/route.ts`

Replace `has({ feature: "api_access" })` with Supabase subscription check:
```typescript
// OLD:
const hasPlan = has({ feature: "api_access" });

// NEW:
const subscription = await getUserSubscription(userId);
const hasPlan = isSubscriptionActive(subscription);
```

Also update POST to be callable from webhook (for auto-generation).

### STEP 10: Create desktop app API endpoint
File: `src/app/api/user/subscription/route.ts`

Returns subscription status + OpenRouter key info for the desktop app:
```json
{
  "hasSubscription": true,
  "subscription": { "status": "active", "tier": "pro" },
  "apiKey": {
    "hasKey": true,
    "label": "sk-or-v1-abc...123",
    "isActive": true,
    "creditLimit": 7
  }
}
```

### STEP 11: Update dashboard/api-key page
File: `src/app/(protected)/dashboard/api-key/page.tsx`

- Remove `has({ feature: "api_access" })` check
- Replace with fetch to `/api/user/subscription`
- Remove manual "Generate API Key" button (keys are auto-generated)
- Keep "Revoke Key" and "Regenerate Key" functionality
- Add "Manage Subscription" link

### STEP 12: Update middleware
File: `src/middleware.ts`

Add new API routes to protected routes:
```typescript
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/subscription(.*)",
  "/credits(.*)",
  "/api/openrouter-key(.*)",
  "/api/stripe/checkout(.*)",
  "/api/stripe/portal(.*)",
  "/api/user/(.*)",
]);
```

**Note:** `/api/stripe/webhook` must NOT be protected (Stripe calls it).

### STEP 13: Update CSP headers
File: `next.config.mjs`

Add Stripe Checkout domain to frame-src and script-src if not already present.
Current CSP already includes Stripe domains — verify they're sufficient.

### STEP 14: Update Supabase schema file
File: `supabase-schema.sql`

Append the new `subscriptions` table DDL for documentation.

### STEP 15: Environment variables
Add to `.env.local` and Vercel:
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Files Changed Summary

| File | Action | Description |
|------|--------|-------------|
| `package.json` | MODIFY | Add `stripe` dependency |
| `src/lib/stripe.ts` | CREATE | Stripe client + config |
| `src/lib/subscription.ts` | CREATE | Subscription check helpers |
| `src/app/api/stripe/checkout/route.ts` | CREATE | Stripe Checkout Session |
| `src/app/api/stripe/webhook/route.ts` | CREATE | Stripe webhook handler (auto-generates OpenRouter key) |
| `src/app/api/stripe/portal/route.ts` | CREATE | Stripe Customer Portal |
| `src/app/api/user/subscription/route.ts` | CREATE | Desktop app subscription + key endpoint |
| `src/app/(marketing)/pricing/page.tsx` | MODIFY | Replace Clerk PricingTable with Stripe Checkout |
| `src/app/(protected)/dashboard/api-key/page.tsx` | MODIFY | Use subscription check, auto-generated key display |
| `src/app/api/openrouter-key/route.ts` | MODIFY | Replace `has()` with subscription check |
| `src/middleware.ts` | MODIFY | Add new protected routes |
| `supabase-schema.sql` | MODIFY | Add subscriptions table |
| `next.config.mjs` | MODIFY | Update CSP if needed |
| `.env.local` | MODIFY | Add Stripe env vars |

---

## Architecture Diagram

```
                    ┌─────────────┐
                    │   Clerk     │
                    │  (Auth)     │
                    └──────┬──────┘
                           │ userId, session
                    ┌──────▼──────┐
                    │  Next.js    │
                    │  Website    │
                    └──┬───┬───┬──┘
                       │   │   │
          ┌────────────┘   │   └────────────┐
          │                │                │
   ┌──────▼──────┐ ┌──────▼──────┐ ┌───────▼───────┐
   │   Stripe    │ │  Supabase   │ │  OpenRouter   │
   │ (Payments)  │ │   (Data)    │ │ (AI Keys)     │
   └─────────────┘ └─────────────┘ └───────────────┘
                           │
                    ┌──────▼──────┐
                    │ Desktop App │
                    │ (Electron)  │
                    └─────────────┘
```

## Flow: New User Subscription
1. User signs up via Clerk on website
2. User visits /pricing, clicks "Subscribe"
3. POST /api/stripe/checkout → returns Stripe Checkout URL
4. User completes payment on Stripe
5. Stripe sends `checkout.session.completed` webhook
6. Webhook handler:
   a. Creates/updates `subscriptions` row (status: active)
   b. Auto-creates OpenRouter API key ($7 limit)
   c. Stores key hash in `user_api_keys`
7. User visits /dashboard/api-key → sees their active key
8. User downloads desktop app → authenticates with Clerk → app calls /api/user/subscription → gets key info

## Flow: Subscription Cancellation
1. User cancels via Stripe Customer Portal
2. Stripe sends `customer.subscription.deleted` webhook
3. Webhook handler:
   a. Updates `subscriptions` row (status: canceled)
   b. Disables OpenRouter API key via Management API
   c. Updates `user_api_keys` (is_active: false)
4. Desktop app: next API call returns subscription inactive → shows upgrade prompt
