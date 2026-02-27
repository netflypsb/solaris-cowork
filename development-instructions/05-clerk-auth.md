# 05 — Clerk Authentication Setup

## Overview

Clerk handles all authentication for both the website and the Solaris desktop app. This guide covers the complete Clerk integration.

---

## 1. Clerk Dashboard Configuration

### Create Application
1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Click **Create Application**
3. Name: "Solaris Cowork"
4. Select sign-in methods:
   - **Email address** (required)
   - **Google** (recommended)
   - **GitHub** (optional, good for developer audience)

### Configure Application Settings

#### Session Settings
- Token lifetime: 7 days (default)
- Enable **long-lived sessions** for desktop app compatibility

#### JWT Templates (For Desktop App)
1. Go to **JWT Templates** in the Clerk Dashboard
2. Create a new template named `solaris-desktop`
3. Configure claims:
```json
{
  "userId": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "firstName": "{{user.first_name}}",
  "lastName": "{{user.last_name}}",
  "plan": "{{user.public_metadata.plan}}",
  "credits": "{{user.public_metadata.credits}}"
}
```
4. Set lifetime: 30 days (for desktop app persistent login)
5. Note the **Template ID** for use in the desktop app

#### User Metadata Schema
In Clerk, we store subscription-related data in user metadata:

**Public Metadata** (readable by client):
```json
{
  "plan": "free",           // "free" | "pro"
  "creditsTotal": 50,       // Monthly allocation
  "creditsUsed": 0,         // Used this cycle
  "cycleStart": "2026-02-01T00:00:00Z",
  "cycleEnd": "2026-03-01T00:00:00Z",
  "desktopLinked": false     // Whether desktop app is connected
}
```

**Private Metadata** (server-only):
```json
{
  "stripeCustomerId": "cus_xxx",
  "subscriptionId": "sub_xxx",
  "subscriptionStatus": "active"
}
```

---

## 2. Website Integration

### Install Clerk Packages

```bash
cd apps/nextjs
bun add @clerk/nextjs @clerk/themes
```

### Root Layout Provider

**File**: `apps/nextjs/app/layout.tsx`

```typescript
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#6366f1',
          colorBackground: '#0a0a0f',
          colorInputBackground: '#1a1a2e',
          colorInputText: '#ffffff',
        },
        elements: {
          card: 'bg-[#1a1a2e] border border-[#2a2a3e]',
          headerTitle: 'text-white',
          headerSubtitle: 'text-gray-400',
          formFieldLabel: 'text-gray-300',
          formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700',
          footerActionLink: 'text-indigo-400 hover:text-indigo-300',
        },
      }}
    >
      <html lang="en" className="dark">
        <body className="bg-background text-foreground">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

### Middleware

**File**: `apps/nextjs/middleware.ts`

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/subscription(.*)',
  '/credits(.*)',
]);

const isPublicApiRoute = createRouteMatcher([
  '/api/webhooks(.*)',
  '/api/desktop-auth/verify(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect dashboard routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Public API routes skip auth
  // (webhooks need to be accessible without user auth)
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

### Auth Helper Functions

**File**: `apps/nextjs/lib/auth.ts`

```typescript
import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';

export async function getAuthUser() {
  const { userId } = await auth();
  if (!userId) return null;
  return currentUser();
}

export async function getUserPlan(userId: string): Promise<'free' | 'pro'> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return (user.publicMetadata?.plan as string) || 'free';
}

export async function getUserCredits(userId: string) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const meta = user.publicMetadata as any;
  return {
    total: meta?.creditsTotal || 50,
    used: meta?.creditsUsed || 0,
    remaining: (meta?.creditsTotal || 50) - (meta?.creditsUsed || 0),
    cycleEnd: meta?.cycleEnd || null,
  };
}

export async function updateUserCredits(userId: string, creditsUsed: number) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const currentUsed = (user.publicMetadata as any)?.creditsUsed || 0;

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      creditsUsed: currentUsed + creditsUsed,
    },
  });
}

export async function resetUserCredits(userId: string, plan: 'free' | 'pro') {
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

---

## 3. Sign-In / Sign-Up Pages

### Sign In

**File**: `apps/nextjs/app/(auth)/sign-in/[[...sign-in]]/page.tsx`

```typescript
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-surface">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/assets/solaris.jpg" alt="Solaris" className="w-16 h-16 rounded-xl mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-400 mt-1">Sign in to your Solaris account</p>
        </div>
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
```

### Sign Up

**File**: `apps/nextjs/app/(auth)/sign-up/[[...sign-up]]/page.tsx`

```typescript
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-surface">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/assets/solaris.jpg" alt="Solaris" className="w-16 h-16 rounded-xl mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-gray-400 mt-1">Start using Solaris for free</p>
        </div>
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
```

---

## 4. User Initialization Webhook

When a new user signs up, initialize their credit balance.

**File**: `apps/nextjs/app/api/webhooks/clerk/route.ts`

```typescript
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_BILLING_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return new Response('Webhook secret not configured', { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Webhook verification failed', { status: 400 });
  }

  const eventType = evt.type;

  // Handle user creation — initialize free credits
  if (eventType === 'user.created') {
    const { id: userId } = evt.data;
    const client = await clerkClient();
    const now = new Date();
    const cycleEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        plan: 'free',
        creditsTotal: 50,
        creditsUsed: 0,
        cycleStart: now.toISOString(),
        cycleEnd: cycleEnd.toISOString(),
        desktopLinked: false,
      },
    });

    console.log(`[Webhook] Initialized free plan for user: ${userId}`);
  }

  // Handle subscription events from Clerk Billing
  if (eventType === 'subscription.created' || eventType === 'subscription.updated') {
    const subscription = evt.data as any;
    const userId = subscription.user_id;
    const status = subscription.status; // 'active', 'canceled', 'past_due'

    const client = await clerkClient();

    if (status === 'active') {
      const now = new Date();
      const cycleEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          plan: 'pro',
          creditsTotal: 1000,
          creditsUsed: 0,
          cycleStart: now.toISOString(),
          cycleEnd: cycleEnd.toISOString(),
        },
        privateMetadata: {
          subscriptionId: subscription.id,
          subscriptionStatus: status,
        },
      });
      console.log(`[Webhook] Activated pro plan for user: ${userId}`);
    }
  }

  if (eventType === 'subscription.canceled' || eventType === 'subscription.deleted') {
    const subscription = evt.data as any;
    const userId = subscription.user_id;
    const client = await clerkClient();

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        plan: 'free',
        creditsTotal: 50,
        creditsUsed: 0,
      },
      privateMetadata: {
        subscriptionId: null,
        subscriptionStatus: 'canceled',
      },
    });
    console.log(`[Webhook] Downgraded to free plan for user: ${userId}`);
  }

  return new Response('Webhook processed', { status: 200 });
}
```

---

## 5. Desktop App Authentication Endpoint

The Solaris desktop app authenticates via a device-linking flow.

**File**: `apps/nextjs/app/api/desktop-auth/link/route.ts`

```typescript
import { auth } from '@clerk/nextjs/server';
import { randomBytes, createHash } from 'crypto';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { deviceName } = await req.json();

  // Generate a device token
  const token = randomBytes(48).toString('hex');
  const tokenHash = createHash('sha256').update(token).digest('hex');

  // Store in database
  // ... save tokenHash, userId, deviceName, expiresAt ...

  // Update user metadata
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { desktopLinked: true },
  });

  // Return the token (only time it's exposed in plaintext)
  return Response.json({
    token,
    userId,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  });
}
```

**File**: `apps/nextjs/app/api/desktop-auth/verify/route.ts`

```typescript
import { createHash } from 'crypto';

export async function POST(req: Request) {
  const { token } = await req.json();
  if (!token) return Response.json({ error: 'Token required' }, { status: 400 });

  const tokenHash = createHash('sha256').update(token).digest('hex');

  // Look up token in database
  // ... find by tokenHash, check expiry ...

  // If valid, return user info and credits
  const client = await clerkClient();
  const user = await client.users.getUser(storedToken.userId);
  const meta = user.publicMetadata as any;

  return Response.json({
    valid: true,
    userId: user.id,
    email: user.emailAddresses[0]?.emailAddress,
    firstName: user.firstName,
    plan: meta?.plan || 'free',
    credits: {
      total: meta?.creditsTotal || 50,
      used: meta?.creditsUsed || 0,
      remaining: (meta?.creditsTotal || 50) - (meta?.creditsUsed || 0),
    },
  });
}
```

**File**: `apps/nextjs/app/api/desktop-auth/use-credits/route.ts`

```typescript
export async function POST(req: Request) {
  const { token, action, credits, description } = await req.json();
  if (!token) return Response.json({ error: 'Token required' }, { status: 400 });

  // Verify token
  // ... validate and get userId ...

  // Check and deduct credits
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const meta = user.publicMetadata as any;
  const remaining = (meta?.creditsTotal || 0) - (meta?.creditsUsed || 0);

  if (remaining < credits) {
    return Response.json({ error: 'Insufficient credits', remaining }, { status: 402 });
  }

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...meta,
      creditsUsed: (meta?.creditsUsed || 0) + credits,
    },
  });

  // Log usage (optional — write to database)

  return Response.json({
    success: true,
    remaining: remaining - credits,
  });
}
```

---

## 6. Protecting the Pricing/Checkout Flow

### Checkout API Route

**File**: `apps/nextjs/app/api/create-checkout/route.ts`

```typescript
import { auth } from '@clerk/nextjs/server';

export async function POST() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Use Clerk Billing API to create checkout session
  // The exact API depends on Clerk Billing's SDK (currently in Beta)
  // Refer to: https://clerk.com/docs/billing/b2c

  // Example (API may change):
  const response = await fetch('https://api.clerk.com/v1/billing/checkout_sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      plan_id: 'plan_xxx', // Your Clerk Billing plan ID
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscribed=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription`,
    }),
  });

  const session = await response.json();
  return Response.json({ checkoutUrl: session.checkout_url });
}
```

---

## Security Checklist

- [ ] All protected routes go through Clerk middleware
- [ ] Webhook signatures are verified with svix
- [ ] Desktop tokens are hashed before storage (never store plaintext)
- [ ] API routes check authentication before processing
- [ ] CORS headers restrict desktop-auth endpoints appropriately
- [ ] Rate limiting on auth and credit endpoints
- [ ] Environment variables are never exposed to the client (except NEXT_PUBLIC_ prefixed)

---

## Next Steps
→ [06-subscription-credits.md](./06-subscription-credits.md) — Detailed subscription and credit system implementation
