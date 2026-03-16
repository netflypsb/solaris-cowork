-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table for future use
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_user_id ON contact_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_user_id ON user_profiles(clerk_user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for contact_messages
-- Users can only see their own messages
CREATE POLICY "Users can view own contact messages" ON contact_messages
  FOR SELECT USING (auth.uid()::text = user_id);

-- Users can only insert their own messages
CREATE POLICY "Users can insert own contact messages" ON contact_messages
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own messages (if needed)
CREATE POLICY "Users can update own contact messages" ON contact_messages
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Create policies for user_profiles
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid()::text = clerk_user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = clerk_user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid()::text = clerk_user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_contact_messages_updated_at 
  BEFORE UPDATE ON contact_messages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- OpenRouter API keys provisioned for paid users (one per user)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  openrouter_key_hash VARCHAR(255) NOT NULL,
  openrouter_key_label VARCHAR(255),
  openrouter_key_full TEXT,
  key_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  credit_limit NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_api_keys_clerk_user_id ON user_api_keys(clerk_user_id);

ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

-- All access goes through server-side API routes using service_role key
CREATE POLICY "Service role full access" ON user_api_keys
  FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_user_api_keys_updated_at
  BEFORE UPDATE ON user_api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Stripe subscription tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_price_id VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'inactive',
  -- status: active, past_due, canceled, unpaid, incomplete, trialing
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_clerk_user_id ON subscriptions(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on subscriptions" ON subscriptions
  FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Desktop app one-time auth tokens
-- ============================================================
CREATE TABLE IF NOT EXISTS desktop_auth_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_desktop_auth_tokens_token ON desktop_auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_desktop_auth_tokens_expires ON desktop_auth_tokens(expires_at);

ALTER TABLE desktop_auth_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on desktop_auth_tokens" ON desktop_auth_tokens
  FOR ALL USING (true) WITH CHECK (true);

-- Function to delete expired/used tokens older than 1 hour
CREATE OR REPLACE FUNCTION cleanup_desktop_auth_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM desktop_auth_tokens
  WHERE expires_at < now() - INTERVAL '1 hour'
     OR used_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cron job to run cleanup every 30 minutes (requires pg_cron extension)
-- Run this manually in Supabase SQL editor:
-- SELECT cron.schedule('cleanup-desktop-tokens', '*/30 * * * *', 'SELECT cleanup_desktop_auth_tokens();');

-- ============================================================
-- Autogram tables (social discussion platform)
-- See: supabase/migrations/20260316_autogram_schema.sql
-- ============================================================
