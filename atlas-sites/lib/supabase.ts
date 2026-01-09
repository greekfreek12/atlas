import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client
export const createClient = () => {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
};

// Server-side Supabase client (for API routes)
export const createServerClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  return createSupabaseClient<Database>(
    supabaseUrl,
    serviceKey || supabaseAnonKey
  );
};

// Singleton for client-side use
let clientInstance: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  if (!clientInstance) {
    clientInstance = createClient();
  }
  return clientInstance;
};
