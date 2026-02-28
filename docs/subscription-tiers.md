# Subscription Tiers and Management

## Subscription Structure

### Tier System
```typescript
enum SubscriptionTier {
  FREE = 'free',
  PRO = 'pro', 
  ENTERPRISE = 'enterprise'
}

interface SubscriptionLimits {
  monthlyTokens: number;
  dailyRequests: number;
  concurrentSessions: number;
  features: string[];
}

const TIER_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  [SubscriptionTier.FREE]: {
    monthlyTokens: 10000,
    dailyRequests: 100,
    concurrentSessions: 1,
    features: ['basic_models', 'chat_completion']
  },
  [SubscriptionTier.PRO]: {
    monthlyTokens: 100000,
    dailyRequests: 1000,
    concurrentSessions: 3,
    features: ['all_models', 'image_generation', 'code_execution', 'priority_queue']
  },
  [SubscriptionTier.ENTERPRISE]: {
    monthlyTokens: 1000000,
    dailyRequests: 10000,
    concurrentSessions: 10,
    features: ['all_models', 'custom_models', 'dedicated_support', 'sla_guarantee', 'white_label']
  }
};
```

### Database Schema
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL, -- active, cancelled, expired, suspended
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Usage tracking
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- web, desktop
  model VARCHAR(100) NOT NULL,
  tokens_used INTEGER NOT NULL,
  cost DECIMAL(10, 6) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- User API keys (from OAuth)
CREATE TABLE user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  openrouter_key_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);
```

## Subscription Management API

### Web Platform Endpoints
```typescript
// pages/api/subscription/index.ts
export default async function handler(req, res) {
  const { method } = req;
  const userId = await getUserIdFromToken(req);
  
  switch (method) {
    case 'GET':
      const subscription = await getSubscription(userId);
      res.json(subscription);
      break;
      
    case 'POST':
      // Create/update subscription (Stripe webhook)
      const { tier, stripeSubscriptionId } = req.body;
      await updateSubscription(userId, tier, stripeSubscriptionId);
      res.json({ success: true });
      break;
      
    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}

// pages/api/usage/index.ts
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const userId = await getUserIdFromToken(req);
    const { model, tokensUsed, cost, platform } = req.body;
    
    // Check limits before allowing usage
    const subscription = await getSubscription(userId);
    const monthlyUsage = await getMonthlyUsage(userId);
    
    if (monthlyUsage.tokens > subscription.limits.monthlyTokens) {
      return res.status(429).json({ error: 'Monthly token limit exceeded' });
    }
    
    // Log usage
    await logUsage(userId, model, tokensUsed, cost, platform);
    
    res.json({ success: true });
  }
}
```

### Desktop App Integration
```typescript
// src/api/SubscriptionAPI.ts
class SubscriptionAPI {
  private baseUrl: string;
  private accessToken: string;
  
  constructor(accessToken: string) {
    this.baseUrl = 'https://yourapp.com/api';
    this.accessToken = accessToken;
  }
  
  async getSubscription(): Promise<Subscription> {
    const response = await fetch(`${this.baseUrl}/subscription`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get subscription');
    }
    
    return await response.json();
  }
  
  async trackUsage(model: string, tokensUsed: number, cost: number): Promise<void> {
    await fetch(`${this.baseUrl}/usage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        tokensUsed,
        cost,
        platform: 'desktop'
      })
    });
  }
  
  async checkLimits(): Promise<{ canProceed: boolean; remaining: number }> {
    const subscription = await this.getSubscription();
    const monthlyUsage = await this.getMonthlyUsage();
    
    const remaining = subscription.limits.monthlyTokens - monthlyUsage.tokens;
    
    return {
      canProceed: remaining > 0,
      remaining
    };
  }
}
```

## Feature Gating

### Desktop App Feature Access
```typescript
// src/features/FeatureManager.ts
class FeatureManager {
  private subscription: Subscription;
  
  constructor(subscription: Subscription) {
    this.subscription = subscription;
  }
  
  hasFeature(feature: string): boolean {
    return this.subscription.limits.features.includes(feature);
  }
  
  canUseModel(model: string): boolean {
    if (!this.hasFeature('all_models')) {
      const basicModels = ['gpt-3.5-turbo', 'claude-instant'];
      return basicModels.includes(model);
    }
    return true;
  }
  
  getConcurrentSessionLimit(): number {
    return this.subscription.limits.concurrentSessions;
  }
  
  async checkUsageLimit(): Promise<boolean> {
    const api = new SubscriptionAPI(await getAccessToken());
    const { canProceed } = await api.checkLimits();
    return canProceed;
  }
}

// Usage in desktop app
const featureManager = new FeatureManager(subscription);

// Check before making API call
if (!featureManager.canUseModel(model)) {
  throw new Error('Model not available in your subscription tier');
}

if (!await featureManager.checkUsageLimit()) {
  throw new Error('Monthly usage limit reached');
}
```

## Usage Analytics

### Dashboard Components
```typescript
// components/UsageAnalytics.tsx
export default function UsageAnalytics({ userId }: { userId: string }) {
  const [usage, setUsage] = useState<UsageData>();
  
  useEffect(() => {
    fetchUsageData();
  }, [userId]);
  
  const fetchUsageData = async () => {
    const response = await fetch(`/api/usage/${userId}`);
    const data = await response.json();
    setUsage(data);
  };
  
  return (
    <div className="usage-dashboard">
      <div className="usage-cards">
        <div className="usage-card">
          <h3>Monthly Tokens</h3>
          <div className="usage-bar">
            <div 
              className="usage-fill" 
              style={{ width: `${(usage?.monthlyTokens / usage?.limit) * 100}%` }}
            />
          </div>
          <p>{usage?.monthlyTokens.toLocaleString()} / {usage?.limit.toLocaleString()}</p>
        </div>
        
        <div className="usage-card">
          <h3>Daily Requests</h3>
          <p>{usage?.dailyRequests} / {usage?.dailyLimit}</p>
        </div>
        
        <div className="usage-card">
          <h3>Active Sessions</h3>
          <p>{usage?.activeSessions} / {usage?.sessionLimit}</p>
        </div>
      </div>
      
      <div className="usage-chart">
        <h3>Usage Over Time</h3>
        {/* Chart component */}
      </div>
    </div>
  );
}
```

## Benefits of This System

1. **Centralized Control**: All subscription logic on web platform
2. **Real-time Validation**: Check limits before API calls
3. **Flexible Tiers**: Easy to add new features and limits
4. **Cross-platform**: Same subscription works on web and desktop
5. **Analytics**: Complete usage visibility
6. **Security**: No API keys exposed in desktop app

## Migration Path

1. **Phase 1**: Set up subscription database and API
2. **Phase 2**: Implement OAuth authentication
3. **Phase 3**: Update desktop app with new auth flow
4. **Phase 4**: Migrate existing users to subscription model
5. **Phase 5**: Deprecate direct API key usage
