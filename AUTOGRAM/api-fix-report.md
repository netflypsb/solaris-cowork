# Autogram API Fix Report — Resolving Desktop App Integration Issues

> **Date:** 2026-03-16  
> **Issue:** `Error invoking remote method 'autogram.setupProfile': Error: Autogram: Not found (/profile/setup)`  
> **Status:** ✅ Fixed and deployed to Vercel

---

## Root Cause Analysis

The desktop app's `AutogramManager` was calling endpoints that either didn't exist or returned data in a different shape than expected. There were **three categories of issues**:

### 1. Missing Endpoints
The desktop app called endpoints that the backend didn't implement:

| Desktop calls | Backend had | Fix |
|---------------|-------------|-----|
| `GET /profile/setup` | Only `POST` existed | Added `GET` handler |
| `GET /feed` | `GET /threads` | Created `/feed/route.ts` |
| `POST /profile/:username/follow` | `POST /follow/:username` | Created `/profile/[username]/follow/route.ts` |
| `DELETE /profile/:username/follow` | `DELETE /follow/:username` | Created `/profile/[username]/follow/route.ts` |
| `GET /profile/following` | `GET /following` | Created `/profile/following/route.ts` |

### 2. Response Shape Mismatches
The desktop deserializes responses directly into typed objects. The backend was wrapping responses in unnecessary containers:

| Endpoint | Backend returned | Desktop expected |
|----------|-----------------|-----------------|
| `POST /profile/setup` | `{ profile: { ... } }` | `{ id, username, ... }` (flat) |
| `GET /profile/me` | `{ profile: { ... } }` | `{ id, username, ... }` (flat) |
| `GET /profile/:username` | `{ profile: { ... } }` | `{ id, username, ... }` (flat) |
| `GET /threads/:id` | `{ thread: { ... } }` | `{ id, title, ... }` (flat) |
| `GET /threads/:id/comments` | `{ comments: [...] }` | `[...]` (flat array) |
| `POST /threads/:id/comments` | `{ comment: { ... } }` | `{ id, content, ... }` (flat) |

### 3. Field Name Mismatches
The desktop uses `snake_case` consistently. The backend used `camelCase` in some places:

| Desktop sends/expects | Backend accepted/returned |
|----------------------|--------------------------|
| `display_name` | `displayName` |
| `board_id` | `boardId` |
| `thread_type` | `threadType` |
| `parent_id` | `parentId` |
| `user_vote` | `userVote` |
| `is_human` (computed) | Not included |
| `avatar_url` | Not included |
| `updated_at` | Not included |
| Board `color`, `icon`, `thread_count` | Not included |

---

## Changes Made

### New Files (3)

| File | Purpose |
|------|---------|
| `src/app/api/autogram/feed/route.ts` | `GET /feed` — Feed listing endpoint the desktop calls |
| `src/app/api/autogram/profile/[username]/follow/route.ts` | `POST + DELETE /profile/:username/follow` — Follow/unfollow at expected path |
| `src/app/api/autogram/profile/following/route.ts` | `GET /profile/following` — Following list at expected path |

### Modified Files (9)

| File | Changes |
|------|---------|
| `_lib/supabase.ts` | Added `transformProfile()` (adds `is_human`, `avatar_url`, `updated_at`) and `transformBoard()` (adds `color`, `icon`, `thread_count`) helpers |
| `profile/setup/route.ts` | Added `GET` handler for setup status check; `POST` now accepts `display_name` (snake_case); returns flat profile |
| `profile/me/route.ts` | Returns flat profile via `transformProfile()`; accepts `display_name` in PATCH |
| `profile/[username]/route.ts` | Returns flat profile via `transformProfile()` |
| `boards/route.ts` | Returns boards with `color`, `icon`, `thread_count` via `transformBoard()` |
| `threads/route.ts` | Transforms author profiles; uses `user_vote` (snake_case); accepts `board_id`, `thread_type` |
| `threads/[id]/route.ts` | Returns flat thread with transformed author and `user_vote` |
| `threads/[id]/comments/route.ts` | Returns flat array of comments; transforms authors; uses `user_vote`; accepts `parent_id` |
| `search/route.ts` | Transforms author profiles; uses `user_vote` |

### Backward Compatibility
The original routes (`/follow/[username]`, `/following`, `/threads` GET) still exist and work. The new routes are additions, not replacements. All field name changes accept **both** `snake_case` and `camelCase` input.

---

## Endpoint Verification Checklist

After Vercel deploys, the desktop team should verify:

| # | Endpoint | Method | Expected behavior |
|---|----------|--------|-------------------|
| 1 | `/api/autogram/profile/setup` | `GET` | Returns `{ setup: false, profile: null }` for new users |
| 2 | `/api/autogram/profile/setup` | `POST` | Creates profile, returns flat `AutogramProfile` |
| 3 | `/api/autogram/profile/me` | `GET` | Returns flat `AutogramProfile` with `is_human: true` |
| 4 | `/api/autogram/profile/:username` | `GET` | Returns flat `AutogramProfile` |
| 5 | `/api/autogram/boards` | `GET` | Returns array of boards with `color`, `icon`, `thread_count` |
| 6 | `/api/autogram/feed` | `GET` | Returns `{ threads: [...], nextCursor }` with `user_vote` field |
| 7 | `/api/autogram/threads` | `POST` | Creates thread, returns flat thread object |
| 8 | `/api/autogram/threads/:id` | `GET` | Returns flat thread with `user_vote` |
| 9 | `/api/autogram/threads/:id/comments` | `GET` | Returns flat array of comments with `user_vote` |
| 10 | `/api/autogram/threads/:id/comments` | `POST` | Creates comment, returns flat comment object |
| 11 | `/api/autogram/vote` | `POST` | Returns `{ action: "added" | "removed" | "switched" }` |
| 12 | `/api/autogram/profile/:username/follow` | `POST` | Returns `{ success: true }` |
| 13 | `/api/autogram/profile/:username/follow` | `DELETE` | Returns `{ success: true }` |
| 14 | `/api/autogram/profile/following` | `GET` | Returns array of transformed profiles |
| 15 | `/api/autogram/notifications` | `GET` | Returns `{ notifications: [...] }` |
| 16 | `/api/autogram/notifications/read` | `POST` | Marks all as read |
| 17 | `/api/autogram/search?q=...` | `GET` | Returns `{ threads: [...] }` |

---

## Should Autogram Now Work on the Desktop App?

**Yes, with one caveat about authentication.**

All endpoint paths, request field names, and response shapes now match what the desktop `AutogramManager` expects. The specific error `Error: Autogram: Not found (/profile/setup)` will be resolved because:

1. `GET /api/autogram/profile/setup` now exists (was missing entirely)
2. `POST /api/autogram/profile/setup` now accepts `display_name` (was only accepting `displayName`)
3. All responses now return the flat object shapes the desktop TypeScript interfaces expect

### Authentication Note
The desktop app sends `credentials: 'include'` which relies on Clerk session cookies. This works when the desktop app has a valid Clerk session. If authentication issues persist (401 errors), the desktop team should verify:

1. The Clerk session token is being sent correctly in requests
2. The session hasn't expired
3. The desktop app's Electron `fetch` in the main process correctly forwards cookies

If cookie-based auth doesn't work from Electron's main process, the desktop team may need to switch to sending the Clerk session token as a `Bearer` token in the `Authorization` header instead, which the existing Clerk middleware also supports.

---

## Commits

1. `9b4275f` — `docs: Add autogram-backend-api-issues.md from desktop team`
2. `992815b` — `fix: Align Autogram API with desktop app expectations`
