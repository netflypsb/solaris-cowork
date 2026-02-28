# OAuth Authentication Flow for Solaris Cowork

## Overview
Implement secure authentication using OpenRouter's OAuth PKCE flow, similar to Cursor and Windsurf.

## Architecture

### Web Platform Components
1. **User Management**
   - Registration/login system
   - Subscription tiers (Free, Pro, Enterprise)
   - User profile management

2. **OAuth Handler**
   - `/auth/openrouter` - Initiate OAuth flow
   - `/auth/callback` - Handle OAuth callback
   - `/auth/exchange` - Exchange code for API key

3. **Subscription Validation**
   - Validate user subscription status
   - Grant/restrict AI access based on tier
   - Usage monitoring and limits

### Desktop App Components
1. **Authentication Module**
   - OAuth flow initiation
   - Token storage and management
   - Session validation

2. **AI Access Control**
   - Subscription status checking
   - API key usage validation
   - Feature gating based on tier

## Implementation Steps

### Step 1: Web Platform Setup

#### 1.1 Register OAuth Application
```typescript
// Register with OpenRouter
const oauthConfig = {
  clientId: 'your-client-id',
  redirectUri: 'https://yourapp.com/auth/callback',
  scopes: ['api:read', 'api:write']
};
```

#### 1.2 OAuth Flow Handler
```typescript
// pages/api/auth/openrouter.ts
export default async function handler(req, res) {
  const { codeVerifier, codeChallenge } = generatePKCE();
  
  // Store code_verifier in session
  req.session.codeVerifier = codeVerifier;
  
  const authUrl = `https://openrouter.ai/auth?` +
    `callback_url=${encodeURIComponent(process.env.NEXTAUTH_URL + '/api/auth/callback')}&` +
    `code_challenge=${codeChallenge}&` +
    `code_challenge_method=S256`;
  
  res.redirect(authUrl);
}
```

#### 1.3 OAuth Callback Handler
```typescript
// pages/api/auth/callback.ts
export default async function handler(req, res) {
  const { code, state } = req.query;
  const { codeVerifier } = req.session;
  
  // Exchange code for API key
  const response = await fetch('https://openrouter.ai/api/v1/auth/keys', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      code,
      code_verifier: codeVerifier
    })
  });
  
  const { key } = await response.json();
  
  // Store user's API key
  await storeUserApiKey(req.user.id, key);
  
  res.redirect('/dashboard');
}
```

### Step 2: Desktop App Implementation

#### 2.1 Authentication Module
```typescript
// src/auth/AuthManager.ts
class AuthManager {
  async signIn(): Promise<void> {
    // Generate PKCE
    const { codeVerifier, codeChallenge } = generatePKCE();
    
    // Store code verifier securely
    await secureStore.set('codeVerifier', codeVerifier);
    
    // Open browser for OAuth
    const authUrl = `https://yourapp.com/auth/desktop?` +
      `code_challenge=${codeChallenge}&` +
      `redirect_uri=${encodeURIComponent('solaris://auth/callback')}`;
    
    await shell.openExternal(authUrl);
  }
  
  async handleCallback(code: string): Promise<void> {
    const codeVerifier = await secureStore.get('codeVerifier');
    
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, codeVerifier);
    
    // Store tokens securely
    await secureStore.set('accessToken', tokens.accessToken);
    await secureStore.set('refreshToken', tokens.refreshToken);
  }
}
```

#### 2.2 Subscription Validation
```typescript
// src/auth/SubscriptionManager.ts
class SubscriptionManager {
  async validateSubscription(): Promise<SubscriptionStatus> {
    const accessToken = await secureStore.get('accessToken');
    
    // Check subscription status
    const response = await fetch('https://yourapp.com/api/subscription', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    return await response.json();
  }
  
  async getApiKey(): Promise<string> {
    const status = await this.validateSubscription();
    
    if (!status.isActive) {
      throw new Error('Subscription required');
    }
    
    // Get user's OpenRouter API key
    return await this.getUserApiKey();
  }
}
```

### Step 3: Usage Monitoring

#### 3.1 Web Platform Monitoring
```typescript
// Monitor usage across all platforms
class UsageMonitor {
  async trackUsage(userId: string, usage: UsageData): Promise<void> {
    // Store usage in database
    await db.usage.create({
      data: {
        userId,
        tokens: usage.tokens,
        cost: usage.cost,
        timestamp: new Date()
      }
    });
    
    // Check subscription limits
    const subscription = await getSubscription(userId);
    const monthlyUsage = await getMonthlyUsage(userId);
    
    if (monthlyUsage > subscription.limits.monthlyTokens) {
      // Notify user or suspend access
      await notifyUser(userId, 'limit_reached');
    }
  }
}
```

#### 3.2 Desktop App Usage Tracking
```typescript
// Track usage from desktop app
class DesktopUsageTracker {
  async trackApiCall(model: string, tokens: number): Promise<void> {
    const usage = {
      model,
      tokens,
      timestamp: new Date(),
      platform: 'desktop'
    };
    
    // Send to web platform
    await fetch('https://yourapp.com/api/usage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await this.getAccessToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(usage)
    });
  }
}
```

## Security Considerations

### 1. Token Storage
- Use OS keychain (macOS), Credential Manager (Windows), or libsecret (Linux)
- Encrypt tokens at rest
- Implement token refresh mechanism

### 2. API Key Management
- Never expose management API keys in desktop app
- Use user-specific API keys from OAuth flow
- Implement key rotation policies

### 3. Subscription Validation
- Validate subscription on each app launch
- Check subscription status periodically
- Implement graceful degradation for expired subscriptions

## Benefits of This Approach

1. **Security**: No hardcoded API keys in desktop app
2. **User Experience**: One-click authentication
3. **Control**: Centralized subscription management
4. **Scalability**: Easy to add new features and tiers
5. **Analytics**: Complete usage visibility across platforms

## Migration Strategy

1. **Phase 1**: Implement web platform OAuth
2. **Phase 2**: Update desktop app authentication
3. **Phase 3**: Migrate existing users to new system
4. **Phase 4**: Deprecate old API key system
