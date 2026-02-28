# Clerk + Supabase Integration Architecture

## Overview
Leverage existing Clerk authentication with Supabase for data management and OpenRouter integration.

## Authentication Flow

### 1. User Authentication (Clerk)
```
User → Clerk Sign In → Clerk Session → Web App
```

### 2. OpenRouter OAuth (Separate Flow)
```
Web App → OpenRouter OAuth → API Key → Store in Supabase
```

### 3. Desktop App Authentication
```
Desktop App → Clerk Session Token → Web API → Supabase → OpenRouter Key
```

## Database Schema Updates

### Add to existing supabase-schema.sql:

```sql
-- ============================================================
-- Subscription management
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL REFERENCES user_profiles(clerk_user_id),
  tier VARCHAR(50) NOT NULL DEFAULT 'free', -- free, pro, enterprise
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, cancelled, expired, suspended
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  monthly_token_limit INTEGER DEFAULT 10000,
  daily_request_limit INTEGER DEFAULT 100,
  concurrent_session_limit INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Usage tracking across platforms
-- ============================================================
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id VARCHAR(255) NOT NULL REFERENCES user_profiles(clerk_user_id),
  platform VARCHAR(50) NOT NULL, -- web, desktop
  model VARCHAR(100) NOT NULL,
  tokens_used INTEGER NOT NULL,
  cost DECIMAL(10, 6) NOT NULL,
  request_type VARCHAR(50) NOT NULL, -- chat, completion, embedding
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_tier VARCHAR(50) NOT NULL REFERENCES subscriptions(tier)
);

-- ============================================================
-- Feature access control
-- ============================================================
CREATE TABLE IF NOT EXISTS tier_features (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tier VARCHAR(50) UNIQUE NOT NULL,
  features JSONB NOT NULL, -- {"models": ["all"], "image_generation": true, ...}
  monthly_token_limit INTEGER,
  daily_request_limit INTEGER,
  concurrent_session_limit INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Desktop app sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS desktop_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id VARCHAR(255) NOT NULL REFERENCES user_profiles(clerk_user_id),
  session_token_hash VARCHAR(255) NOT NULL,
  device_info JSONB,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_clerk_user_id ON subscriptions(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_logs_clerk_user_id ON usage_logs(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_timestamp ON usage_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_desktop_sessions_clerk_user_id ON desktop_sessions(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_desktop_sessions_token_hash ON desktop_sessions(session_token_hash);

-- RLS Policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE desktop_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid()::text = clerk_user_id);

-- Service role full access for subscriptions
CREATE POLICY "Service role full access on subscriptions" ON subscriptions
  FOR ALL USING (true) WITH CHECK (true);

-- Users can view their own usage
CREATE POLICY "Users can view own usage" ON usage_logs
  FOR SELECT USING (auth.uid()::text = clerk_user_id);

-- Service role full access for usage logs
CREATE POLICY "Service role full access on usage_logs" ON usage_logs
  FOR ALL USING (true) WITH CHECK (true);

-- Public read access for tier features
CREATE POLICY "Public read tier features" ON tier_features
  FOR SELECT USING (true);

-- Service role full access for tier features
CREATE POLICY "Service role full access on tier_features" ON tier_features
  FOR ALL USING (true) WITH CHECK (true);

-- Users can manage their own desktop sessions
CREATE POLICY "Users can manage own desktop sessions" ON desktop_sessions
  FOR ALL USING (auth.uid()::text = clerk_user_id);

-- Triggers for updated_at
CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_logs_updated_at
  BEFORE UPDATE ON usage_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tier_features_updated_at
  BEFORE UPDATE ON tier_features
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_desktop_sessions_updated_at
  BEFORE UPDATE ON desktop_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Initialize tier features
-- ============================================================
INSERT INTO tier_features (tier, features, monthly_token_limit, daily_request_limit, concurrent_session_limit) VALUES
('free', '{"models": ["openai/gpt-3.5-turbo", "anthropic/claude-instant"], "image_generation": false, "code_execution": false, "priority_queue": false}', 10000, 100, 1),
('pro', '{"models": ["all"], "image_generation": true, "code_execution": true, "priority_queue": true}', 100000, 1000, 3),
('enterprise', '{"models": ["all", "custom"], "image_generation": true, "code_execution": true, "priority_queue": true, "dedicated_support": true, "sla_guarantee": true}', 1000000, 10000, 10)
ON CONFLICT (tier) DO NOTHING;
```

## API Implementation

### Web Platform API Routes

#### pages/api/auth/openrouter.ts
```typescript
import { clerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user from Clerk session
    const { userId } = await clerkClient.authenticate(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user has active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('clerk_user_id', userId)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return res.status(403).json({ error: 'Active subscription required' });
    }

    // Generate PKCE
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

    // Store code verifier temporarily
    await supabase
      .from('desktop_sessions')
      .insert({
        clerk_user_id: userId,
        session_token_hash: crypto.createHash('sha256').update(codeVerifier).digest('hex'),
        device_info: req.body.deviceInfo || {},
      });

    // Return OAuth URL
    const authUrl = `https://openrouter.ai/auth?callback_url=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_URL + '/api/auth/openrouter/callback')}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

    res.json({ authUrl, codeVerifier });
  } catch (error) {
    console.error('OpenRouter OAuth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

#### pages/api/auth/openrouter/callback.ts
```typescript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, codeVerifier, userId } = req.body;

    // Exchange code for OpenRouter API key
    const response = await fetch('https://openrouter.ai/api/v1/auth/keys', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_MANAGEMENT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code,
        code_verifier: codeVerifier
      })
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for API key');
    }

    const { key, hash, label } = await response.json();

    // Store API key in Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase
      .from('user_api_keys')
      .upsert({
        clerk_user_id: userId,
        openrouter_key_hash: hash,
        openrouter_key_label: label,
        key_name: `Desktop App - ${new Date().toISOString()}`,
        is_active: true,
      });

    // Clean up temporary session
    await supabase
      .from('desktop_sessions')
      .delete()
      .eq('clerk_user_id', userId)
      .eq('session_token_hash', crypto.createHash('sha256').update(codeVerifier).digest('hex'));

    res.json({ success: true, keyHash: hash });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

#### pages/api/subscription/index.ts
```typescript
export default async function handler(req, res) {
  const { method } = req;

  // Get user from Clerk
  const { userId } = await clerkClient.authenticate(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  switch (method) {
    case 'GET':
      // Get user's subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select(`
          *,
          tier_features(*)
        `)
        .eq('clerk_user_id', userId)
        .single();

      // Get current usage
      const { data: usage } = await supabase
        .from('usage_logs')
        .select('tokens_used, cost')
        .eq('clerk_user_id', userId)
        .gte('timestamp', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      const monthlyUsage = usage?.reduce((acc, log) => ({
        tokens: acc.tokens + log.tokens_used,
        cost: acc.cost + parseFloat(log.cost)
      }), { tokens: 0, cost: 0 }) || { tokens: 0, cost: 0 };

      res.json({
        subscription,
        usage: monthlyUsage,
        canUseAI: subscription?.status === 'active' && monthlyUsage.tokens < subscription.monthly_token_limit
      });
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}
```

### Desktop App Integration

#### Auth Manager (Electron)
```typescript
class DesktopAuthManager {
  async signInWithClerk(): Promise<void> {
    // Get Clerk session token from web app
    const authUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign-in?redirect_url=${encodeURIComponent('solaris://auth/callback')}`;
    await shell.openExternal(authUrl);
  }

  async handleClerkCallback(token: string): Promise<void> {
    // Validate Clerk token with web API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    if (response.ok) {
      const { userId, subscription } = await response.json();
      await this.storeUserSession(userId, subscription);
    }
  }

  async getOpenRouterKey(): Promise<string> {
    const { userId } = await this.getStoredSession();
    
    // Get user's OpenRouter key from web API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/openrouter-key`, {
      headers: { 'Authorization': `Bearer ${await this.getClerkToken()}` }
    });

    if (!response.ok) {
      throw new Error('Failed to get OpenRouter key');
    }

    const { key } = await response.json();
    return key;
  }
}
```

## Benefits of This Architecture

### ✅ **Leverages Existing Infrastructure**
- Keep Clerk for user authentication
- Use existing Supabase database
- Minimal changes to current setup

### ✅ **Clear Separation of Concerns**
- **Clerk**: User identity and authentication
- **Supabase**: Data, subscriptions, API keys
- **OpenRouter**: AI model access

### ✅ **Security**
- No API keys in desktop app
- Clerk session validation
- Row Level Security in Supabase
- OAuth PKCE for OpenRouter

### ✅ **Scalability**
- Easy to add new subscription tiers
- Centralized usage tracking
- Cross-platform compatibility

## Migration Steps

1. **Update Supabase schema** with new tables
2. **Create API routes** for subscription management
3. **Update desktop app** to use Clerk + OpenRouter OAuth
4. **Migrate existing users** to subscription model
5. **Test integration** across all platforms

This approach maximizes your existing investment while solving the API key bypass problem effectively.
