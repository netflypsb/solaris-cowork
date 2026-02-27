# 04 — Protected Pages

## Overview

Protected pages require Clerk authentication. They provide the user dashboard, subscription management, and credit tracking.

**Route group**: `apps/nextjs/app/(protected)/`

All pages in this group are behind Clerk middleware authentication (configured in `middleware.ts`).

---

## Shared Protected Layout

**File**: `apps/nextjs/app/(protected)/layout.tsx`

```typescript
import { UserButton } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="border-b border-border bg-surface sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src="/assets/solaris.jpg" alt="Solaris" className="w-8 h-8 rounded" />
            <span className="font-semibold text-lg">Solaris</span>
          </a>
          <nav className="flex items-center gap-6">
            <a href="/dashboard" className="text-sm hover:text-primary transition-colors">Dashboard</a>
            <a href="/subscription" className="text-sm hover:text-primary transition-colors">Subscription</a>
            <a href="/credits" className="text-sm hover:text-primary transition-colors">Credits</a>
            <a href="/download" className="text-sm hover:text-primary transition-colors">Download</a>
            <UserButton afterSignOutUrl="/" />
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
```

---

## 1. User Dashboard

**Route**: `/dashboard`
**File**: `apps/nextjs/app/(protected)/dashboard/page.tsx`

### Layout

The dashboard is the user's home after signing in. It provides an overview of their account status.

### Sections

#### Welcome Header
- "Welcome back, {user.firstName}!"
- Current plan badge (Free / Pro)
- Quick action buttons: "Download Solaris", "View Docs"

#### Subscription Status Card
- Current plan name and price
- Billing cycle (monthly/yearly)
- Next billing date
- "Manage Subscription →" link to `/subscription`
- Visual indicator: green for active, amber for expiring, red for expired

#### Credits Overview Card
- Credits remaining this month: `{remaining} / {total}`
- Visual progress bar
- Credits used today / this week / this month
- "View Details →" link to `/credits`
- Reset date (next billing cycle)

#### Quick Links Grid
Four cards:
1. **Documentation** — "Learn how to use Solaris" → `/docs`
2. **Download** — "Get the latest version" → `/download`
3. **Blog** — "Read the latest updates" → `/blog`
4. **Support** — "Get help" → External link or email

#### Desktop App Connection Status
- Shows whether the user has connected the Solaris desktop app
- Instructions for connecting if not yet linked
- "Connected" badge with last sync timestamp if linked

### Data Fetching

```typescript
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  // Fetch subscription status from Clerk
  // Fetch credit balance from database
  const credits = await db.query.credits.findFirst({
    where: eq(credits.userId, userId),
  });

  // Fetch usage stats
  const usage = await db.query.creditUsage.findMany({
    where: and(
      eq(creditUsage.userId, userId),
      gte(creditUsage.createdAt, startOfMonth),
    ),
  });

  return ( /* render dashboard */ );
}
```

---

## 2. Subscription Page

**Route**: `/subscription`
**File**: `apps/nextjs/app/(protected)/subscription/page.tsx`

### Layout

Manages the user's subscription via Clerk Billing.

### Sections

#### Current Plan
- Plan name, price, and features
- Status: Active, Cancelled, Past Due
- Billing cycle dates

#### Plan Comparison
Display the same pricing cards as the landing page, but with:
- Current plan highlighted
- "Current Plan" badge on active plan
- "Upgrade" / "Downgrade" buttons on other plans
- Feature comparison checklist

#### Subscription Actions

**For Free users**:
- "Upgrade to Pro" button → Opens Clerk Billing checkout

**For Pro users**:
- "Manage Billing" button → Opens Clerk Billing portal
- "Cancel Subscription" link with confirmation dialog

#### Billing History
- Table of past invoices with date, amount, status
- Download invoice PDF links (from Stripe via Clerk)

### Clerk Billing Integration

Use Clerk's built-in billing components:

```typescript
'use client';
import { useUser } from '@clerk/nextjs';

export default function SubscriptionPage() {
  const { user } = useUser();

  const handleSubscribe = async () => {
    // Use Clerk's billing API to create a checkout session
    // Redirect to Clerk-hosted checkout page
    const response = await fetch('/api/create-checkout', { method: 'POST' });
    const { checkoutUrl } = await response.json();
    window.location.href = checkoutUrl;
  };

  const handleManageBilling = async () => {
    // Redirect to Clerk billing portal
    const response = await fetch('/api/billing-portal', { method: 'POST' });
    const { portalUrl } = await response.json();
    window.location.href = portalUrl;
  };

  return ( /* render subscription page */ );
}
```

---

## 3. Credits Page

**Route**: `/credits`
**File**: `apps/nextjs/app/(protected)/credits/page.tsx`

### Layout

Detailed view of the user's credit balance and usage history.

### Sections

#### Credit Balance
- Large display: "750 / 1,000 credits remaining"
- Circular or bar progress visualization
- Reset date: "Resets on March 1, 2026"
- Plan allocation info

#### Usage Chart
- Bar chart or area chart showing daily credit usage over the past 30 days
- Use a lightweight chart library (e.g., recharts or chart.js)

#### Usage History Table
Sortable table with columns:
- **Date** — When the credits were used
- **Action** — What the credits were used for (e.g., "AI Chat", "Code Execution", "Image Generation")
- **Credits Used** — Amount deducted
- **Session** — Linked conversation (if applicable)

Pagination for large histories.

#### Credit System Explanation
Collapsible FAQ section:
- "How do credits work?"
- "What uses credits?"
- "What happens when I run out?"
- "When do credits reset?"

### Credit Cost Table

| Action | Credit Cost |
|--------|------------|
| AI Chat message (standard) | 1 credit |
| AI Chat message (long/complex) | 2-5 credits |
| Code execution (sandbox) | 2 credits |
| Image generation | 5 credits |
| Browser automation task | 3 credits |
| Document generation (PDF/DOCX/PPTX/XLSX) | 3 credits |

> Note: Exact credit costs will be fine-tuned. These are initial estimates.

---

## 4. Auth Pages

### Sign In Page

**Route**: `/sign-in`
**File**: `apps/nextjs/app/(auth)/sign-in/[[...sign-in]]/page.tsx`

```typescript
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-surface border border-border shadow-xl',
          },
        }}
      />
    </div>
  );
}
```

### Sign Up Page

**Route**: `/sign-up`
**File**: `apps/nextjs/app/(auth)/sign-up/[[...sign-up]]/page.tsx`

```typescript
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-surface border border-border shadow-xl',
          },
        }}
      />
    </div>
  );
}
```

---

## Database Schema for Credits

Add to your database schema (Prisma or Kysely):

```sql
-- Credit balances
CREATE TABLE credit_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,       -- Clerk user ID
  plan_id TEXT NOT NULL DEFAULT 'free',
  total_credits INTEGER NOT NULL DEFAULT 50,
  used_credits INTEGER NOT NULL DEFAULT 0,
  cycle_start TIMESTAMP NOT NULL DEFAULT NOW(),
  cycle_end TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Credit usage log
CREATE TABLE credit_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,                -- 'chat', 'sandbox', 'image', 'browser', 'document'
  credits_used INTEGER NOT NULL,
  description TEXT,
  session_id TEXT,                     -- Optional: linked conversation
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Desktop app tokens
CREATE TABLE desktop_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  device_name TEXT,
  last_used TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_credit_balances_user ON credit_balances(user_id);
CREATE INDEX idx_credit_usage_user ON credit_usage(user_id);
CREATE INDEX idx_credit_usage_created ON credit_usage(created_at);
CREATE INDEX idx_desktop_tokens_user ON desktop_tokens(user_id);
CREATE INDEX idx_desktop_tokens_hash ON desktop_tokens(token_hash);
```

---

## API Routes for Protected Features

### Credit Check API
**File**: `apps/nextjs/app/api/credits/route.ts`

```typescript
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

// GET /api/credits — Get current balance
export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const balance = await db.query.creditBalances.findFirst({
    where: eq(creditBalances.userId, userId),
  });

  return Response.json({ balance });
}

// POST /api/credits/use — Deduct credits
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { action, credits, description, sessionId } = await req.json();

  // Check balance
  const balance = await getBalance(userId);
  if (balance.used_credits + credits > balance.total_credits) {
    return Response.json({ error: 'Insufficient credits' }, { status: 402 });
  }

  // Deduct and log
  await deductCredits(userId, credits, action, description, sessionId);

  return Response.json({ success: true, remaining: balance.total_credits - balance.used_credits - credits });
}
```

---

## Next Steps
→ [05-clerk-auth.md](./05-clerk-auth.md) — Detailed Clerk authentication setup
