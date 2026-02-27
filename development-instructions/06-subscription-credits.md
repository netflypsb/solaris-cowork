# 06 — Subscription & Credit System

## Overview

Solaris uses a **$10/month subscription** with a **credit-based usage system**. Clerk Billing handles subscription management and payment processing (via Stripe). Credits are tracked in Clerk user metadata and optionally in a PostgreSQL database for detailed usage history.

---

## 1. Subscription Plans

### Plan Definitions

| | Free | Solaris Pro |
|---|---|---|
| **Price** | $0/mo | $10/mo ($96/yr) |
| **Credits** | 50/month | 1,000/month |
| **AI Chat** | Basic | Full (all models) |
| **Hubs** | Limited | All 5 hubs |
| **Skills** | 10 built-in | All 170+ |
| **MCP Connectors** | 2 max | Unlimited |
| **Sandbox** | — | Full access |
| **Browser Automation** | — | Full access |
| **Support** | Community | Priority |

### Plan Configuration

**File**: `packages/common/src/subscriptions.ts`

```typescript
export interface Plan {
  id: 'free' | 'pro';
  name: string;
  description: string;
  price: { monthly: number; yearly: number };
  credits: number;
  clerkPlanId?: string;
  features: string[];
  limits: {
    maxConnectors: number;
    sandboxAccess: boolean;
    browserAccess: boolean;
    allSkills: boolean;
    allHubs: boolean;
  };
}

export const PLANS: Record<string, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Get started with basic AI features',
    price: { monthly: 0, yearly: 0 },
    credits: 50,
    features: [
      '50 credits per month',
      'Basic AI chat',
      '10 built-in skills',
      '2 MCP connectors',
      'Community support',
    ],
    limits: {
      maxConnectors: 2,
      sandboxAccess: false,
      browserAccess: false,
      allSkills: false,
      allHubs: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Solaris Pro',
    description: 'Full access to the AI coworker platform',
    price: { monthly: 10, yearly: 96 },
    credits: 1000,
    clerkPlanId: process.env.NEXT_PUBLIC_CLERK_PRO_PLAN_ID || 'plan_xxx',
    features: [
      '1,000 credits per month',
      'All AI features & models',
      'All 5 integrated hubs',
      'All 170+ AI skills',
      'Unlimited MCP connectors',
      'Sandbox code execution',
      'Browser automation',
      'Priority support',
    ],
    limits: {
      maxConnectors: Infinity,
      sandboxAccess: true,
      browserAccess: true,
      allSkills: true,
      allHubs: true,
    },
  },
};
```

---

## 2. Clerk Billing Setup

### Dashboard Configuration

1. In the Clerk Dashboard → **Billing** → Enable Billing
2. Connect your Stripe account
3. Create a plan:
   - **Name**: Solaris Pro
   - **Monthly Price**: $10.00 USD
   - **Annual Price**: $96.00 USD (optional)
   - **Features**: List features from the plan definition above
4. Note the **Plan ID** → Add to env as `NEXT_PUBLIC_CLERK_PRO_PLAN_ID`

### Webhook Configuration

1. In Clerk Dashboard → **Webhooks**
2. Add endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `subscription.created`
   - `subscription.updated`
   - `subscription.canceled`
   - `subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Copy the **Signing Secret** → Add to env as `CLERK_BILLING_WEBHOOK_SECRET`

---

## 3. Credit System Implementation

### Credit Cost Matrix

| Action | Credits | Description |
|--------|---------|-------------|
| `chat_standard` | 1 | Standard AI chat message |
| `chat_complex` | 3 | Complex/long AI response |
| `chat_with_tools` | 2 | Chat with tool usage |
| `sandbox_execute` | 2 | Sandbox code execution |
| `image_generate` | 5 | AI image generation |
| `browser_action` | 3 | Browser automation action |
| `document_generate` | 3 | PDF/DOCX/PPTX/XLSX generation |
| `creative_generate` | 4 | Creative Hub content generation |

**File**: `packages/common/src/credits.ts`

```typescript
export const CREDIT_COSTS: Record<string, number> = {
  chat_standard: 1,
  chat_complex: 3,
  chat_with_tools: 2,
  sandbox_execute: 2,
  image_generate: 5,
  browser_action: 3,
  document_generate: 3,
  creative_generate: 4,
};

export function getCreditCost(action: string): number {
  return CREDIT_COSTS[action] || 1;
}
```

### Credit Balance Management

Credits are stored in **Clerk user public metadata** for simplicity and instant access from both the website and desktop app.

**Key functions** (in `apps/nextjs/lib/credits.ts`):

```typescript
import { clerkClient } from '@clerk/nextjs/server';

interface CreditBalance {
  plan: 'free' | 'pro';
  total: number;
  used: number;
  remaining: number;
  cycleStart: string;
  cycleEnd: string;
}

export async function getCreditBalance(userId: string): Promise<CreditBalance> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const meta = user.publicMetadata as any;

  const total = meta?.creditsTotal || 50;
  const used = meta?.creditsUsed || 0;

  return {
    plan: meta?.plan || 'free',
    total,
    used,
    remaining: Math.max(0, total - used),
    cycleStart: meta?.cycleStart || new Date().toISOString(),
    cycleEnd: meta?.cycleEnd || new Date().toISOString(),
  };
}

export async function deductCredits(
  userId: string,
  amount: number,
  action: string,
  description?: string
): Promise<{ success: boolean; remaining: number; error?: string }> {
  const balance = await getCreditBalance(userId);

  if (balance.remaining < amount) {
    return {
      success: false,
      remaining: balance.remaining,
      error: 'Insufficient credits',
    };
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      creditsUsed: balance.used + amount,
    },
  });

  // Optionally log to database for detailed history
  // await db.insert(creditUsage).values({ userId, action, credits: amount, description });

  return {
    success: true,
    remaining: balance.remaining - amount,
  };
}

export async function resetCredits(userId: string, plan: 'free' | 'pro'): Promise<void> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const totalCredits = plan === 'pro' ? 1000 : 50;
  const now = new Date();
  const cycleEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      plan,
      creditsTotal: totalCredits,
      creditsUsed: 0,
      cycleStart: now.toISOString(),
      cycleEnd: cycleEnd.toISOString(),
    },
  });
}
```

### Monthly Credit Reset

Credits reset at the start of each billing cycle. This is handled by the **subscription webhook** — when Clerk sends an `invoice.paid` event at the start of a new billing cycle, we reset the credit counter.

Add to the webhook handler (`apps/nextjs/app/api/webhooks/clerk/route.ts`):

```typescript
if (eventType === 'invoice.paid') {
  const invoice = evt.data as any;
  const userId = invoice.user_id;

  if (userId) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const plan = (user.publicMetadata as any)?.plan || 'free';
    await resetCredits(userId, plan);
    console.log(`[Webhook] Reset credits for user ${userId} (${plan} plan)`);
  }
}
```

### Credit Check Middleware (Optional)

For strict credit enforcement on the API level:

```typescript
// lib/credit-middleware.ts
export async function requireCredits(userId: string, amount: number) {
  const balance = await getCreditBalance(userId);
  if (balance.remaining < amount) {
    throw new Error(`Insufficient credits. Need ${amount}, have ${balance.remaining}.`);
  }
}
```

---

## 4. API Routes for Credit Operations

### GET /api/credits — Get Balance

```typescript
// apps/nextjs/app/api/credits/route.ts
import { auth } from '@clerk/nextjs/server';
import { getCreditBalance } from '@/lib/credits';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const balance = await getCreditBalance(userId);
  return Response.json(balance);
}
```

### POST /api/credits/use — Use Credits

```typescript
// apps/nextjs/app/api/credits/use/route.ts
import { auth } from '@clerk/nextjs/server';
import { deductCredits, getCreditCost } from '@/lib/credits';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { action, description, sessionId } = await req.json();
  const cost = getCreditCost(action);

  const result = await deductCredits(userId, cost, action, description);

  if (!result.success) {
    return Response.json({ error: result.error, remaining: result.remaining }, { status: 402 });
  }

  return Response.json({ success: true, creditsUsed: cost, remaining: result.remaining });
}
```

### POST /api/desktop-auth/use-credits — Desktop App Credit Deduction

```typescript
// apps/nextjs/app/api/desktop-auth/use-credits/route.ts
import { deductCredits, getCreditCost } from '@/lib/credits';
import { verifyDesktopToken } from '@/lib/desktop-auth';

export async function POST(req: Request) {
  const { token, action, description } = await req.json();

  const tokenData = await verifyDesktopToken(token);
  if (!tokenData) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }

  const cost = getCreditCost(action);
  const result = await deductCredits(tokenData.userId, cost, action, description);

  if (!result.success) {
    return Response.json({ error: result.error, remaining: result.remaining }, { status: 402 });
  }

  return Response.json({ success: true, creditsUsed: cost, remaining: result.remaining });
}
```

---

## 5. Subscription Lifecycle Handling

### New User Signs Up
1. `user.created` webhook fires
2. Initialize with `free` plan, 50 credits
3. User sees dashboard with free tier info

### User Subscribes to Pro
1. User clicks "Subscribe" → Clerk checkout page
2. Payment processed by Stripe via Clerk Billing
3. `subscription.created` webhook fires with `status: 'active'`
4. Update user metadata: plan=pro, credits=1000
5. Dashboard updates to show Pro features

### Monthly Renewal
1. Stripe charges the card via Clerk Billing
2. `invoice.paid` webhook fires
3. Reset credits to 1000 for Pro (50 for free)
4. User gets fresh monthly credits

### Payment Failure
1. `invoice.payment_failed` webhook fires
2. Clerk/Stripe handles retry logic (typically 3 attempts)
3. If all retries fail → `subscription.canceled`
4. Downgrade user to free plan

### User Cancels
1. User clicks "Cancel" in billing portal
2. `subscription.canceled` webhook fires
3. Subscription remains active until end of billing period
4. At period end, `subscription.deleted` fires
5. Downgrade to free plan, reset credits to 50

### User Upgrades Mid-Cycle
1. User on free plan subscribes to Pro
2. Immediate upgrade — `subscription.created` fires
3. Credits immediately set to 1000 (fresh cycle starts)

### User Downgrades
1. User cancels Pro subscription
2. Pro features remain until end of current billing period
3. At period end, downgrade to free

---

## 6. Credit Usage Tracking (Optional — Database)

For detailed usage history on the credits page, optionally store usage in PostgreSQL:

```sql
CREATE TABLE credit_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  credits_used INTEGER NOT NULL,
  description TEXT,
  session_id TEXT,
  source TEXT DEFAULT 'web',   -- 'web' or 'desktop'
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_log_user_date ON credit_usage_log(user_id, created_at DESC);
```

This enables the usage chart and history table on the `/credits` page.

---

## 7. Testing

### Test Scenarios

1. **Free user**: Sign up → Verify 50 credits → Use credits → Verify deduction → Hit 0 → Verify rejection
2. **Upgrade**: Free → Subscribe → Verify 1000 credits → Use features
3. **Renewal**: Wait for cycle end → Verify credit reset
4. **Cancel**: Pro user → Cancel → Verify features until period end → Verify downgrade
5. **Desktop**: Link desktop app → Use credits from desktop → Verify sync on website

### Stripe Test Cards
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires auth**: `4000 0025 0000 3155`

Use these in Clerk's test mode / Stripe test mode.

---

## Next Steps
→ [07-deployment.md](./07-deployment.md) — Deploy to Vercel
