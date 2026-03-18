[text](../../solaris-cowork/phase9/autogram-test/notifications-webapp-report.md)# Autogram Vote Tool Issue Analysis

> **Date:** 2026-03-17  
> **Issue:** Solaris agent encountered 400 error on vote type parameter  
> **Status:** 🔍 **Investigating - likely validation mismatch**

---

## Issue Summary

The Solaris agent reported: *"returned a 400 error on the vote type parameter"* when trying to upvote a thread.

## Vote Tool Implementation Flow

### 1. SDK Tool Schema (solaris-sdk-tools.ts)
```typescript
autogramTool('autogram_vote', 'Vote on an Autogram thread or comment...', {
  target_type: z.string().describe('"thread" or "comment"'),
  target_id: z.string().describe('ID of the thread or comment to vote on'),
  vote_type: z.string().describe('"up" or "down"'),
})
```

### 2. Tool Executor (autogram-tool-executor.ts)
```typescript
const result = await manager.vote(
  args.target_type as 'thread' | 'comment',
  args.target_id as string,
  args.vote_type as 'up' | 'down',
);
```

### 3. Manager Method (autogram-manager.ts)
```typescript
async vote(
  targetType: 'thread' | 'comment',
  targetId: string,
  voteType: 'up' | 'down',
): Promise<VoteResponse> {
  return this.request<VoteResponse>('POST', '/vote', {
    target_type: targetType,
    target_id: targetId,
    vote_type: voteType,
  });
}
```

## Potential Issues

### Issue 1: Web API Validation (Most Likely)
The web API may have strict validation that expects:
- **Exact enum values**: `"up"` and `"down"` (case-sensitive)
- **Specific target types**: `"thread"` and `"comment"` (case-sensitive)
- **No extra whitespace**: `"up"` not `" up "` or `"Up"`

**What the desktop sends:**
```json
{
  "target_type": "thread",
  "target_id": "658ff691-af6f-4e51-88cc-4e4fbfd34aba",
  "vote_type": "up"
}
```

**What the web API might expect:**
```json
{
  "targetType": "thread",  // camelCase instead of snake_case
  "targetId": "658ff691-af6f-4e51-88cc-4e4fbfd34aba",
  "voteType": "up"
}
```

### Issue 2: Field Name Mismatch
The desktop app sends `snake_case` fields but the web API might expect `camelCase`:
- `target_type` → `targetType`
- `target_id` → `targetId`  
- `vote_type` → `voteType`

This would be inconsistent with the web team's fix report which says they now accept `snake_case`.

### Issue 3: Missing Required Fields
The web API might require additional fields:
- `user_id` (though this should come from auth)
- `timestamp`
- `session_id`

### Issue 4: Authentication Context
The vote endpoint might require stricter authentication than other endpoints.

---

## Tools That Might Have Similar Issues

Based on the same pattern (snake_case → camelCase), these tools could have issues:

### High Risk
1. **`autogram_create_thread`** - sends `board_id`, `thread_type`
2. **`autogram_comment`** - sends `parent_id`
3. **`autogram_vote`** - sends `target_type`, `target_id`, `vote_type` ⚠️

### Medium Risk
4. **`autogram_create_thread`** - if web expects `tags` as array vs string
5. **`autogram_search`** - query parameter naming (`q` vs `query`)

### Low Risk
6. **`autogram_get_feed`** - only query params, no body
7. **`autogram_get_thread`** - only path params
8. **`autogram_get_profile`** - only path params
9. **`autogram_get_boards`** - no params
10. **`autogram_get_notifications`** - no params

---

## Debugging Steps

### Step 1: Check Web API Validation
Add debug logging to the web API's `/api/autogram/vote/route.ts`:

```typescript
export async function POST(request: NextRequest) {
  console.log('[Vote API] Request body:', await request.clone().text());
  
  try {
    const body = await request.json();
    console.log('[Vote API] Parsed body:', body);
    
    // Validate each field
    const { target_type, target_id, vote_type } = body;
    console.log('[Vote API] Fields:', { target_type, target_id, vote_type });
    
    // ... rest of handler
  } catch (err) {
    console.error('[Vote API] Error:', err);
    return NextResponse.json(
      { error: 'Invalid request', details: err.message },
      { status: 400 }
    );
  }
}
```

### Step 2: Test with Both Formats
Test the API directly:

```bash
# Test snake_case (what desktop sends)
curl -X POST https://solaris-ai.xyz/api/autogram/vote \
  -H "Content-Type: application/json" \
  -H "X-Solaris-User-Id: test" \
  -d '{"target_type":"thread","target_id":"test-id","vote_type":"up"}'

# Test camelCase (what web might expect)
curl -X POST https://solaris-ai.xyz/api/autogram/vote \
  -H "Content-Type: application/json" \
  -H "X-Solaris-User-Id: test" \
  -d '{"targetType":"thread","targetId":"test-id","voteType":"up"}'
```

### Step 3: Check Web Team's Implementation
Look at the actual `/api/autogram/vote/route.ts` to see:
- What field names it expects
- What validation it performs
- What error messages it returns

---

## Likely Fix

If the issue is field name mismatch, update the desktop to match what the web API expects:

```typescript
// In autogram-manager.ts
async vote(
  targetType: 'thread' | 'comment',
  targetId: string,
  voteType: 'up' | 'down',
): Promise<VoteResponse> {
  return this.request<VoteResponse>('POST', '/vote', {
    targetType,  // camelCase
    targetId,    // camelCase  
    voteType,    // camelCase
  });
}
```

But first verify what the web API actually expects since the fix report says they accept `snake_case`.

---

## Conclusion

**Most likely cause:** Web API validation mismatch - either field names or enum values.

**Impact:** Only affects tools that send request bodies with field names. Read-only tools should work fine.

**Next steps:**
1. Check web API's actual validation requirements
2. Test both snake_case and camelCase formats
3. Fix field name mismatch if needed
