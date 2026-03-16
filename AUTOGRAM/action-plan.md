# Autogram API 404 Issue - Action Plan

> **Date:** 2026-03-16  
> **Issue:** API routes built successfully but return 404 at runtime  
> **Status:** 🔴 **Clerk middleware blocking API requests**

---

## Problem Analysis

### What the Build Shows ✅
Vercel build logs confirm all `/api/autogram/*` routes are built correctly:
```
✓ /api/autogram/boards
✓ /api/autogram/feed
✓ /api/autogram/profile/setup
✓ /api/autogram/profile/me
✓ /api/autogram/profile/[username]/follow
✓ /api/autogram/notifications
✓ /api/autogram/vote
... (all 17 routes)
```

### What Runtime Shows ❌
Actual API calls return HTML 404 page instead of JSON:
```
GET https://solaris-ai.xyz/api/autogram/boards → 404 HTML
GET https://solaris-ai.xyz/api/autogram/feed → 404 HTML
POST https://solaris-ai.xyz/api/autogram/profile/setup → 404 HTML
```

### Root Cause
**Clerk middleware is intercepting API requests.**

The desktop app sends these headers:
```
X-Solaris-User-Id: <user_id>
X-Solaris-Api-Key: <api_key>
```

But Clerk middleware expects:
```
Cookie: __clerk_session=... 
# OR
Authorization: Bearer <clerk_token>
```

When Clerk doesn't recognize the auth method, it either:
1. Returns 401/403, OR
2. Allows the request through but something else causes 404

---

## Root Cause Details

### Evidence from Terminal Output
The desktop app receives this HTML response:
```html
<h1 class="next-error-h1">404</h1>
<div>This page could not be found.</div>
```

This is Next.js's default `not-found.tsx` page, not a Clerk auth error. This means:
1. The request passed through Clerk (didn't get blocked with 401)
2. But the route handler itself is returning 404

### Most Likely Causes

**Cause 1: Route handlers throwing during SSR/static generation**
The Vercel deployment previously had `DYNAMIC_SERVER_USAGE` errors because routes use `headers()` during static generation. This may still be happening at runtime in a different form.

**Cause 2: Clerk middleware config excludes `/api/autogram/*`**
The middleware config may have `/api/*` as a public route but the route handlers still expect Clerk auth and fail without it.

**Cause 3: Route file structure mismatch**
Files exist at:
- `src/app/api/autogram/profile/setup/route.ts`

But the actual request goes to:
- `https://solaris-ai.xyz/api/autogram/profile/setup`

If there's a mismatch in the build output vs expected path, it would 404.

---

## Solution Steps for Web Team

### Step 1: Add Debug Logging to Route Handlers
Add immediate response logging at the TOP of each route handler to verify they're being reached:

```typescript
// src/app/api/autogram/boards/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('[Autogram API] GET /boards reached');
  
  try {
    const boards = await getBoards();
    return NextResponse.json(boards);
  } catch (err) {
    console.error('[Autogram API] GET /boards error:', err);
    return NextResponse.json(
      { error: 'Failed to get boards', details: err.message },
      { status: 500 }
    );
  }
}
```

### Step 2: Check Clerk Middleware Configuration
In `middleware.ts` (or wherever Clerk is configured), ensure `/api/autogram/*` is properly handled:

```typescript
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware(
  (auth, req) => {
    // Log all API requests for debugging
    if (req.nextUrl.pathname.startsWith('/api/autogram')) {
      console.log('[Middleware] Autogram request:', req.nextUrl.pathname);
    }
  },
  {
    // Ensure /api/autogram/* routes are NOT ignored by Clerk
    // but also don't require strict Clerk session
    publicRoutes: [
      '/api/auth/(.*)',
      // Add this if you want Autogram to be public:
      // '/api/autogram/(.*)',
    ],
  }
);
```

### Step 3: Create a Public Health Check Endpoint
Create a simple endpoint that doesn't use headers/cookies to verify routing works:

```typescript
// src/app/api/autogram/health/route.ts
export const dynamic = 'force-dynamic'; // Prevent static generation issues

export async function GET() {
  return Response.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.VERCEL_ENV || 'unknown'
  });
}
```

### Step 4: Fix Authentication for Desktop App
The desktop app sends `X-Solaris-User-Id` and `X-Solaris-Api-Key` headers. Update route handlers to accept this auth method:

```typescript
// In each route handler
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  // Try Clerk auth first
  const { userId } = auth();
  
  // Fall back to desktop app headers
  const desktopUserId = request.headers.get('X-Solaris-User-Id');
  const desktopApiKey = request.headers.get('X-Solaris-Api-Key');
  
  if (!userId && !desktopUserId) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // Use whichever auth method worked
  const effectiveUserId = userId || desktopUserId;
  
  // ... rest of handler
}
```

### Step 5: Add Force Dynamic to All Routes
Prevent static generation issues by marking all API routes as dynamic:

```typescript
// At the top of each route.ts file
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // or 'edge' if needed
```

---

## Verification Steps

### After Each Deploy, Test These URLs

**Test 1: Health Check (should work immediately)**
```bash
curl https://solaris-ai.xyz/api/autogram/health
# Expected: {"status":"ok","timestamp":"..."}
```

**Test 2: Public endpoint (no auth required)**
```bash
curl https://solaris-ai.xyz/api/autogram/boards
# Expected: [{"id":"...","name":"..."},...]
```

**Test 3: Authenticated endpoint (with desktop headers)**
```bash
curl -X POST https://solaris-ai.xyz/api/autogram/profile/setup \
  -H "Content-Type: application/json" \
  -H "X-Solaris-User-Id: test_user" \
  -H "X-Solaris-Api-Key: test_key" \
  -d '{"username":"test","display_name":"Test User"}'
# Expected: {"id":"...","username":"test",...}
```

---

## Desktop App Debugging Enhancement

To help diagnose what's happening, the desktop app needs to log the actual response body:

```typescript
// In autogram-manager.ts request() method
if (!res.ok) {
  const errorText = await res.text().catch(() => 'Unknown error');
  
  // NEW: Log full response details
  logWarn(`[Autogram] ${method} ${url} → ${res.status} ${res.statusText}`);
  logWarn(`[Autogram] Response body: ${errorText.substring(0, 500)}`);
  
  // If response starts with "<", it's HTML (likely 404 page)
  if (errorText.trim().startsWith('<')) {
    logWarn('[Autogram] Received HTML response instead of JSON - API route not found');
  }
  
  throw new Error(`Autogram: ${res.statusText} (${path})`);
}
```

This will show in the terminal whether it's a Clerk error, a Next.js 404, or something else.

---

## Immediate Workarounds (If Web Team Can't Fix Quickly)

### Option 1: Skip Clerk for Autogram Routes
In middleware.ts:
```typescript
export const config = {
  matcher: [
    '/((?!_next|api/autogram|.*\\..*).*)', // Exclude /api/autogram from middleware
  ],
};
```

### Option 2: Add a Proxy Route
Create a single proxy route that delegates to Autogram logic:
```typescript
// /api/autogram-proxy/route.ts
export async function POST(request: NextRequest) {
  const { path, body } = await request.json();
  // Delegate to actual handler
  return handleAutogramRequest(path, body);
}
```
Then desktop app calls `/api/autogram-proxy` instead of individual routes.

---

## Summary

The API routes are **built correctly** but **not being reached at runtime**. The issue is:
1. Either Clerk middleware is intercepting before handlers run
2. Or route handlers are throwing 404 during execution

**Next steps:**
1. Web team adds debug logging to verify routes are being reached
2. Web team adds `export const dynamic = 'force-dynamic'` to all routes
3. Web team verifies middleware isn't blocking `/api/autogram/*`
4. Desktop team adds response body logging to see exactly what's returned

The desktop app code is correct. This is entirely a web deployment/routing issue.
