# Phase 6: Website & Backend Modifications for Desktop App Authentication

## Overview

This document describes all modifications needed on the **Solaris website** (solaris-ai.xyz), **Supabase database**, and **supporting services** to enable seamless authentication between the Solaris desktop app and the website — matching the behavior of Cursor and Windsurf IDE.

### How Cursor / Windsurf Do It

1. User clicks "Sign In" in the desktop app
2. Desktop opens a specific auth URL in the system browser (e.g., `https://cursor.sh/auth/desktop`)
3. The website's auth page detects the user's session:
   - **Already signed in** → immediately generates a one-time token and redirects to the desktop app via a custom protocol (`cursor://auth/callback?token=xxx`)
   - **Not signed in** → shows sign-in form, then generates the token and redirects
4. Desktop app receives the token via the custom protocol handler
5. Desktop app verifies the token with the website's API (`POST /api/auth/verify-desktop-token`)
6. Website returns user data + credentials (e.g., API key)
7. Desktop app stores credentials securely in OS keychain
8. On subsequent launches, desktop app uses stored credentials — no network call needed until user re-authenticates

### Desktop App Behavior (Already Implemented)

The desktop app (`src/main/auth/auth-manager.ts`) handles:
- **Fresh sign-in**: Stores all credentials
- **Account switch**: Detects different userId → clears ALL old credentials before storing new ones
- **Subscription upgrade** (free → paid): Stores newly provided API key
- **Subscription downgrade/expiry**: Explicitly deletes stored API key when none is provided
- **Subscription renewal**: Replaces old API key with new one
- **Sign-out**: Clears all credentials from OS keychain

---

## 1. Database Schema Changes (Supabase)

### 1.1 Desktop Auth Tokens Table

Create a table to store one-time tokens for desktop authentication:

```sql
CREATE TABLE desktop_auth_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,           -- Clerk user ID
  token TEXT NOT NULL UNIQUE,       -- HMAC token (the value sent to the desktop app)
  expires_at TIMESTAMPTZ NOT NULL,  -- Token expiry (5 minutes from creation)
  used_at TIMESTAMPTZ,              -- When the token was consumed (NULL = unused)
  created_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,                  -- IP that requested the token (optional audit)
  user_agent TEXT                   -- User agent of the request (optional audit)
);

-- Index for fast token lookup during verification
CREATE INDEX idx_desktop_auth_tokens_token ON desktop_auth_tokens (token);

-- Index for cleanup of expired tokens
CREATE INDEX idx_desktop_auth_tokens_expires ON desktop_auth_tokens (expires_at);

-- Enable RLS
ALTER TABLE desktop_auth_tokens ENABLE ROW LEVEL SECURITY;

-- Only the service role can read/write tokens (API routes use service role)
CREATE POLICY "Service role only" ON desktop_auth_tokens
  FOR ALL USING (auth.role() = 'service_role');
```

### 1.2 Ensure OpenRouter API Keys Table Exists

Your existing schema likely has a table for user API keys. Confirm it has at minimum:

```sql
-- Example: If you don't already have this table
CREATE TABLE IF NOT EXISTS user_api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,            -- Clerk user ID
  provider TEXT NOT NULL DEFAULT 'openrouter',
  api_key TEXT NOT NULL,            -- The actual OpenRouter API key
  label TEXT,                       -- e.g., "Solaris Desktop Key"
  name TEXT,                        -- Display name
  credit_limit NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_user_api_keys_user ON user_api_keys (user_id);
```

### 1.3 Ensure Subscriptions Table Exists

```sql
-- Example: If you don't already have this table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,     -- Clerk user ID
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive', -- 'active', 'canceled', 'past_due', 'inactive'
  tier TEXT NOT NULL DEFAULT 'free',       -- 'free', 'pro', 'team', etc.
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_subscriptions_user ON subscriptions (user_id);
```

### 1.4 Scheduled Cleanup Function

Create a database function to periodically clean up expired tokens:

```sql
-- Function to delete expired/used tokens older than 1 hour
CREATE OR REPLACE FUNCTION cleanup_desktop_auth_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM desktop_auth_tokens
  WHERE expires_at < now() - INTERVAL '1 hour'
     OR used_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Set up a **Supabase cron job** (via pg_cron extension or Supabase Dashboard → Database → Cron Jobs):

```sql
SELECT cron.schedule(
  'cleanup-desktop-tokens',
  '*/30 * * * *',  -- Every 30 minutes
  'SELECT cleanup_desktop_auth_tokens();'
);
```

---

## 2. Website Pages

### 2.1 Desktop Auth Page: `/auth/desktop`

This is the **critical page** that bridges the website and desktop app. It must handle ALL scenarios automatically.

**File**: `app/auth/desktop/page.tsx` (Next.js App Router)

```tsx
// app/auth/desktop/page.tsx
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createDesktopToken } from '@/lib/auth/desktop-token';
import DesktopAuthClient from './client';

export default async function DesktopAuthPage() {
  const { userId } = await auth();

  // CASE 1: User is already signed in → generate token immediately and redirect
  if (userId) {
    const user = await currentUser();
    if (user) {
      try {
        const token = await createDesktopToken(userId);
        // Redirect to the desktop app immediately
        redirect(`solaris://auth/callback?token=${token}`);
      } catch (error) {
        console.error('[Desktop Auth] Error creating token:', error);
        // Fall through to client component which can retry
      }
    }
  }

  // CASE 2: User is not signed in → show sign-in UI, then redirect after sign-in
  // The client component handles the sign-in flow and then calls the API
  return <DesktopAuthClient />;
}
```

**Client Component**: `app/auth/desktop/client.tsx`

```tsx
'use client';

import { useAuth, useUser, SignIn } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function DesktopAuthClient() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [status, setStatus] = useState<'loading' | 'signing-in' | 'generating' | 'redirecting' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      // User is signed in — generate token and redirect to desktop app
      generateTokenAndRedirect();
    } else {
      // Show sign-in form
      setStatus('signing-in');
    }
  }, [isSignedIn, isLoaded, user]);

  const generateTokenAndRedirect = async () => {
    setStatus('generating');
    try {
      const res = await fetch('/api/auth/generate-desktop-token', {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Failed to generate authentication token');
      }

      const { token } = await res.json();
      setStatus('redirecting');

      // Redirect to the desktop app via custom protocol
      window.location.href = `solaris://auth/callback?token=${token}`;

      // Show a message in case the redirect doesn't work
      // (e.g., desktop app not installed, protocol not registered)
      setTimeout(() => {
        setStatus('error');
        setError(
          'Could not open the Solaris desktop app. Please make sure the app is installed and try again.'
        );
      }, 3000);
    } catch (err) {
      console.error('[Desktop Auth] Error:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'signing-in') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold">Sign in to Solaris</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to connect your Solaris account with the desktop app.
          </p>
        </div>
        <SignIn
          afterSignInUrl="/auth/desktop"
          afterSignUpUrl="/auth/desktop"
          redirectUrl="/auth/desktop"
        />
      </div>
    );
  }

  if (status === 'generating') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Connecting to desktop app...</p>
        </div>
      </div>
    );
  }

  if (status === 'redirecting') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-xl font-semibold">Authentication successful!</h2>
          <p className="text-muted-foreground mt-2">
            Redirecting you to the Solaris desktop app...
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            If the app doesn't open automatically,{' '}
            <button
              onClick={generateTokenAndRedirect}
              className="text-primary underline"
            >
              click here to try again
            </button>
            .
          </p>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-red-500 mt-2">{error}</p>
        <button
          onClick={generateTokenAndRedirect}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
```

---

## 3. API Routes

### 3.1 Generate Desktop Token: `POST /api/auth/generate-desktop-token`

Called by the website's auth page when the user is signed in. Creates a one-time token.

**File**: `app/api/auth/generate-desktop-token/route.ts`

```ts
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createDesktopToken } from '@/lib/auth/desktop-token';

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const token = await createDesktopToken(userId);
    return NextResponse.json({ token });
  } catch (error) {
    console.error('[Generate Token] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
```

### 3.2 Verify Desktop Token: `POST /api/auth/verify-desktop-token`

Called by the **desktop app** to verify the one-time token and receive user data + API key.

**File**: `app/api/auth/verify-desktop-token/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Service role for server-side access
);

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    // 1. Look up the token in the database
    const { data: tokenRecord, error: tokenError } = await supabase
      .from('desktop_auth_tokens')
      .select('*')
      .eq('token', token)
      .is('used_at', null)           // Must not be already used
      .gt('expires_at', new Date().toISOString())  // Must not be expired
      .single();

    if (tokenError || !tokenRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // 2. Mark token as used (one-time use)
    await supabase
      .from('desktop_auth_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenRecord.id);

    const userId = tokenRecord.user_id;

    // 3. Get user info from Clerk
    let email = '';
    try {
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(userId);
      email = user.emailAddresses?.[0]?.emailAddress || '';
    } catch (err) {
      console.error('[Verify Token] Error fetching Clerk user:', err);
    }

    // 4. Get subscription status from Supabase
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, tier, current_period_end, cancel_at_period_end')
      .eq('user_id', userId)
      .single();

    const hasSubscription = subscription?.status === 'active';

    // 5. Get OpenRouter API key if subscription is active
    let apiKey = null;
    if (hasSubscription) {
      const { data: keyData } = await supabase
        .from('user_api_keys')
        .select('api_key, label, name, credit_limit')
        .eq('user_id', userId)
        .eq('provider', 'openrouter')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (keyData) {
        apiKey = {
          key: keyData.api_key,
          label: keyData.label || 'Solaris Key',
          name: keyData.name || 'OpenRouter',
          creditLimit: keyData.credit_limit || 0,
        };
      }
    }

    // 6. Return everything the desktop app needs in a single response
    return NextResponse.json({
      valid: true,
      userId,
      email,
      hasSubscription,
      subscription: subscription
        ? {
            status: subscription.status,
            tier: subscription.tier,
            currentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          }
        : null,
      apiKey,  // null if no subscription or no key — desktop app will clear stored key
    });
  } catch (error) {
    console.error('[Verify Token] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 3.3 Token Generation Utility

**File**: `lib/auth/desktop-token.ts`

```ts
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TOKEN_EXPIRY_MINUTES = 5;

export async function createDesktopToken(userId: string): Promise<string> {
  // Generate a cryptographically secure random token
  const token = crypto.randomBytes(32).toString('hex');

  // Calculate expiry (5 minutes from now)
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

  // Store in database
  const { error } = await supabase.from('desktop_auth_tokens').insert({
    user_id: userId,
    token,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    console.error('[Desktop Token] Error creating token:', error);
    throw new Error('Failed to create desktop auth token');
  }

  return token;
}
```

---

## 4. Scenario Matrix

This table shows what the website returns and what the desktop app does for each scenario:

| Scenario | Website `/auth/desktop` behavior | `verify-desktop-token` response | Desktop app behavior |
|---|---|---|---|
| **Fresh sign-in (new user, no subscription)** | Show Clerk sign-in → generate token → redirect | `{ hasSubscription: false, apiKey: null }` | Stores userId + email. No API key stored. User uses own keys. |
| **Fresh sign-in (subscribed user)** | Show Clerk sign-in → generate token → redirect | `{ hasSubscription: true, apiKey: { key: "sk-..." } }` | Stores userId + email + API key in keychain. |
| **Already signed in on website** | Detect Clerk session → immediately generate token → redirect | Same as above based on subscription status | Same as above — no user interaction needed on website. |
| **Subscription upgrade (free → paid)** | User clicks "Sign In" in desktop again → auto-redirect | `{ hasSubscription: true, apiKey: { key: "sk-..." } }` | Stores new API key. Desktop now uses subscription credits. |
| **Subscription downgrade/expiry** | User re-authenticates → auto-redirect | `{ hasSubscription: false, apiKey: null }` | **Deletes** stored API key. User falls back to own keys. |
| **Subscription renewal** | User re-authenticates → auto-redirect | `{ hasSubscription: true, apiKey: { key: "sk-new-..." } }` | Replaces old API key with new one in keychain. |
| **Account switch** | Different Clerk user signs in → generates token for new user | Returns data for the NEW user | Desktop detects different userId → **clears ALL old credentials** → stores new user's data. |
| **Switch to non-subscribing account** | Signs in as different user with no subscription | `{ hasSubscription: false, apiKey: null }` | Clears old user's credentials (including API key). Stores new user with no key. |
| **User signs out from desktop** | N/A (desktop-only action) | N/A | Clears ALL credentials from keychain. App continues without auth (user uses own keys). |
| **User logs out from website then re-auths on desktop** | Shows Clerk sign-in → user signs in → generates token | Based on whoever signs in | Desktop stores fresh credentials for whoever signs in. |

---

## 5. Clerk Configuration

### 5.1 Redirect URLs

In your Clerk Dashboard → **Paths** or **Redirect URLs**, add:

- `https://solaris-ai.xyz/auth/desktop` as an allowed redirect URL after sign-in/sign-up

### 5.2 Clerk Middleware

Ensure your Clerk middleware allows unauthenticated access to the desktop auth page (since the page handles its own auth flow):

**File**: `middleware.ts`

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/auth/desktop(.*)',           // Desktop auth page
  '/api/auth/verify-desktop-token', // Called by desktop app (no Clerk session)
  '/sign-in(.*)',
  '/sign-up(.*)',
  // ... other public routes
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

**Important**: The `verify-desktop-token` route must be public because it's called by the desktop app, not from a browser with a Clerk session.

---

## 6. Environment Variables

Add these to your `.env.local` on the website:

```env
# Already existing
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Clerk (already existing)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

No new environment variables are needed. The desktop token system uses the existing Supabase service role and Clerk backend client.

---

## 7. Security Considerations

### 7.1 Token Security
- Tokens are **one-time use** — marked as `used_at` immediately after verification
- Tokens expire after **5 minutes**
- Tokens are **cryptographically random** (32 bytes / 64 hex characters)
- Old tokens are cleaned up by a cron job every 30 minutes

### 7.2 API Route Security
- `POST /api/auth/generate-desktop-token` requires a valid Clerk session (protected by middleware)
- `POST /api/auth/verify-desktop-token` is public but only accepts valid, unexpired, unused tokens
- Supabase access in API routes uses the **service role** key (never exposed to client)

### 7.3 Desktop App Security
- API keys are stored in the **OS keychain** (Windows Credential Manager / macOS Keychain / Linux Secret Service) via `keytar`
- No plain text storage of API keys anywhere
- Account switch always clears previous credentials first
- Sign-out always clears all credentials

### 7.4 CORS
The `verify-desktop-token` endpoint is called from the Electron main process using `fetch()`, not from a browser. No CORS configuration is needed since Node.js `fetch` doesn't enforce CORS.

---

## 8. Testing Checklist

### Desktop App (already implemented)
- [ ] User can open Settings → Solaris Account → click "Sign In with Solaris"
- [ ] System browser opens to `https://solaris-ai.xyz/auth/desktop`
- [ ] After auth on website, desktop app receives callback and shows signed-in state
- [ ] Sign-out clears all credentials
- [ ] Re-auth with different account clears old credentials

### Website (to implement)
- [ ] `/auth/desktop` auto-redirects already-signed-in users to `solaris://auth/callback?token=xxx`
- [ ] `/auth/desktop` shows Clerk sign-in for unauthenticated users, then auto-redirects after sign-in
- [ ] `POST /api/auth/generate-desktop-token` creates a valid token in the database
- [ ] `POST /api/auth/verify-desktop-token` returns correct user data, subscription status, and API key
- [ ] Token can only be used once
- [ ] Expired tokens are rejected
- [ ] User with no subscription → `apiKey` is `null` in response
- [ ] User with active subscription → `apiKey` contains the key
- [ ] User whose subscription expired → `apiKey` is `null`

### Scenario Tests
- [ ] Fresh sign-in (no account) → sign-up on website → redirect to desktop → credentials stored
- [ ] Already signed in on website → instant redirect to desktop → credentials stored
- [ ] Free user → no API key in desktop
- [ ] Subscribe on website → re-auth on desktop → API key now available
- [ ] Cancel subscription → re-auth on desktop → API key removed
- [ ] Renew subscription → re-auth on desktop → new API key stored
- [ ] Switch accounts → old credentials cleared, new credentials stored
- [ ] Sign out from desktop → all credentials cleared, app works with user's own keys

---

## 9. Future Enhancements

### 9.1 Automatic Subscription Sync (Webhook-based)

Currently the desktop app only syncs credentials when the user explicitly re-authenticates. For real-time sync (like Cursor/Windsurf), consider:

**Stripe Webhook → Supabase → Desktop Notification**

When a subscription status changes (upgrade, downgrade, cancellation, renewal), you can:

1. **Stripe webhook** at `POST /api/webhooks/stripe` detects subscription changes
2. Webhook handler updates the `subscriptions` table in Supabase
3. Optionally, the webhook can **revoke** or **regenerate** the user's OpenRouter API key
4. The desktop app can periodically ping a lightweight endpoint to check if credentials changed:

```ts
// POST /api/auth/check-status (called periodically by desktop)
// Requires the userId stored in the desktop keychain
{
  "userId": "user_xxx",
  "hasSubscription": true/false,
  "apiKeyChanged": true/false  // Desktop can re-auth if true
}
```

### 9.2 WebSocket-based Real-time Sync

For instant credential sync without polling:

1. Desktop app connects to a WebSocket/SSE endpoint after sign-in
2. When subscription changes, server pushes an event
3. Desktop app automatically re-fetches credentials

This is more complex but provides the best UX — identical to how Cursor pushes subscription updates to the IDE in real-time.

### 9.3 Credential Refresh on AI Request Failure

Already partially implemented in `ai-service.ts`:
- On **401** (invalid key): Clear cached key, prompt re-auth
- On **402** (credit limit): Prompt user to check subscription

Could be enhanced to automatically trigger re-auth when the API key is rejected.

### 9.4 Desktop App Auto-Auth on Launch

On app startup, if credentials exist in keychain, optionally call a lightweight verification endpoint:

```ts
// POST /api/auth/validate-credentials
// Desktop sends: { userId: "user_xxx" }
// Server responds: { valid: true, hasSubscription: true/false, apiKeyValid: true/false }
```

This ensures stale credentials don't persist indefinitely. If credentials are invalid (user deleted their account, etc.), the desktop app clears them.

---

## 10. File Summary

### Files to Create on Website

| File | Purpose |
|---|---|
| `app/auth/desktop/page.tsx` | Server component: detects session, auto-redirects signed-in users |
| `app/auth/desktop/client.tsx` | Client component: sign-in UI, token generation, protocol redirect |
| `app/api/auth/generate-desktop-token/route.ts` | Protected API: generates one-time token for authenticated user |
| `app/api/auth/verify-desktop-token/route.ts` | Public API: verifies token, returns user data + API key |
| `lib/auth/desktop-token.ts` | Utility: creates cryptographically secure tokens in DB |

### Database Objects to Create

| Object | Purpose |
|---|---|
| `desktop_auth_tokens` table | Stores one-time auth tokens |
| `cleanup_desktop_auth_tokens()` function | Cleans up expired/used tokens |
| Cron job | Runs cleanup every 30 minutes |

### Files Modified on Website

| File | Change |
|---|---|
| `middleware.ts` | Add `/auth/desktop` and `/api/auth/verify-desktop-token` to public routes |

### Desktop App Files (Already Modified)

| File | Change |
|---|---|
| `src/main/auth/auth-manager.ts` | Handles account switch, subscription changes, credential cleanup |
| `src/main/auth/ai-service.ts` | Caches and uses stored API key, clears cache on re-auth |
| `src/main/index.ts` | Protocol handler clears AI cache on re-auth |
| `src/renderer/components/SettingsPanel.tsx` | Account tab with sign-in/sign-out/status UI |
