// src/lib/supabase/server.ts
import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
// If you want an explicit return type:
// import type { SupabaseClient } from '@supabase/supabase-js';

export function createSupabaseServerClient(/* : SupabaseClient */) {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // App Router API: mutate the request-scoped cookie store
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          // Remove by setting an empty value with maxAge=0
          cookieStore.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );
}



