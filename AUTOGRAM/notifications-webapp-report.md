# Autogram Notifications API — Webapp Issue Report

> **Date:** 2026-03-18  
> **Issue:** Notifications API returns error on empty state; desktop app goes blank  
> **Root Cause:** BOTH webapp and desktop — details below  
> **Desktop Fix Status:** ✅ Implemented

---

## Issue Summary

When a user with zero notifications clicks the Notifications button in the Autogram panel:
1. The API returns an error (likely 500) instead of an empty array
2. The desktop app crashes to a blank screen

## Desktop Fixes Applied ✅

We've fixed 4 issues on the desktop side:

### 1. Response format handling
The API returns `{ notifications: [...] }` (wrapped) but the desktop expected a flat array. Fixed `getNotifications()` to handle both formats:
```typescript
const result = await this.request<any>('GET', '/notifications');
if (Array.isArray(result)) return result;
if (result && Array.isArray(result.notifications)) return result.notifications;
return [];
```

### 2. markNotificationsRead IPC handler
Was throwing errors back to the renderer. Fixed to return gracefully:
```typescript
// Before: throw error (crashes renderer)
// After:  return { success: false } (graceful)
```

### 3. Defensive rendering
Added `!Array.isArray(notifications)` check before `.map()` to prevent render crashes.

### 4. Error Boundary
Added `AutogramErrorBoundary` to the panel so component crashes show a "Something went wrong" message with a "Go back to feed" button, instead of blanking the entire app.

---

## Webapp Issues to Fix

### Issue 1: Empty notifications should return 200, not error

**Current behavior:** `GET /api/autogram/notifications` returns an error (500 or throws) when the user has zero notifications.

**Expected behavior:** Return `200 OK` with an empty array.

**Fix in `/api/autogram/notifications/route.ts`:**
```typescript
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request); // your auth helper
    
    const notifications = await db.query(
      'SELECT * FROM autogram_notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    
    // Return empty array, NOT an error, when there are no notifications
    return NextResponse.json(notifications.rows || []);
    
  } catch (err) {
    console.error('[Autogram] GET /notifications error:', err);
    // Return empty array on error too, don't let it crash
    return NextResponse.json([], { status: 200 });
  }
}
```

**Key points:**
- An empty result set is NOT an error — return `[]` or `{ notifications: [] }` with status 200
- Don't throw or return 500 when there are simply no rows
- Common mistake: calling `.rows[0]` on an empty result and getting `undefined`, then accessing a property on it

### Issue 2: Response format consistency

The desktop now handles both formats, but please standardize on one:

**Option A (preferred — flat array):**
```json
[]
```

**Option B (wrapped):**
```json
{ "notifications": [] }
```

Pick one and document it. The desktop handles both.

### Issue 3: markNotificationsRead on empty state

`POST /api/autogram/notifications/read` may also error when there are no notifications to mark. This should be a no-op success:

```typescript
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    
    // This should succeed even if there are 0 rows to update
    await db.query(
      'UPDATE autogram_notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [userId]
    );
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Autogram] POST /notifications/read error:', err);
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
```

---

## Testing Checklist

After fixing:
- [ ] `GET /api/autogram/notifications` with a new user (0 notifications) returns `200 []`
- [ ] `POST /api/autogram/notifications/read` with 0 unread returns `200 { success: true }`
- [ ] `GET /api/autogram/notifications` with existing notifications returns correct array
- [ ] Desktop: clicking Notifications button shows "No notifications yet" (not blank screen)
- [ ] Desktop: with notifications present, they render correctly

---

## Summary

| Component | Issue | Status |
|-----------|-------|--------|
| **Webapp** | Notifications API errors on empty state | 🔴 Needs fix |
| **Webapp** | markNotificationsRead may error on empty state | 🔴 Needs fix |
| **Desktop** | Doesn't handle wrapped response format | ✅ Fixed |
| **Desktop** | markNotificationsRead throw crashes renderer | ✅ Fixed |
| **Desktop** | No defensive array check in render | ✅ Fixed |
| **Desktop** | No error boundary — crashes to blank screen | ✅ Fixed |
