// src/lib/supabase.ts
import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Singleton browser-safe Supabase client.
 * Uses the public (anon) key. Works in both client & server components.
 * Required env vars:
 *  - NEXT_PUBLIC_SUPABASE_URL
 *  - NEXT_PUBLIC_SUPABASE_ANON_TOKEN
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_TOKEN!;

let _client: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (_client) return _client;

  if (!SUPABASE_URL || !SUPABASE_ANON) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_TOKEN env vars."
    );
  }

  _client = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON);
  return _client;
}

export type { SupabaseClient };
