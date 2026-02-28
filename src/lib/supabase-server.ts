import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side Supabase client using service role key
// This bypasses RLS — use ONLY in server-side API routes
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export interface UserApiKey {
  id: string;
  clerk_user_id: string;
  openrouter_key_hash: string;
  openrouter_key_label: string | null;
  key_name: string;
  is_active: boolean;
  credit_limit: number | null;
  created_at: string;
  updated_at: string;
}
