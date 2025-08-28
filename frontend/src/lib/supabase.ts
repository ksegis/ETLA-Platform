// src/lib/supabase.ts
import {
  createClient as createSupabaseClient,
  type SupabaseClient,
  type User as SupabaseUser,
  type Session,
} from "@supabase/supabase-js";

/**
 * Unified Supabase client exports for browser & server components.
 * - Named export  : createClient()  -> returns a singleton SupabaseClient
 * - Named export  : supabase       -> the same singleton instance
 * - Default export: supabase       -> default export for legacy imports
 * - Type exports  : User, Session, Tenant (project-local helper type)
 *
 * Env vars required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_TOKEN
 */

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_TOKEN!;

if (!URL || !ANON) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_TOKEN."
  );
}

let _client: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (_client) return _client;
  _client = createSupabaseClient(URL, ANON);
  return _client;
}

// Named instance export for places that do: `import { supabase } from '@/lib/supabase'`
export const supabase = createClient();

// Default export for places that do: `import supabase from '@/lib/supabase'`
export default supabase;

// ---- Type exports expected elsewhere in the app ----

// Upstream Supabase types
export type User = SupabaseUser;
export type { Session, SupabaseClient };

// Project-local helper type used by TenantContext and related code.
// Kept intentionally flexible to match existing usage across the app.
export type Tenant = {
  id?: string;
  customer_code?: string;   // common field name in this repo
  name?: string;
} | string | null;
