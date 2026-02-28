# Desktop App Authentication Implementation

## Technology Stack

### Recommended Frameworks
- **Electron** with React/Vue for cross-platform desktop apps
- **Tauri** for Rust-based, more secure alternative
- **Flutter Desktop** for Dart-based development

### Security Libraries
- **Electron**: `keytar` for secure credential storage
- **Tauri**: Built-in secure storage
- **Node.js**: `node-keychain` for keychain access

## Implementation Details

### 1. Electron Implementation

#### Main Process Setup
```typescript
// src/main/auth.ts
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import * as crypto from 'crypto';
import * as keytar from 'keytar';

const SERVICE_NAME = 'solaris-cowork';
const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID;

class AuthManager {
  private mainWindow: BrowserWindow;
  
  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.setupIpcHandlers();
  }
  
  private setupIpcHandlers() {
    // Initiate OAuth flow
    ipcMain.handle('auth:signIn', async () => {
      return await this.signIn();
    });
    
    // Handle OAuth callback
    ipcMain.handle('auth:handleCallback', async (event, code: string) => {
      return await this.handleCallback(code);
    });
    
    // Get stored tokens
    ipcMain.handle('auth:getTokens', async () => {
      return await this.getStoredTokens();
    });
    
    // Check authentication status
    ipcMain.handle('auth:checkStatus', async () => {
      return await this.checkAuthStatus();
    });
    
    // Sign out
    ipcMain.handle('auth:signOut', async () => {
      return await this.signOut();
    });
  }
  
  async signIn(): Promise<void> {
    // Generate PKCE
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    
    // Store code verifier securely
    await keytar.setPassword(SERVICE_NAME, 'code_verifier', codeVerifier);
    
    // Build OAuth URL
    const authUrl = new URL('https://openrouter.ai/auth');
    authUrl.searchParams.set('callback_url', `https://yourapp.com/auth/desktop`);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    
    // Open system browser
    await shell.openExternal(authUrl.toString());
  }
  
  async handleCallback(code: string): Promise<{ success: boolean; error?: string }> {
    try {
      const codeVerifier = await keytar.getPassword(SERVICE_NAME, 'code_verifier');
      if (!codeVerifier) {
        throw new Error('Code verifier not found');
      }
      
      // Exchange code for tokens
      const response = await fetch('https://yourapp.com/api/auth/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, codeVerifier })
      });
      
      if (!response.ok) {
        throw new Error('Failed to exchange code');
      }
      
      const tokens = await response.json();
      
      // Store tokens securely
      await keytar.setPassword(SERVICE_NAME, 'access_token', tokens.accessToken);
      await keytar.setPassword(SERVICE_NAME, 'refresh_token', tokens.refreshToken);
      
      // Clean up code verifier
      await keytar.deletePassword(SERVICE_NAME, 'code_verifier');
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  async getStoredTokens(): Promise<{ accessToken?: string; refreshToken?: string }> {
    const accessToken = await keytar.getPassword(SERVICE_NAME, 'access_token');
    const refreshToken = await keytar.getPassword(SERVICE_NAME, 'refresh_token');
    
    return { accessToken, refreshToken };
  }
  
  async checkAuthStatus(): Promise<{ authenticated: boolean; subscription?: Subscription }> {
    const tokens = await this.getStoredTokens();
    
    if (!tokens.accessToken) {
      return { authenticated: false };
    }
    
    try {
      // Validate token and get subscription info
      const response = await fetch('https://yourapp.com/api/subscription', {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`
        }
      });
      
      if (response.ok) {
        const subscription = await response.json();
        return { authenticated: true, subscription };
      } else {
        // Token invalid, clean up
        await this.signOut();
        return { authenticated: false };
      }
    } catch (error) {
      return { authenticated: false };
    }
  }
  
  async signOut(): Promise<void> {
    await keytar.deletePassword(SERVICE_NAME, 'access_token');
    await keytar.deletePassword(SERVICE_NAME, 'refresh_token');
    await keytar.deletePassword(SERVICE_NAME, 'code_verifier');
  }
}
```

#### Renderer Process (React)
```typescript
// src/renderer/components/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  subscription?: Subscription;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [subscription, setSubscription] = useState<Subscription>();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  const checkAuthStatus = async () => {
    try {
      const status = await window.electronAPI.auth.checkStatus();
      setIsAuthenticated(status.authenticated);
      setSubscription(status.subscription);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const signIn = async () => {
    try {
      await window.electronAPI.auth.signIn();
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  };
  
  const signOut = async () => {
    try {
      await window.electronAPI.auth.signOut();
      setIsAuthenticated(false);
      setSubscription(undefined);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };
  
  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      subscription,
      signIn,
      signOut,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

#### OAuth Callback Handler
```typescript
// src/main/oauth-handler.ts
import { app, protocol } from 'electron';

// Register custom protocol for OAuth callback
app.setAsDefaultProtocolClient('solaris');

// Handle OAuth callback
app.on('open-url', (event, url) => {
  event.preventDefault();
  
  if (url.startsWith('solaris://auth/callback')) {
    const urlObj = new URL(url);
    const code = urlObj.searchParams.get('code');
    const error = urlObj.searchParams.get('error');
    
    if (code) {
      // Send code to renderer process
      BrowserWindow.getAllWindows()[0]?.webContents.send('auth:callback', { code });
    } else if (error) {
      BrowserWindow.getAllWindows()[0]?.webContents.send('auth:callback', { error });
    }
  }
});

// For Windows
app.on('second-instance', (event, commandLine, workingDirectory) => {
  const url = commandLine.find(arg => arg.startsWith('solaris://'));
  if (url) {
    handleOAuthCallback(url);
  }
});
```

### 2. Tauri Implementation (More Secure)

#### Rust Backend
```rust
// src-tauri/src/auth.rs
use tauri::{command, State};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use keyring::Entry;

#[derive(Debug, Serialize, Deserialize)]
struct AuthTokens {
    access_token: String,
    refresh_token: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct Subscription {
    tier: String,
    limits: UsageLimits,
    is_active: bool,
}

#[command]
async fn sign_in() -> Result<String, String> {
    // Generate PKCE
    let code_verifier: String = generate_random_string(32);
    let code_challenge = sha256(&code_verifier);
    
    // Store code verifier
    let entry = Entry::new("solaris-cowork", "code_verifier")
        .map_err(|e| e.to_string())?;
    entry.set_password(&code_verifier)
        .map_err(|e| e.to_string())?;
    
    // Build OAuth URL
    let auth_url = format!(
        "https://openrouter.ai/auth?callback_url=https://yourapp.com/auth/desktop&code_challenge={}&code_challenge_method=S256",
        code_challenge
    );
    
    Ok(auth_url)
}

#[command]
async fn handle_callback(code: String) -> Result<AuthTokens, String> {
    // Retrieve code verifier
    let entry = Entry::new("solaris-cowork", "code_verifier")
        .map_err(|e| e.to_string())?;
    let code_verifier = entry.get_password()
        .map_err(|e| e.to_string())?;
    
    // Exchange code for tokens
    let client = reqwest::Client::new();
    let response = client
        .post("https://yourapp.com/api/auth/exchange")
        .json(&serde_json::json!({
            "code": code,
            "codeVerifier": code_verifier
        }))
        .send()
        .await
        .map_err(|e| e.to_string())?;
    
    let tokens: AuthTokens = response.json()
        .await
        .map_err(|e| e.to_string())?;
    
    // Store tokens
    let access_entry = Entry::new("solaris-cowork", "access_token")
        .map_err(|e| e.to_string())?;
    access_entry.set_password(&tokens.access_token)
        .map_err(|e| e.to_string())?;
    
    let refresh_entry = Entry::new("solaris-cowork", "refresh_token")
        .map_err(|e| e.to_string())?;
    refresh_entry.set_password(&tokens.refresh_token)
        .map_err(|e| e.to_string())?;
    
    // Clean up code verifier
    entry.delete_password().ok();
    
    Ok(tokens)
}

#[command]
async fn check_auth_status() -> Result<(bool, Option<Subscription>), String> {
    let entry = Entry::new("solaris-cowork", "access_token")
        .map_err(|e| e.to_string())?;
    
    let access_token = match entry.get_password() {
        Ok(token) => token,
        Err(_) => return Ok((false, None)),
    };
    
    // Validate token and get subscription
    let client = reqwest::Client::new();
    let response = client
        .get("https://yourapp.com/api/subscription")
        .header("Authorization", format!("Bearer {}", access_token))
        .send()
        .await;
    
    match response {
        Ok(resp) => {
            if resp.status().is_success() {
                let subscription: Subscription = resp.json().await
                    .map_err(|e| e.to_string())?;
                Ok((true, Some(subscription)))
            } else {
                // Token invalid, clean up
                entry.delete_password().ok();
                Ok((false, None))
            }
        }
        Err(_) => Ok((false, None)),
    }
}
```

#### Frontend Integration
```typescript
// src-tauri/src/lib.rs
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Register custom protocol
            let url_scheme = "solaris".to_string();
            app.handle().plugin(tauri_plugin_deep_link::init())?;
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            sign_in,
            handle_callback,
            check_auth_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

## Security Best Practices

### 1. Token Storage
- Use OS keychain/credential manager
- Never store tokens in plain text
- Implement automatic token refresh

### 2. Code Verification
- Validate OAuth state parameter
- Use PKCE to prevent authorization code interception
- Verify callback URL matches expected format

### 3. Session Management
- Implement token expiration handling
- Secure token refresh mechanism
- Clean up tokens on sign out

### 4. Network Security
- Use HTTPS for all API calls
- Validate SSL certificates
- Implement request timeouts

## User Experience Flow

### 1. First-time User
1. User opens desktop app
2. Clicks "Sign In" button
3. System browser opens to OpenRouter OAuth
4. User authenticates with OpenRouter
5. Redirected to your web callback
6. Desktop app receives authorization code
7. Exchanges code for tokens
8. User is signed in and can use AI features

### 2. Returning User
1. App checks for stored tokens on launch
2. Validates tokens with web API
3. Shows subscription status
4. Enables features based on tier

### 3. Subscription Upgrade
1. User upgrades subscription on website
2. Desktop app detects change on next API call
3. New features become available immediately

## Error Handling

### Common Scenarios
```typescript
// Handle various authentication errors
const handleAuthError = (error: string) => {
  switch (error) {
    case 'subscription_required':
      showUpgradeDialog();
      break;
    case 'usage_limit_exceeded':
      showUsageLimitDialog();
      break;
    case 'token_expired':
      refreshToken();
      break;
    case 'invalid_credentials':
      forceReauthentication();
      break;
    default:
      showGenericError(error);
  }
};
```

This implementation provides a secure, user-friendly authentication system that prevents API key bypass while maintaining a smooth user experience similar to Cursor and Windsurf.
