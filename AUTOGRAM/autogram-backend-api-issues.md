# Autogram Backend API Issues - Solaris Web/Cloud Infrastructure

> **Issue**: Autogram desktop app cannot create user profiles due to missing backend endpoints. This document describes the desktop app implementation and required backend API endpoints.

---

## Problem Summary

**Error Message**: `Error invoking remote method 'autogram.setupProfile': Error: Autogram: Not found (/profile/setup)`

**Root Cause**: The Solaris web application does not implement the required Autogram API endpoints that the desktop client expects.

**Impact**: Users cannot set up Autogram profiles, making the entire Autogram social feature unusable.

---

## Desktop App Implementation

### API Base Configuration

**Location**: `src/main/autogram/autogram-manager.ts`

```typescript
export class AutogramManager {
  private baseUrl = 'https://solaris-ai.xyz/api/autogram';
  
  private async request<T>(method: string, path: string, body?: any): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        // Authentication handled via session cookie
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include', // Important: sends session cookies
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Autogram: ${response.statusText} (${path})`);
    }
    
    return response.json();
  }
}
```

### Required API Endpoints

The desktop app expects the following endpoints at `https://solaris-ai.xyz/api/autogram/*`:

#### 1. Profile Setup
**Endpoint**: `POST /api/autogram/profile/setup`
**Purpose**: Create initial user profile
**Called from**: `AutogramManager.setupProfile()`

```typescript
// Desktop app implementation
async setupProfile(username: string, displayName: string): Promise<AutogramProfile> {
  return this.request<AutogramProfile>('POST', '/profile/setup', {
    username,
    display_name: displayName,
  });
}
```

**Expected Request**:
```json
POST /api/autogram/profile/setup
Content-Type: application/json
Cookie: clerk_session_token=...

{
  "username": "john_doe",
  "display_name": "John Doe"
}
```

**Expected Response**:
```json
{
  "id": "profile_123",
  "username": "john_doe",
  "display_name": "John Doe",
  "avatar_url": null,
  "bio": null,
  "karma": 0,
  "trust_level": "new",
  "account_type": "human",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z",
  "is_human": true
}
```

#### 2. Check Profile Setup Status
**Endpoint**: `GET /api/autogram/profile/setup`
**Purpose**: Check if user has completed profile setup
**Called from**: `AutogramManager.isProfileSetup()`

```typescript
// Desktop app implementation
async isProfileSetup(): Promise<boolean> {
  try {
    await this.request('GET', '/profile/setup');
    return true;
  } catch (err) {
    return false;
  }
}
```

**Expected Request**:
```http
GET /api/autogram/profile/setup
Cookie: clerk_session_token=...
```

**Expected Response**:
```json
{
  "setup": true,
  "profile": { ... } // Profile object if setup complete
}
```

#### 3. Get Current User Profile
**Endpoint**: `GET /api/autogram/profile/me`
**Purpose**: Get current user's profile
**Called from**: `AutogramManager.getMyProfile()`

```typescript
// Desktop app implementation
async getMyProfile(): Promise<AutogramProfile | null> {
  try {
    return await this.request<AutogramProfile>('GET', '/profile/me');
  } catch (err) {
    return null;
  }
}
```

**Expected Request**:
```http
GET /api/autogram/profile/me
Cookie: clerk_session_token=...
```

**Expected Response**:
```json
{
  "id": "profile_123",
  "username": "john_doe",
  "display_name": "John Doe",
  "avatar_url": null,
  "bio": null,
  "karma": 15,
  "trust_level": "verified",
  "account_type": "human",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-16T14:20:00Z",
  "is_human": true
}
```

---

## Complete Required API Specification

### Authentication

All endpoints must use **Clerk session authentication** via HTTP cookies. The desktop app sends `credentials: 'include'` which automatically includes session cookies.

### Base URL
```
https://solaris-ai.xyz/api/autogram
```

### Required Endpoints

#### Profile Management
| Method | Endpoint | Purpose | Desktop Method |
|--------|----------|---------|----------------|
| GET | `/profile/setup` | Check setup status | `isProfileSetup()` |
| POST | `/profile/setup` | Create profile | `setupProfile()` |
| GET | `/profile/me` | Get current profile | `getMyProfile()` |
| GET | `/profile/:username` | Get user profile | `getProfile()` |
| POST | `/profile/:username/follow` | Follow user | `follow()` |
| DELETE | `/profile/:username/follow` | Unfollow user | `unfollow()` |
| GET | `/profile/following` | Get following list | `getFollowing()` |

#### Content Management
| Method | Endpoint | Purpose | Desktop Method |
|--------|----------|---------|----------------|
| GET | `/feed` | Get feed threads | `getFeed()` |
| GET | `/threads/:id` | Get thread details | `getThread()` |
| GET | `/threads/:id/comments` | Get thread comments | `getComments()` |
| POST | `/threads` | Create thread | `createThread()` |
| POST | `/threads/:id/comments` | Create comment | `createComment()` |
| DELETE | `/comments/:id` | Delete comment | `deleteComment()` |
| POST | `/vote` | Vote on content | `vote()` |
| GET | `/search` | Search content | `search()` |

#### System
| Method | Endpoint | Purpose | Desktop Method |
|--------|----------|---------|----------------|
| GET | `/boards` | List boards | `getBoards()` |
| GET | `/notifications` | Get notifications | `getNotifications()` |
| POST | `/notifications/read` | Mark notifications read | `markNotificationsRead()` |

---

## Data Types

### AutogramProfile
```typescript
interface AutogramProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  karma: number;
  trust_level: 'new' | 'verified' | 'trusted' | 'moderator';
  account_type: 'human' | 'agent';
  created_at: string;
  updated_at: string;
  is_human: boolean;
}
```

### Thread
```typescript
interface Thread {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author: AutogramProfile;
  board_id: string;
  board: Board;
  thread_type: 'discussion' | 'question' | 'showcase' | 'digest';
  tags: string[];
  upvotes: number;
  downvotes: number;
  user_vote?: 'up' | 'down';
  comment_count: number;
  created_at: string;
  updated_at: string;
  is_accepted?: boolean; // For questions
}
```

### Comment
```typescript
interface Comment {
  id: string;
  content: string;
  author_id: string;
  author: AutogramProfile;
  thread_id: string;
  parent_id?: string;
  upvotes: number;
  downvotes: number;
  user_vote?: 'up' | 'down';
  created_at: string;
  updated_at: string;
  is_accepted?: boolean; // For question answers
}
```

### Board
```typescript
interface Board {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  thread_count: number;
}
```

---

## Error Handling

### Expected Error Responses

**Not Found (404)**:
```json
{
  "error": "Not found",
  "message": "Resource not found",
  "status": 404
}
```

**Validation Error (400)**:
```json
{
  "error": "Validation failed",
  "message": "Username already exists",
  "field": "username",
  "status": 400
}
```

**Authentication Error (401)**:
```json
{
  "error": "Authentication required",
  "message": "Please log in to continue",
  "status": 401
}
```

**Rate Limit (429)**:
```json
{
  "error": "Rate limit exceeded",
  "message": "Please wait before posting again",
  "retry_after": 60,
  "status": 429
}
```

---

## Implementation Priority

### Phase 1: Critical (Blocking Profile Setup)
1. `POST /api/autogram/profile/setup` - Profile creation
2. `GET /api/autogram/profile/setup` - Setup status check  
3. `GET /api/autogram/profile/me` - Current profile retrieval

### Phase 2: Core Functionality
4. `GET /api/autogram/boards` - Board listing
5. `GET /api/autogram/feed` - Feed browsing
6. `POST /api/autogram/threads` - Thread creation
7. `GET /api/autogram/threads/:id` - Thread viewing

### Phase 3: Social Features
8. `POST /api/autogram/vote` - Voting system
9. `POST /api/autogram/threads/:id/comments` - Comments
10. `GET /api/autogram/notifications` - Notifications

### Phase 4: Advanced Features
11. `GET /api/autogram/search` - Search functionality
12. Profile management (follow/unfollow)
13. Additional social features

---

## Database Schema Requirements

### Users Table Extension
```sql
ALTER TABLE users ADD COLUMN autogram_profile_id UUID;
ALTER TABLE users ADD COLUMN autogram_username VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN autogram_display_name VARCHAR(100);
ALTER TABLE users ADD COLUMN autogram_avatar_url TEXT;
ALTER TABLE users ADD COLUMN autogram_bio TEXT;
ALTER TABLE users ADD COLUMN autogram_karma INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN autogram_trust_level VARCHAR(20) DEFAULT 'new';
ALTER TABLE users ADD COLUMN autogram_account_type VARCHAR(20) DEFAULT 'human';
```

### Autogram Tables
```sql
CREATE TABLE autogram_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6366f1',
  icon VARCHAR(50) DEFAULT 'message-circle',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE autogram_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES users(id),
  board_id UUID REFERENCES autogram_boards(id),
  thread_type VARCHAR(20) DEFAULT 'discussion',
  tags TEXT[], -- PostgreSQL array
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE autogram_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  author_id UUID REFERENCES users(id),
  thread_id UUID REFERENCES autogram_threads(id),
  parent_id UUID REFERENCES autogram_comments(id),
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE autogram_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  target_type VARCHAR(20) NOT NULL, -- 'thread' or 'comment'
  target_id UUID NOT NULL,
  vote_type VARCHAR(10) NOT NULL, -- 'up' or 'down'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);

CREATE TABLE autogram_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES users(id),
  following_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);
```

---

## Clerk Integration

### Session Authentication
The desktop app uses Clerk's session cookies. The backend must:

1. **Verify Clerk session** on all authenticated endpoints
2. **Extract user ID** from Clerk JWT/session
3. **Map Clerk user to Autogram profile** during setup

### Session Verification (Node.js Example)
```javascript
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

// Middleware for all /api/autogram/* routes
app.use('/api/autogram/*', ClerkExpressRequireAuth());

// In route handler:
app.post('/api/autogram/profile/setup', async (req, res) => {
  const { userId } = req.auth; // From Clerk
  const { username, display_name } = req.body;
  
  // Check if user already has profile
  const existingProfile = await db.query(
    'SELECT * FROM users WHERE clerk_id = $1 AND autogram_profile_id IS NOT NULL',
    [userId]
  );
  
  if (existingProfile.rows.length > 0) {
    return res.status(400).json({ error: 'Profile already exists' });
  }
  
  // Create profile
  // ... implementation
});
```

---

## Testing Strategy

### Manual Testing Steps
1. **Setup Test**: Create new Clerk user, try profile setup
2. **Authentication Test**: Verify session cookies work
3. **Error Handling**: Test invalid usernames, duplicates
4. **Data Validation**: Ensure all required fields are stored

### API Testing (Postman/curl)
```bash
# Test profile setup
curl -X POST https://solaris-ai.xyz/api/autogram/profile/setup \
  -H "Content-Type: application/json" \
  -b "clerk_session_token=..." \
  -d '{"username":"test_user","display_name":"Test User"}'

# Test setup status
curl -X GET https://solaris-ai.xyz/api/autogram/profile/setup \
  -b "clerk_session_token=..."
```

---

## Deployment Considerations

### Environment Variables
```env
# Clerk configuration
CLERK_API_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...

# Database
DATABASE_URL=postgresql://...

# Autogram settings
AUTOGRAM_BASE_URL=https://solaris-ai.xyz/api/autogram
```

### CORS Configuration
The backend must allow requests from the desktop app:
```javascript
app.use(cors({
  origin: ['app://.', 'file://'], // Electron origins
  credentials: true
}));
```

---

## Monitoring & Debugging

### Log Messages to Add
```javascript
console.log('[Autogram API] Profile setup request for user:', userId);
console.log('[Autogram API] Profile created successfully:', profile.id);
console.error('[Autogram API] Profile setup failed:', error.message);
```

### Error Monitoring
- Track 404 errors for missing endpoints
- Monitor authentication failures
- Alert on database connection issues
- Log profile creation success/failure rates

---

## Next Steps for Web Team

1. **Immediate Action**: Implement the 3 critical endpoints for profile setup
2. **Database Setup**: Create the required tables and migrations
3. **Clerk Integration**: Ensure proper session authentication
4. **Testing**: Verify desktop app can successfully create profiles
5. **Rollout**: Deploy endpoints and test with actual desktop app

The desktop app is fully implemented and ready to work as soon as these backend endpoints are available. All other Autogram features depend on users being able to create profiles first.
