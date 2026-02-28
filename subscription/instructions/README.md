# Manual Setup Instructions

These are the manual steps that cannot be automated via code. Follow them in order.

---

## PART 1: Stripe Setup

### 1.1 Create Stripe Account (if not already done)
1. Go to https://dashboard.stripe.com/
2. Sign up or log in
3. Complete business verification if prompted
4. Make sure you're in **Live mode** (toggle at top-left of dashboard)

### 1.2 Create Product & Price
1. Go to https://dashboard.stripe.com/products
2. Click **"+ Add product"**
3. Fill in:
   - **Name**: `Solaris Pro`
   - **Description**: `AI-powered workspace with OpenRouter API access`
4. Under **Pricing**:
   - **Pricing model**: Standard pricing
   - **Price**: `$10.00`
   - **Billing period**: `Monthly`
   - **Currency**: USD
5. Click **"Save product"**
6. After saving, click on the price to view its details
7. Copy the **Price ID** (starts with `price_`) — you'll need this for `STRIPE_PRICE_ID`

### 1.3 Get API Keys
1. Go to https://dashboard.stripe.com/apikeys
2. Copy the **Publishable key** (starts with `pk_live_`) → `STRIPE_PUBLISHABLE_KEY`
3. Copy the **Secret key** (starts with `sk_live_`) → `STRIPE_SECRET_KEY`
   - You may need to click "Reveal live key" and confirm

### 1.4 Set Up Webhook
1. Go to https://dashboard.stripe.com/webhooks
2. Click **"+ Add endpoint"**
3. Set **Endpoint URL**: `https://solaris-ai.xyz/api/stripe/webhook`
4. Under **"Select events to listen to"**, click **"Select events"** and add:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. On the webhook details page, click **"Reveal"** under Signing secret
7. Copy the **Webhook signing secret** (starts with `whsec_`) → `STRIPE_WEBHOOK_SECRET`

### 1.5 Configure Stripe Customer Portal
1. Go to https://dashboard.stripe.com/settings/billing/portal
2. Enable the customer portal
3. Configure allowed actions:
   - ✅ Allow customers to update payment methods
   - ✅ Allow customers to cancel subscriptions
   - ✅ Allow customers to view invoices
4. Set cancellation behavior:
   - Cancel at end of billing period (recommended)
5. Click **"Save"**

---

## PART 2: Environment Variables

### 2.1 Update .env.local
Add these to `C:\Users\netfl\Desktop\solaris-cowork-website\.env.local`:

```env
# Stripe (Live mode)
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY
STRIPE_PRICE_ID=price_YOUR_PRICE_ID
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

### 2.2 Update Vercel Environment Variables
1. Go to https://vercel.com/netflyps-projects/solaris-cowork/settings/environment-variables
2. Add the following variables for **Production**, **Preview**, and **Development**:

| Variable | Value | Notes |
|----------|-------|-------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | Stripe live secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Stripe live publishable key |
| `STRIPE_PRICE_ID` | `price_...` | The Pro plan price ID |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Webhook signing secret |
| `OPENROUTER_MANAGEMENT_API_KEY` | (already set) | Verify it exists |
| `SUPABASE_SERVICE_ROLE_KEY` | (already set) | Verify it exists |
| `NEXT_PUBLIC_APP_URL` | `https://solaris-ai.xyz` | Your domain |

3. After adding, click **"Redeploy"** to apply the new variables

### 2.3 Verify Existing Variables
Make sure these are still set correctly on Vercel:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — production Clerk key
- `CLERK_SECRET_KEY` — production Clerk secret
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTER_MANAGEMENT_API_KEY`

---

## PART 3: Supabase Database Setup

### 3.1 Create Subscriptions Table
1. Go to https://supabase.com/dashboard/project/rumjuelpsaqhwcxqwtgn/sql/new
2. Run the following SQL:

```sql
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_price_id VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'inactive',
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

CREATE POLICY "Service role full access on subscriptions" ON subscriptions
  FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

3. Click **"Run"**
4. Verify the table was created in the Table Editor

---

## PART 4: Clerk Configuration

### 4.1 Verify Production Mode
1. Go to https://dashboard.clerk.com/
2. Select your application
3. Verify you're viewing the **Production** instance (not Development)
4. Go to **Configure** → **Domains**
5. Ensure `solaris-ai.xyz` is listed as an allowed domain

### 4.2 Configure Allowed Redirect URLs (for Desktop App)
1. Go to **Configure** → **Paths**
2. Under **Redirect URLs**, add:
   - `https://solaris-ai.xyz/auth/desktop`
   - `https://solaris-ai.xyz/auth/desktop/callback`

### 4.3 Disable Clerk Billing (Optional Cleanup)
Since we're replacing Clerk Billing with direct Stripe:
1. Go to **Billing** in Clerk Dashboard
2. If there are active plans, consider disabling them to avoid confusion
3. The `<PricingTable>` component will be removed from code

### 4.4 Set Up Clerk Webhook for User Sync (Optional)
If you want to auto-create subscription rows when users sign up:
1. Go to **Webhooks** in Clerk Dashboard
2. Add endpoint: `https://solaris-ai.xyz/api/webhooks/clerk`
3. Select events: `user.created`, `user.deleted`

---

## PART 5: DNS & Domain (Already Done)
Verify:
- `solaris-ai.xyz` → points to Vercel
- SSL certificate is active
- Vercel project domain settings include `solaris-ai.xyz`

---

## PART 6: Testing Checklist

### 6.1 Test Stripe Checkout
1. Visit `https://solaris-ai.xyz/pricing`
2. Click "Subscribe"
3. Complete payment with a real card (or use Stripe test mode first)
4. Verify:
   - [ ] Stripe Checkout loads correctly
   - [ ] Payment completes
   - [ ] Redirected back to website

### 6.2 Test Webhook
1. After payment, check:
   - [ ] Supabase `subscriptions` table has a new row with `status: 'active'`
   - [ ] Supabase `user_api_keys` table has a new row
   - [ ] OpenRouter dashboard shows the new API key

### 6.3 Test Dashboard
1. Visit `https://solaris-ai.xyz/dashboard/api-key`
2. Verify:
   - [ ] Shows active subscription status
   - [ ] Shows API key info (label, credit limit)
   - [ ] "Manage Subscription" link works

### 6.4 Test Subscription Cancellation
1. Click "Manage Subscription" → Stripe Customer Portal
2. Cancel the subscription
3. Verify:
   - [ ] Supabase `subscriptions` row updated to `status: 'canceled'`
   - [ ] OpenRouter key disabled

### 6.5 Test Desktop App API
1. Using curl or Postman, test:
```bash
# Get subscription status (replace TOKEN with a valid desktop token)
curl -H "Authorization: Bearer TOKEN" https://solaris-ai.xyz/api/user/subscription
```
2. Verify response includes subscription status and API key info

---

## PART 7: Stripe Test Mode (Recommended First)

Before going live, test everything in Stripe test mode:

1. Toggle to **Test mode** in Stripe Dashboard
2. Use test API keys (`sk_test_...`, `pk_test_...`)
3. Create a test product & price
4. Set up test webhook endpoint (same URL)
5. Use test card number: `4242 4242 4242 4242`, any future expiry, any CVC
6. Verify the full flow works
7. Then switch to live keys

---

## PART 8: Desktop App Manual Setup

### 8.1 Protocol Registration (Windows)
The Electron app should register `solaris://` protocol automatically.
If manual registration is needed:

**Windows Registry (auto-done by Electron):**
```
HKEY_CURRENT_USER\Software\Classes\solaris
  (Default) = "URL:Solaris Protocol"
  URL Protocol = ""
  shell\open\command
    (Default) = "C:\path\to\solaris-desktop.exe" "%1"
```

### 8.2 Desktop App Environment
Create a config file or use environment variables in the desktop app:
```env
SOLARIS_API_URL=https://solaris-ai.xyz
CLERK_PUBLISHABLE_KEY=pk_live_... (same as website)
```

### 8.3 Code Signing (For Distribution)
For Windows distribution:
1. Get a code signing certificate (e.g., from Sectigo, DigiCert)
2. Configure electron-builder with the certificate
3. This prevents "Unknown publisher" warnings

---

## Order of Operations

1. ✅ Stripe account & product setup (PART 1)
2. ✅ Environment variables (PART 2)
3. ✅ Supabase table (PART 3)
4. ✅ Clerk configuration (PART 4)
5. 🔨 Website code changes (see website-plan/README.md)
6. 🧪 Test in Stripe test mode (PART 7)
7. 🚀 Switch to Stripe live mode
8. 🔨 Desktop app development (see desktop-app-plan/README.md)
9. 🧪 Test full flow
10. 🚀 Release desktop app

---

## Troubleshooting

### Webhook not receiving events
- Verify endpoint URL is correct: `https://solaris-ai.xyz/api/stripe/webhook`
- Check Stripe Dashboard → Webhooks → Recent events for errors
- Ensure the webhook route is NOT protected by Clerk middleware
- Check Vercel function logs for errors

### OpenRouter key not created
- Check Vercel function logs for the webhook handler
- Verify `OPENROUTER_MANAGEMENT_API_KEY` is set in Vercel env vars
- Test the management API key manually:
  ```bash
  curl -H "Authorization: Bearer sk-or-v1-YOUR_KEY" https://openrouter.ai/api/v1/keys
  ```

### Subscription status not updating
- Check Supabase table directly
- Verify webhook events are being sent (Stripe Dashboard → Webhooks)
- Check that `STRIPE_WEBHOOK_SECRET` matches the endpoint's signing secret

### Desktop app auth not working
- Verify `solaris://` protocol is registered
- Check that the website's `/auth/desktop` page is accessible
- Test the callback URL manually in browser: `solaris://auth/callback?token=test`
