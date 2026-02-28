# Minimal Architecture: Clerk + OpenRouter Only

## Overview
Eliminate Supabase dependency and use only Clerk + OpenRouter for a simpler, more cost-effective solution.

## Architecture Flow

```
User → Clerk Auth → Clerk Metadata → OpenRouter OAuth → AI Access
```

## Data Storage Strategy

### Clerk Metadata for User Data
```typescript
// Store subscription info in Clerk user metadata
interface ClerkUserMetadata {
  subscription: {
    tier: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodEnd?: string;
  };
  openrouter?: {
    keyHash: string;
    keyLabel: string;
    lastUsed: string;
  };
  usage: {
    monthlyTokens: number;
    lastReset: string;
  };
}
```

### OpenRouter for AI Data
- API keys managed via OpenRouter Management API
- Usage tracking via OpenRouter analytics
- Rate limiting via OpenRouter quotas

## Implementation

### 1. Clerk Webhook Handler
```typescript
// pages/api/webhooks/clerk.ts
import { Clerk } from '@clerk/clerk-sdk-node';
import { OpenRouter } from '@openrouter/sdk';

const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });
const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_MANAGEMENT_API_KEY!
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, data } = req.body;

  switch (type) {
    case 'user.created':
      await handleUserCreated(data);
      break;
    case 'user.updated':
      await handleUserUpdated(data);
      break;
    case 'user.deleted':
      await handleUserDeleted(data);
      break;
  }

  res.json({ success: true });
}

async function handleUserCreated(userData: any) {
  // Initialize user metadata
  await clerk.users.updateUserMetadata(userData.id, {
    publicMetadata: {
      subscription: {
        tier: 'free',
        status: 'active'
      },
      usage: {
        monthlyTokens: 0,
        lastReset: new Date().toISOString()
      }
    }
  });
}

async function handleUserUpdated(userData: any) {
  // Handle subscription changes
  if (userData.public_metadata?.subscription) {
    const subscription = userData.public_metadata.subscription;
    
    if (subscription.tier !== 'free' && !userData.public_metadata.openrouter) {
      // Create OpenRouter API key for paid users
      const apiKey = await openRouter.apiKeys.create({
        name: `User-${userData.id}-${subscription.tier}`,
        limit: getTierLimit(subscription.tier),
        limit_reset: 'monthly'
      });

      await clerk.users.updateUserMetadata(userData.id, {
        publicMetadata: {
          ...userData.public_metadata,
          openrouter: {
            keyHash: apiKey.hash,
            keyLabel: apiKey.label,
            lastUsed: new Date().toISOString()
          }
        }
      });
    }
  }
}

function getTierLimit(tier: string): number {
  switch (tier) {
    case 'pro': return 100000;
    case 'enterprise': return 1000000;
    default: return 10000;
  }
}
```

### 2. Subscription Management API
```typescript
// pages/api/subscription/index.ts
import { clerkClient } from '@clerk/nextjs/server';
import { OpenRouter } from '@openrouter/sdk';

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_MANAGEMENT_API_KEY!
});

export default async function handler(req, res) {
  const { userId } = await clerkClient.authenticate(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await clerkClient.users.getUser(userId);
  const metadata = user.publicMetadata;

  switch (req.method) {
    case 'GET':
      res.json({
        subscription: metadata.subscription,
        usage: metadata.usage,
        hasApiKey: !!metadata.openrouter
      });
      break;

    case 'POST':
      // Handle subscription upgrade
      const { tier, stripeSubscriptionId } = req.body;
      
      // Update Clerk metadata
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...metadata,
          subscription: {
            tier,
            status: 'active',
            stripeSubscriptionId,
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        }
      });

      // Create OpenRouter key if upgrading from free
      if (tier !== 'free' && !metadata.openrouter) {
        const apiKey = await openRouter.apiKeys.create({
          name: `User-${userId}-${tier}`,
          limit: getTierLimit(tier),
          limit_reset: 'monthly'
        });

        await clerkClient.users.updateUserMetadata(userId, {
          publicMetadata: {
            ...metadata,
            subscription: {
              tier,
              status: 'active',
              stripeSubscriptionId,
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            openrouter: {
              keyHash: apiKey.hash,
              keyLabel: apiKey.label,
              lastUsed: new Date().toISOString()
            }
          }
        });
      }

      res.json({ success: true });
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}
```

### 3. OpenRouter Key Access
```typescript
// pages/api/user/openrouter-key.ts
import { clerkClient } from '@clerk/nextjs/server';
import { OpenRouter } from '@openrouter/sdk';

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_MANAGEMENT_API_KEY!
});

export default async function handler(req, res) {
  const { userId } = await clerkClient.authenticate(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await clerkClient.users.getUser(userId);
  const metadata = user.publicMetadata;

  // Check subscription status
  if (metadata.subscription?.tier === 'free' || metadata.subscription?.status !== 'active') {
    return res.status(403).json({ error: 'Active subscription required' });
  }

  if (!metadata.openrouter?.keyHash) {
    return res.status(404).json({ error: 'No API key found' });
  }

  try {
    // Get full API key details from OpenRouter
    const apiKey = await openRouter.apiKeys.get(metadata.openrouter.keyHash);
    
    // Update last used
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...metadata,
        openrouter: {
          ...metadata.openrouter,
          lastUsed: new Date().toISOString()
        }
      }
    });

    res.json({
      key: apiKey.key,
      label: apiKey.label,
      limits: {
        limit: apiKey.limit,
        limit_remaining: apiKey.limit_remaining
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve API key' });
  }
}
```

### 4. Usage Tracking
```typescript
// pages/api/usage/track.ts
import { clerkClient } from '@clerk/nextjs/server';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = await clerkClient.authenticate(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { tokensUsed, model, platform } = req.body;
  
  const user = await clerkClient.users.getUser(userId);
  const metadata = user.publicMetadata;

  // Reset monthly usage if needed
  const lastReset = new Date(metadata.usage?.lastReset || 0);
  const now = new Date();
  
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    // Reset monthly usage
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...metadata,
        usage: {
          monthlyTokens: tokensUsed,
          lastReset: now.toISOString()
        }
      }
    });
  } else {
    // Update usage
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...metadata,
        usage: {
          monthlyTokens: (metadata.usage?.monthlyTokens || 0) + tokensUsed,
          lastReset: metadata.usage?.lastReset || now.toISOString()
        }
      }
    });
  }

  res.json({ success: true });
}
```

### 5. Desktop App Authentication
```typescript
// Desktop app auth manager
class DesktopAuthManager {
  async signIn(): Promise<void> {
    // Open Clerk sign-in page
    const signInUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign-in?redirect_url=${encodeURIComponent('solaris://auth/callback')}`;
    await shell.openExternal(signInUrl);
  }

  async handleCallback(sessionToken: string): Promise<void> {
    // Validate Clerk session token
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: sessionToken })
    });

    if (response.ok) {
      const { userId, subscription } = await response.json();
      await this.storeSession({ userId, subscription, sessionToken });
    }
  }

  async getOpenRouterKey(): Promise<string> {
    const session = await this.getStoredSession();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/openrouter-key`, {
      headers: { 'Authorization': `Bearer ${session.sessionToken}` }
    });

    if (!response.ok) {
      throw new Error('Failed to get OpenRouter key');
    }

    const { key } = await response.json();
    return key;
  }
}
```

## Benefits of This Minimal Approach

### ✅ **Cost Effective**
- No Supabase hosting costs
- Fewer services to manage
- Simpler billing

### ✅ **Less Complexity**
- Only 2 services to integrate
- Fewer moving parts
- Easier debugging

### ✅ **Faster Development**
- No database schema to manage
- No migrations needed
- Quicker iteration

### ✅ **Adequate for Current Needs**
- Clerk handles all user data
- OpenRouter handles all AI data
- No complex relationships requiring a database

## When to Add Supabase Later

Add Supabase only if you need:
- Complex analytics beyond OpenRouter's built-in
- User-generated content (files, documents)
- Complex data relationships
- Custom reporting dashboards

## Migration Path

1. **Remove Supabase dependencies** from package.json
2. **Update Clerk webhooks** to handle user metadata
3. **Create new API routes** for subscription management
4. **Update desktop app** to use Clerk session tokens
5. **Test integration** thoroughly

This approach gives you the same security benefits with significantly less complexity and cost.
